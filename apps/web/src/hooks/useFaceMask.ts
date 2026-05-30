"use client";

import { useEffect, useRef, useState } from "react";
import type { AvatarPreset } from "@/lib/avatar/presets";

/**
 * useFaceMask — the on-device Memoji pipeline.
 *
 *   camera  ──►  MediaPipe FaceLandmarker (52 ARKit blendshapes + head matrix)
 *           ──►  RPM glTF avatar rendered by Three.js (AvatarScene3D)
 *           ──►  canvas.captureStream(30)  ──►  WebRTC video out
 *
 * The user's real face never leaves the device.  The caller receives:
 *   videoStream  — the rendered avatar video (sent to remote peer via WebRTC)
 *   audioStream  — raw mic audio (caller applies voice transform before sending)
 *   isReady      — true once avatar + camera are up (show spinner until this)
 *   lightingWarning — true if no face detected for 3 s (bad lighting / framing)
 */

interface UseFaceMaskOptions {
  enabled:        boolean;
  preset:         AvatarPreset;
  previewCanvas?: HTMLCanvasElement | null; // local PIP canvas (2D blit)
}

// 384² keeps the avatar crisp at portrait size while cutting fragment-shader
// and video-encode cost ~45% vs 512² — important for low call latency.
const RENDER_W = 384;
const RENDER_H = 384;

export function useFaceMask({ enabled, preset, previewCanvas }: UseFaceMaskOptions) {
  const [videoStream,      setVideoStream]      = useState<MediaStream | null>(null);
  const [audioStream,      setAudioStream]      = useState<MediaStream | null>(null);
  const [isReady,          setIsReady]          = useState(false);
  const [lightingWarning,  setLightingWarning]  = useState(false);

  const sceneRef      = useRef<import("@/lib/avatar/AvatarScene3D").AvatarScene3D | null>(null);
  const landmarkerRef = useRef<any>(null);
  const realStreamRef = useRef<MediaStream | null>(null);
  const previewRef    = useRef<HTMLCanvasElement | null>(null);
  const lastFaceRef   = useRef(Date.now());
  const presetRef     = useRef(preset);

  presetRef.current  = preset;
  previewRef.current = previewCanvas ?? null;

  // ── Main pipeline init ────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let detectRaf = 0;
    let blitRaf   = 0;

    // Hidden video — feeds MediaPipe; never transmitted
    const video = document.createElement("video");
    video.autoplay = true; video.playsInline = true; video.muted = true;
    video.width = 640; video.height = 480;

    // Offscreen WebGL canvas — avatar renders here, captured for WebRTC
    const glCanvas = document.createElement("canvas");
    glCanvas.width = RENDER_W; glCanvas.height = RENDER_H;

    const init = async () => {
      // ── 1. Camera + mic ─────────────────────────────────────────
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      } catch (e) {
        console.error("[useFaceMask] camera denied:", e);
        return;
      }
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
      realStreamRef.current = stream;

      video.srcObject = new MediaStream(stream.getVideoTracks());
      await video.play().catch(() => {});

      // ── 2. Three.js avatar scene ─────────────────────────────────
      const [{ AvatarScene3D }, { specForPreset }] = await Promise.all([
        import("@/lib/avatar/AvatarScene3D"),
        import("@/lib/avatar/rpmConfig"),
      ]);
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

      const scene = new AvatarScene3D(glCanvas);
      sceneRef.current = scene;
      scene.start();

      // Load avatar without blocking — show ready sooner, face appears once loaded
      scene.loadAvatar(specForPreset(presetRef.current)).catch(console.warn);

      const avatarStream = scene.captureStream(24);
      // Hint the encoder this is smooth motion (a face), not detailed text —
      // lets it favour framerate/latency over per-frame detail.
      avatarStream.getVideoTracks().forEach(t => { try { (t as any).contentHint = "motion"; } catch {} });
      setVideoStream(avatarStream);
      setAudioStream(stream.getAudioTracks().length ? new MediaStream(stream.getAudioTracks()) : null);
      setIsReady(true);

      // ── 3. MediaPipe FaceLandmarker ──────────────────────────────
      // CPU delegate is the safe default — works on all browsers without COOP/COEP.
      // GPU delegate is faster but requires cross-origin isolation headers; we try
      // it first and fall back gracefully.
      try {
        const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
        const fileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm",
        );
        if (cancelled) return;

        const baseOpts = {
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: "VIDEO" as const,
          numFaces: 1,
        };

        for (const delegate of ["GPU", "CPU"] as const) {
          try {
            landmarkerRef.current = await FaceLandmarker.createFromOptions(fileset, {
              baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                delegate,
              },
              ...baseOpts,
            });
            console.info(`[useFaceMask] FaceLandmarker ready (${delegate})`);
            break;
          } catch (e) {
            console.warn(`[useFaceMask] ${delegate} delegate failed:`, e);
          }
        }
      } catch (e) {
        console.error("[useFaceMask] FaceLandmarker init error:", e);
      }

      // ── 4. Detection loop ────────────────────────────────────────
      // Throttled to 24 fps by wall-clock time. FaceLandmarker is the heaviest
      // CPU/GPU consumer; running it at 24 (vs 30) frees headroom for the video
      // encoder, which is the real source of call latency. The render loop
      // interpolates between detections so motion still looks smooth.
      let lastDetectMs = 0;
      const DETECT_INTERVAL = 1000 / 24;
      let warnState = false;

      const detect = () => {
        if (cancelled) return;
        detectRaf = requestAnimationFrame(detect);

        const lm  = landmarkerRef.current;
        const now = performance.now();
        if (!lm || video.readyState < 2 || now - lastDetectMs < DETECT_INTERVAL) return;
        lastDetectMs = now;

        try {
          const res = lm.detectForVideo(video, now);
          sceneRef.current?.applyResult(res);
          if (res?.faceBlendshapes?.[0]?.categories?.length) lastFaceRef.current = Date.now();
        } catch { /* transient gl context error — ignore */ }

        const warn = Date.now() - lastFaceRef.current > 3000;
        if (warn !== warnState) { warnState = warn; setLightingWarning(warn); }
      };
      detect();

      // ── 5. Preview blit (avatar → local PIP canvas) ──────────────
      // Throttled to ~15 fps — the small local thumbnail doesn't need full
      // framerate, and skipping frames keeps the main thread free for encode.
      let lastBlitMs = 0;
      const BLIT_INTERVAL = 1000 / 15;
      const blit = () => {
        if (cancelled) return;
        blitRaf = requestAnimationFrame(blit);
        const now = performance.now();
        if (now - lastBlitMs < BLIT_INTERVAL) return;
        lastBlitMs = now;
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

  // ── Hot-swap avatar when preset changes (no camera restart) ──────
  useEffect(() => {
    const scene = sceneRef.current;
    if (!enabled || !scene) return;
    let active = true;
    import("@/lib/avatar/rpmConfig").then(({ specForPreset }) => {
      if (active) scene.loadAvatar(specForPreset(preset)).catch(console.warn);
    });
    return () => { active = false; };
  }, [preset, enabled]);

  return { videoStream, audioStream, isReady, lightingWarning };
}
