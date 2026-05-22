"use client";

import { useEffect, useRef, useState } from "react";
import { drawChromeMask } from "@/lib/mediapipe/faceRenderer";

interface UseFaceMaskOptions {
  sourceVideo: HTMLVideoElement | null;
  outputCanvas: HTMLCanvasElement | null;
  enabled: boolean;
}

export function useFaceMask({ sourceVideo, outputCanvas, enabled }: UseFaceMaskOptions) {
  const [maskedStream, setMaskedStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);

  const faceMeshRef   = useRef<any>(null);
  const animFrameRef  = useRef<number>(0);
  const landmarksRef  = useRef<Array<{ x: number; y: number; z: number }> | null>(null);
  const sendTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sourceVideo || !outputCanvas || !enabled) {
      setMaskedStream(null);
      setIsReady(false);
      return;
    }

    let cancelled = false;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    // Render loop: video frame + chrome mask on top
    const drawLoop = () => {
      if (cancelled) return;
      animFrameRef.current = requestAnimationFrame(drawLoop);

      const vw = sourceVideo.videoWidth;
      const vh = sourceVideo.videoHeight;
      if (!vw || !vh || sourceVideo.readyState < 2) return;

      if (outputCanvas.width !== vw)  outputCanvas.width  = vw;
      if (outputCanvas.height !== vh) outputCanvas.height = vh;

      ctx.drawImage(sourceVideo, 0, 0, vw, vh);

      if (landmarksRef.current) {
        drawChromeMask(ctx, landmarksRef.current, vw, vh);
      }
    };

    // Detection loop: send frames to FaceMesh at ~15fps (detection is CPU-heavy)
    const detectLoop = async () => {
      if (cancelled || !faceMeshRef.current) return;
      if (sourceVideo.readyState >= 2) {
        await faceMeshRef.current.send({ image: sourceVideo }).catch(() => {});
      }
      sendTimerRef.current = setTimeout(detectLoop, 66); // ~15fps
    };

    const init = async () => {
      const { FaceMesh } = await import("@mediapipe/face_mesh");
      if (cancelled) return;

      const faceMesh = new FaceMesh({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        landmarksRef.current =
          results.multiFaceLandmarks?.length > 0
            ? results.multiFaceLandmarks[0]
            : null;
      });

      faceMeshRef.current = faceMesh;
      if (cancelled) return;

      setMaskedStream(outputCanvas.captureStream(30));
      setIsReady(true);

      drawLoop();
      detectLoop();
    };

    init().catch(console.error);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
      faceMeshRef.current?.close();
      faceMeshRef.current  = null;
      landmarksRef.current = null;
      setIsReady(false);
      setMaskedStream(null);
    };
  }, [sourceVideo, outputCanvas, enabled]);

  return { maskedStream, isReady };
}
