"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceLandmarks } from "@/lib/mediapipe/faceRenderer";

interface UseFaceMaskOptions {
  enabled: boolean;
}

/**
 * useFaceMask — captures camera, runs MediaPipe FaceMesh, and returns:
 *   - audioStream: mic audio only (video never leaves the device)
 *   - landmarksRef: latest 478-point face landmarks (face + iris)
 *   - isReady: true once camera + MediaPipe are both initialised
 *   - lightingWarning: true if no face detected for 3+ seconds
 *
 * The 3D avatar is rendered separately by AvatarCanvas3D which reads
 * directly from landmarksRef without any React re-renders.
 */
export function useFaceMask({ enabled }: UseFaceMaskOptions) {
  const [audioStream,    setAudioStream]    = useState<MediaStream | null>(null);
  const [isReady,        setIsReady]        = useState(false);
  const [lightingWarning, setLightingWarning] = useState(false);

  const faceMeshRef     = useRef<any>(null);
  const animFrameRef    = useRef<number>(0);
  const landmarksRef    = useRef<FaceLandmarks | null>(null);
  const sendTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sendingRef      = useRef(false);
  const realStreamRef   = useRef<MediaStream | null>(null);
  const lastFaceTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled) {
      setAudioStream(null);
      setIsReady(false);
      setLightingWarning(false);
      return;
    }

    let cancelled = false;

    // Hidden video element feeds MediaPipe (never shown to user)
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    // Lighting-warning timer: checks every frame if face was seen recently
    const warnLoop = () => {
      if (cancelled) return;
      animFrameRef.current = requestAnimationFrame(warnLoop);
      if (video.readyState >= 2) {
        setLightingWarning(Date.now() - lastFaceTimeRef.current > 3000);
      }
    };

    const detectLoop = async () => {
      if (cancelled || !faceMeshRef.current) return;
      if (video.readyState >= 2 && !sendingRef.current) {
        sendingRef.current = true;
        try { await faceMeshRef.current.send({ image: video }); } catch { /* ignore */ }
        finally { sendingRef.current = false; }
      }
      if (!cancelled) sendTimerRef.current = setTimeout(detectLoop, 100); // ~10 fps detection
    };

    const init = async () => {
      let realStream: MediaStream;
      try {
        realStream = await navigator.mediaDevices.getUserMedia({
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

      // Only video goes to hidden element; audio returned directly
      video.srcObject = new MediaStream(realStream.getVideoTracks());
      await video.play().catch(() => {});
      if (cancelled) return;

      // Try loading MediaPipe
      try {
        const { FaceMesh } = await import("@mediapipe/face_mesh");
        if (cancelled) return;

        const fm = new FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}`,
        });
        fm.setOptions({
          maxNumFaces:            1,
          refineLandmarks:        true,   // 478 points: 468 face + 10 iris
          minDetectionConfidence: 0.5,
          minTrackingConfidence:  0.5,
        });
        fm.onResults((results: any) => {
          const lm = results.multiFaceLandmarks?.[0] ?? null;
          landmarksRef.current = lm;
          if (lm) lastFaceTimeRef.current = Date.now();
        });
        faceMeshRef.current = fm;
      } catch (e) {
        console.warn("[useFaceMask] MediaPipe failed:", e);
      }
      if (cancelled) return;

      // Audio-only stream for P2P (video never transmitted)
      const audio = new MediaStream(realStream.getAudioTracks());
      setAudioStream(audio.getTracks().length > 0 ? audio : null);
      setIsReady(true);

      animFrameRef.current = requestAnimationFrame(warnLoop);
      if (faceMeshRef.current) detectLoop();
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
      setAudioStream(null);
      setLightingWarning(false);
    };
  }, [enabled]);

  return { audioStream, isReady, landmarksRef, lightingWarning };
}
