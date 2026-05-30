"use client";

import { useEffect, useRef, useState } from "react";
import { drawAvatarFace, AVATARS, type AvatarConfig } from "@/lib/mediapipe/faceRenderer";

interface UseFaceMaskOptions {
  enabled: boolean;
  avatarId?: number;
  outputCanvas: HTMLCanvasElement | null;
}

export function useFaceMask({ enabled, avatarId = 1, outputCanvas }: UseFaceMaskOptions) {
  const [maskedStream, setMaskedStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [lightingWarning, setLightingWarning] = useState(false);

  const faceMeshRef    = useRef<any>(null);
  const animFrameRef   = useRef<number>(0);
  const landmarksRef   = useRef<Array<{ x: number; y: number; z: number }> | null>(null);
  const sendTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingRef     = useRef(false);
  const realStreamRef  = useRef<MediaStream | null>(null);
  const avatarRef      = useRef<AvatarConfig>(AVATARS[0]);
  const lastFaceTimeRef = useRef<number>(Date.now());

  // Swap avatar without re-initialising MediaPipe
  useEffect(() => {
    avatarRef.current = AVATARS.find(a => a.id === avatarId) ?? AVATARS[0];
  }, [avatarId]);

  useEffect(() => {
    if (!enabled || !outputCanvas) {
      setMaskedStream(null);
      setIsReady(false);
      return;
    }

    let cancelled = false;
    const ctx = outputCanvas.getContext("2d");
    if (!ctx) return;

    // Hidden video element that receives the real camera feed
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    let lastDraw = 0;
    const drawLoop = (ts: number) => {
      if (cancelled) return;
      animFrameRef.current = requestAnimationFrame(drawLoop);
      if (ts - lastDraw < 42) return; // ~24 fps cap

      lastDraw = ts;
      setLightingWarning(Date.now() - lastFaceTimeRef.current > 3000);
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh || video.readyState < 2) return;

      if (outputCanvas.width !== vw)  outputCanvas.width  = vw;
      if (outputCanvas.height !== vh) outputCanvas.height = vh;

      ctx.drawImage(video, 0, 0, vw, vh);
      if (landmarksRef.current) {
        drawAvatarFace(ctx, landmarksRef.current, vw, vh, avatarRef.current);
      }
    };

    const detectLoop = async () => {
      if (cancelled || !faceMeshRef.current) return;
      if (video.readyState >= 2 && !sendingRef.current) {
        sendingRef.current = true;
        try {
          await faceMeshRef.current.send({ image: video });
        } catch { /* ignore */ } finally {
          sendingRef.current = false;
        }
      }
      if (!cancelled) sendTimerRef.current = setTimeout(detectLoop, 150); // ~7 fps detection
    };

    const init = async () => {
      const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);

      let realStream: MediaStream;
      try {
        realStream = await gum({
          video: {
            facingMode: "user",
            width:     { ideal: 640, max: 1280 },
            height:    { ideal: 480, max: 720  },
            frameRate: { ideal: 24,  max: 30   },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl:  true,
            channelCount:     1,
            sampleRate:       48000,
          },
        });
      } catch (e) {
        console.error("[useFaceMask] camera denied:", e);
        return;
      }
      if (cancelled) { realStream.getTracks().forEach(t => t.stop()); return; }
      realStreamRef.current = realStream;

      video.srcObject = new MediaStream(realStream.getVideoTracks());
      await video.play().catch(() => {});
      if (cancelled) return;

      // Try loading MediaPipe; fall back to raw camera if it fails
      let mediaPipeLoaded = false;
      try {
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
          const lm = results.multiFaceLandmarks?.[0] ?? null;
          landmarksRef.current = lm;
          if (lm) lastFaceTimeRef.current = Date.now();
        });

        faceMeshRef.current = faceMesh;
        mediaPipeLoaded = true;
      } catch (e) {
        console.warn("[useFaceMask] MediaPipe failed, using raw camera:", e);
      }
      if (cancelled) return;

      // Ensure canvas has valid dimensions before captureStream —
      // a 0×0 canvas produces an invalid/black video track
      if (!outputCanvas.width || outputCanvas.width < 4)  outputCanvas.width  = 640;
      if (!outputCanvas.height || outputCanvas.height < 4) outputCanvas.height = 480;
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

      // Canvas stream = masked video; real audio tracks for sound
      const canvasStream = outputCanvas.captureStream(24);
      const combined = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...realStream.getAudioTracks(),
      ]);

      setMaskedStream(combined);
      setIsReady(true);

      // Start render loop (draws raw video even without MediaPipe, avatar overlay when available)
      animFrameRef.current = requestAnimationFrame(drawLoop);
      if (mediaPipeLoaded) detectLoop();
    };

    init().catch(console.error);

    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrameRef.current);
      if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
      faceMeshRef.current?.close();
      faceMeshRef.current = null;
      landmarksRef.current = null;
      realStreamRef.current?.getTracks().forEach(t => t.stop());
      realStreamRef.current = null;
      setIsReady(false);
      setMaskedStream(null);
      setLightingWarning(false);
    };
  }, [enabled, outputCanvas]); // eslint-disable-line react-hooks/exhaustive-deps

  return { maskedStream, isReady, landmarksRef, lightingWarning };
}
