"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "inhale" | "hold" | "exhale" | "rest";

const CYCLE: { phase: Phase; dur: number; label: string }[] = [
  { phase: "inhale", dur: 4000, label: "Вдох"  },
  { phase: "hold",   dur: 4000, label: "Держи" },
  { phase: "exhale", dur: 6000, label: "Выдох" },
  { phase: "rest",   dur: 2000, label: "..."   },
];

export function BreathingSync() {
  const [active,  setActive]  = useState(false);
  const [phase,   setPhase]   = useState(0);
  const [scale,   setScale]   = useState(1);
  const [progress, setProgress] = useState(0);
  const timerRef  = useRef<ReturnType<typeof setTimeout>>();
  const rafRef    = useRef<number>();
  const startRef  = useRef<number>(0);

  const tick = (phaseIdx: number) => {
    const cur  = CYCLE[phaseIdx];
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(elapsed / cur.dur, 1);
      setProgress(p);

      const targetScale = cur.phase === "inhale" ? 1.6
        : cur.phase === "hold"   ? 1.6
        : cur.phase === "exhale" ? 1.0
        : 1.0;
      const fromScale = cur.phase === "inhale" ? 1.0
        : cur.phase === "hold"   ? 1.6
        : cur.phase === "exhale" ? 1.6
        : 1.0;
      setScale(fromScale + (targetScale - fromScale) * easeInOut(p));

      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    timerRef.current = setTimeout(() => {
      const next = (phaseIdx + 1) % CYCLE.length;
      setPhase(next);
      tick(next);
    }, cur.dur);
  };

  useEffect(() => {
    if (active) { setPhase(0); tick(0); }
    else {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current!);
      setScale(1); setProgress(0);
    }
    return () => { clearTimeout(timerRef.current); cancelAnimationFrame(rafRef.current!); };
  }, [active]);

  const cur = CYCLE[phase];

  const circleColor = cur.phase === "inhale" ? "#2481CC"
    : cur.phase === "hold"   ? "#31B557"
    : cur.phase === "exhale" ? "#8D9AA3"
    : "#5A6A7A";

  if (!active) return (
    <button
      onClick={() => setActive(true)}
      style={{
        width: 44, height: 44, borderRadius: "50%",
        background: "rgba(23,33,43,0.9)", border: "1px solid var(--border)",
        color: "var(--text-secondary)", fontSize: "18px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
      title="Дыхательный синхронизатор"
    >🫁</button>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(15,20,28,0.92)", backdropFilter: "blur(16px)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      {/* Outer ring progress */}
      <svg width="240" height="240" style={{ position: "absolute" }}>
        <circle cx="120" cy="120" r="108" fill="none" stroke="var(--border)" strokeWidth="2" />
        <circle
          cx="120" cy="120" r="108" fill="none"
          stroke={circleColor} strokeWidth="2"
          strokeDasharray={`${2 * Math.PI * 108}`}
          strokeDashoffset={`${2 * Math.PI * 108 * (1 - progress)}`}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "120px 120px", transition: "stroke 0.5s" }}
        />
      </svg>

      {/* Breathing circle */}
      <div style={{
        width: 100, height: 100, borderRadius: "50%",
        background: `radial-gradient(circle, ${circleColor}55 0%, ${circleColor}22 70%, transparent 100%)`,
        border: `2px solid ${circleColor}`,
        transform: `scale(${scale})`,
        transition: "background 0.5s, border-color 0.5s",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: circleColor, opacity: 0.8 }} />
      </div>

      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <div style={{ fontSize: "22px", fontWeight: 600, color: circleColor, transition: "color 0.5s", marginBottom: "8px" }}>
          {cur.label}
        </div>
        <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>4–4–6 дыхание · снижает тревогу</div>
      </div>

      <button
        onClick={() => setActive(false)}
        className="btn btn-ghost"
        style={{ marginTop: "36px", borderRadius: "var(--radius-full)" }}
      >
        Завершить
      </button>
    </div>
  );
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
