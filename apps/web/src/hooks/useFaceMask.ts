"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useFaceMask — the on-device Memoji pipeline.
 *
 *   camera  →  MediaPipe FaceLandmarker (52 ARKit blendshapes + head pose)
 *           →  Ready Player Me glTF avatar (Three.js, rendered locally)
 *           →  canvas.captureStream()  →  WebRTC video out
 *
 * The user's real video never leaves the device — only the rendered avatar
 * is transmitted, preserving anonymity. Returns the avatar video stream and
 * the raw mic audio separately so the caller can apply voice transformation
 * before sending.
 */
interface UseFaceMaskOptions {
  enabled:        boolean;
  avatarSeed:     string;
  /** Visible local-preview canvas (2D) the avatar is blitted into. */
  previewCanvas?: HTMLCanvasElement | null;
}

// Internal render resolution for the transmitted avatar video.
const RENDER_W = 480;
const RENDER_H = 480;

export function useFaceMask({ enabled, avatarSeed, previewCanvas }: UseFaceMaskOptions) {
  const [videoStream,     setVideoStream]     = useState<MediaStream | null>(null);
  const [audioStream,     setAudioStream]     = useState<MediaStream | null>(null);
  const [isReady,         setIsReady]         = useState(false);
  const [lightingWarning, setLightingWarning] = useState(false);

  const sceneRef       = useRef<import("@/lib/avatar/AvatarScene3D").AvatarScene3D | null>(null);
  const landmarkerRef  = useRef<any>(null);
  const realStreamRef  = useRef<MediaStream | null>(null);
  const previewRef     = useRef<HTMLCanvasElement | null>(null);
  const lastFaceRef    = useRef<number>(Date.now());
  const seedRef        = useRef(avatarSeed);

  seedRef.current = avatarSeed;
  previewRef.current = previewCanvas ?? null;

  // ── Main pipeline: camera + MediaPipe + Three.js scene ───────────
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let detectRaf = 0;
    let blitRaf = 0;
    let lastVideoTime = -1;

    // Hidden video element feeds MediaPipe (never shown / transmitted)
    const video = document.createElement("video");
    video.autoplay = true; video.playsInline = true; video.muted = true;

    // Offscreen canvas the avatar renders into and we capture from.
    const glCanvas = document.createElement("canvas");
    glCanvas.width = RENDER_W; glCanvas.height = RENDER_H;

    const init = async () => {
      // 1) Camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
        });
      } catch (e) {
        console.error("[useFaceMask] camera denied:", e);
        return;
      }
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
      realStreamRef.current = stream;
      video.srcObject = new MediaStream(stream.getVideoTracks());
      await video.play().catch(() => {});

      // 2) Three.js avatar scene + capture stream
      const { AvatarScene3D } = await import("@/lib/avatar/AvatarScene3D");
      const { specForSeed }   = await import("@/lib/avatar/rpmConfig");
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
      const scene = new AvatarScene3D(glCanvas);
      sceneRef.current = scene;
      scene.start();
      await scene.loadAvatar(specForSeed(seedRef.current));

      setVideoStream(scene.captureStream(30));
      setAudioStream(stream.getAudioTracks().length ? new MediaStream(stream.getAudioTracks()) : null);

      // 3) MediaPipe FaceLandmarker (ARKit blendshapes + head matrix)
      // GPU delegate is faster but fails silently on many browsers — always fall back to CPU.
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
        );
        if (cancelled) return;
        const modelOpts = (delegate: "GPU" | "CPU") => ({
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate,
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO" as const,
          numFaces: 1,
        });
        try {
          landmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, modelOpts("GPU"));
        } catch {
          console.warn("[useFaceMask] GPU delegate failed, falling back to CPU");
          landmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, modelOpts("CPU"));
        }
      } catch (e) {
        console.error("[useFaceMask] FaceLandmarker init failed:", e);
      }

      setIsReady(true);

      // 4) Detection loop — feeds the scene target state
      let warningState = false;
      const detect = () => {
        if (cancelled) return;
        detectRaf = requestAnimationFrame(detect);
        const lm = landmarkerRef.current;
        if (!lm || video.readyState < 2 || video.currentTime === lastVideoTime) return;
        lastVideoTime = video.currentTime;
        try {
          const res = lm.detectForVideo(video, performance.now());
          sceneRef.current?.applyResult(res);
          if (res?.faceBlendshapes?.length) lastFaceRef.current = Date.now();
        } catch { /* transient — ignore */ }
        // Only update React state when the value actually changes (avoid per-frame renders).
        const w = Date.now() - lastFaceRef.current > 3000;
        if (w !== warningState) { warningState = w; setLightingWarning(w); }
      };
      detect();

      // 5) Preview blit — copy the avatar into the small visible canvas
      const blit = () => {
        if (cancelled) return;
        blitRaf = requestAnimationFrame(blit);
        const pc = previewRef.current;
        const gl = sceneRef.current?.domElement;
        if (!pc || !gl) return;
        const ctx = pc.getContext("2d");
        if (ctx) ctx.drawImage(gl, 0, 0, pc.width, pc.height);
      };
      blit();
    };

    init().catch(console.error);

    return () => {
      cancelled = true;
      cancelAnimationFrame(detectRaf);
      cancelAnimationFrame(blitRaf);
      landmarkerRef.current?.close?.();
      landmarkerRef.current = null;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      realStreamRef.current?.getTracks().forEach(t => t.stop());
      realStreamRef.current = null;
      setVideoStream(null);
      setAudioStream(null);
      setIsReady(false);
      setLightingWarning(false);
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hot-swap avatar when the seed changes (no camera restart) ────
  useEffect(() => {
    if (!enabled || !sceneRef.current) return;
    let active = true;
    import("@/lib/avatar/rpmConfig").then(({ specForSeed }) => {
      if (active) sceneRef.current?.loadAvatar(specForSeed(avatarSeed));
    });
    return () => { active = false; };
  }, [avatarSeed, enabled]);

  return { videoStream, audioStream, isReady, lightingWarning };
}
