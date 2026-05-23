/**
 * useFaceMask — хук, который:
 * 1. Инициализирует MediaPipe FaceMesh
 * 2. Запускает трекинг лица на каждом кадре
 * 3. Рендерит WebGL-маску на canvas поверх видео
 * 4. Возвращает MediaStream с наложенной маской для WebRTC
 */
"use client";

import { useEffect, useRef, useCallback } from "react";
import type { FaceMeshResult } from "@/lib/mediapipe/faceRenderer";

interface UseFaceMaskOptions {
  sourceVideo: HTMLVideoElement | null;
  outputCanvas: HTMLCanvasElement | null;
  enabled: boolean;
}

interface UseFaceMaskReturn {
  maskedStream: MediaStream | null;
  isReady: boolean;
}

export function useFaceMask({
  sourceVideo,
  outputCanvas,
  enabled,
}: UseFaceMaskOptions): UseFaceMaskReturn {
  const faceMeshRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const maskedStreamRef = useRef<MediaStream | null>(null);
  const isReadyRef = useRef(false);

  const processFrame = useCallback(async () => {
    if (!sourceVideo || !faceMeshRef.current || !enabled) return;
    if (sourceVideo.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }
    await faceMeshRef.current.send({ image: sourceVideo });
    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [sourceVideo, enabled]);

  useEffect(() => {
    if (!sourceVideo || !outputCanvas || !enabled) return;

    let cancelled = false;

    const init = async () => {
      // Динамический импорт — MediaPipe загружается только при необходимости
      const { FaceMesh } = await import("@mediapipe/face_mesh");
      const { FaceMaskRenderer } = await import("@/lib/mediapipe/faceRenderer");

      if (cancelled) return;

      rendererRef.current = new FaceMaskRenderer(outputCanvas);

      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,    // 478 точек включая ирис
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      // Контекст canvas для миксинга: исходный кадр + маска
      const ctx = outputCanvas.getContext("2d");

      faceMesh.onResults((results: FaceMeshResult) => {
        if (!ctx || cancelled) return;

        outputCanvas.width = sourceVideo.videoWidth;
        outputCanvas.height = sourceVideo.videoHeight;

        // 1. Рисуем оригинальный видеокадр (без лица)
        ctx.drawImage(sourceVideo, 0, 0, outputCanvas.width, outputCanvas.height);

        // 2. Поверх — WebGL маска (если лицо обнаружено)
        if (results.multiFaceLandmarks.length > 0) {
          rendererRef.current.render(results.multiFaceLandmarks[0]);
          // Смешиваем WebGL canvas с 2D canvas
          ctx.drawImage(outputCanvas, 0, 0);
        }
      });

      faceMeshRef.current = faceMesh;
      isReadyRef.current = true;

      // Захватываем поток из canvas для WebRTC
      maskedStreamRef.current = outputCanvas.captureStream(30);

      // Запускаем цикл обработки кадров
      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    init().catch(console.error);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      faceMeshRef.current?.close();
      rendererRef.current?.dispose();
      faceMeshRef.current = null;
      rendererRef.current = null;
      isReadyRef.current = false;
    };
  }, [sourceVideo, outputCanvas, enabled, processFrame]);

  return {
    maskedStream: maskedStreamRef.current,
    isReady: isReadyRef.current,
  };
}
