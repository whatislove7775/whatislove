"use client";

import { useEffect, useRef } from "react";
import type { FaceLandmarks } from "@/lib/mediapipe/faceRenderer";

interface Props {
  landmarksRef: { current: FaceLandmarks | null };
  avatarSeed:   string;
  style?:       React.CSSProperties;
  className?:   string;
  /** Canvas pixel dimensions (default 640×560) */
  width?:  number;
  height?: number;
}

/**
 * AvatarCanvas3D — mounts a Three.js scene on a <canvas> element.
 *
 * Three.js and AvatarScene3D are dynamically imported so they never
 * run during SSR.  The render loop runs at native RAF speed (~60fps)
 * and reads landmarks directly from the ref, so no React state updates
 * are needed per frame.
 */
export function AvatarCanvas3D({ landmarksRef, avatarSeed, style, className, width = 640, height = 560 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let scene: import("@/lib/avatar/AvatarScene3D").AvatarScene3D | null = null;

    // Dynamic import keeps Three.js out of SSR bundle
    Promise.all([
      import("@/lib/avatar/AvatarScene3D"),
      import("@/lib/avatar/AvatarDNA"),
    ]).then(([{ AvatarScene3D }, { generateDNA }]) => {
      if (cancelled) return;
      const dna = generateDNA(avatarSeed);
      scene = new AvatarScene3D(canvas, dna);
      scene.setLandmarksSource(landmarksRef);
      scene.start();
    }).catch(err => {
      console.error("[AvatarCanvas3D] failed to load Three.js scene:", err);
    });

    // Handle parent resize
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(entries => {
        const e = entries[0];
        if (e && scene) scene.resize(e.contentRect.width, e.contentRect.height);
      });
      ro.observe(canvas.parentElement ?? canvas);
    }

    cleanupRef.current = () => {
      cancelled = true;
      ro?.disconnect();
      scene?.dispose();
      scene = null;
    };

    return () => { cleanupRef.current?.(); cleanupRef.current = null; };
  }, [avatarSeed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
      className={className}
    />
  );
}
