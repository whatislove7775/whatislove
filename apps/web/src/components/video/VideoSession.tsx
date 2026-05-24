"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useCallSession } from "@/hooks/useCallSession";
import { useAmbientSound, type AmbientPreset } from "@/hooks/useAmbientSound";
import { SessionNotepad } from "@/components/session/SessionNotepad";
import { BreathingSync } from "@/components/session/BreathingSync";

interface VideoSessionProps {
  roomId: string;
  role:   "client" | "psychologist";
  onEnd?: () => void;
}

export function VideoSession({ roomId, role, onEnd }: VideoSessionProps) {
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const displayName = role === "psychologist" ? "Психолог" : "Клиент";

  const { status, isMuted, isCameraOff, hasRemote, initContainer, toggleMute, toggleCamera, hangUp } =
    useCallSession({ roomId, displayName, onEnd });

  const ambient = useAmbientSound(null);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [resetHideTimer]);

  const handleHangUp = () => {
    ambient.setEnabled(false);
    hangUp();
  };

  const stateColor = status === "connected" && hasRemote ? "#31B557"
    : status === "failed"       ? "#E53935"
    : status === "reconnecting" ? "#F9A825"
    : "#8D9AA3";

  const stateLabel = status === "failed"        ? "Соединение разорвано"
    : status === "reconnecting"                 ? "Переподключение..."
    : status === "loading" || status === "idle" ? "Подключение..."
    : hasRemote                                 ? "Соединение установлено"
    : role === "client"                         ? "Ожидание психолога..."
    : "Ожидание клиента...";

  return (
    <div
      style={{ position: "relative", width: "100vw", height: "100vh", background: "#0E1621", overflow: "hidden", cursor: showControls ? "default" : "none" }}
      onMouseMove={resetHideTimer}
    >
      {/* Jitsi IFrame renders here */}
      <div
        ref={initContainer}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />

      {/* Spinner while waiting for remote */}
      {!hasRemote && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px", zIndex: 5, pointerEvents: "none" }}>
          <div style={{ width: "48px", height: "48px", border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#8D9AA3", fontSize: "15px", fontFamily: "var(--font)" }}>{stateLabel}</p>
        </div>
      )}

      {/* Status bar */}
      <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(23,33,43,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(43,58,76,0.8)", borderRadius: "var(--radius-full)", padding: "6px 16px", zIndex: 10, transition: "opacity 0.3s", opacity: showControls ? 1 : 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: stateColor }} />
        <span style={{ fontSize: "13px", color: "#8D9AA3", fontFamily: "var(--font)" }}>{stateLabel}</span>
      </div>

      {/* Right-side buttons */}
      <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "10px", transition: "opacity 0.3s", opacity: showControls ? 1 : 0, zIndex: 20 }}>
        <SessionNotepad roomId={roomId} />
        <BreathingSync />
        <button
          onClick={() => ambient.setEnabled((e: boolean) => !e)}
          title={ambient.enabled ? "Выключить звуки природы" : "Включить звуки природы"}
          style={{ width: 44, height: 44, borderRadius: "50%", background: ambient.enabled ? "var(--accent)" : "rgba(23,33,43,0.9)", border: "1px solid var(--border)", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
          {ambient.enabled ? "🌿" : "🔕"}
        </button>
        <button
          onClick={() => setShowSettings(s => !s)}
          style={{ width: 44, height: 44, borderRadius: "50%", background: showSettings ? "var(--bg-elevated)" : "rgba(23,33,43,0.9)", border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
          ⚙️
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div style={{ position: "absolute", right: "72px", top: "50%", transform: "translateY(-50%)", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px", zIndex: 30, width: "220px", boxShadow: "var(--shadow-lg)" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "14px", color: "var(--text-secondary)" }}>Настройки</div>
          {ambient.enabled && (
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Звуки природы</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                {(["rain", "forest", "ocean"] as AmbientPreset[]).map(p => (
                  <button key={p} onClick={() => ambient.setPreset(p)}
                    style={{ padding: "6px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", background: ambient.preset === p ? "var(--accent)" : "var(--bg-elevated)", border: "1px solid var(--border)", color: ambient.preset === p ? "#fff" : "var(--text-secondary)", fontFamily: "var(--font)" }}>
                    {p === "rain" ? "🌧 Дождь" : p === "forest" ? "🌲 Лес" : "🌊 Океан"}
                  </button>
                ))}
              </div>
              <input type="range" min={0} max={1} step={0.05} value={ambient.volume}
                onChange={e => ambient.setVolume(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }} />
            </div>
          )}
        </div>
      )}

      {/* Bottom controls */}
      <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px", alignItems: "center", transition: "opacity 0.3s", opacity: showControls ? 1 : 0, zIndex: 20 }}>
        <button onClick={toggleMute} title={isMuted ? "Включить микрофон" : "Выключить микрофон"}
          style={{ width: 48, height: 48, borderRadius: "50%", cursor: "pointer", background: isMuted ? "var(--bg-elevated)" : "rgba(23,33,43,0.85)", border: `1px solid ${isMuted ? "var(--border-hover)" : "var(--border)"}`, color: isMuted ? "var(--text)" : "var(--text-secondary)", fontSize: "18px", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isMuted ? "🔇" : "🎤"}
        </button>
        <button onClick={toggleCamera} title={isCameraOff ? "Включить камеру" : "Выключить камеру"}
          style={{ width: 48, height: 48, borderRadius: "50%", cursor: "pointer", background: isCameraOff ? "var(--bg-elevated)" : "rgba(23,33,43,0.85)", border: `1px solid ${isCameraOff ? "var(--border-hover)" : "var(--border)"}`, color: isCameraOff ? "var(--text)" : "var(--text-secondary)", fontSize: "18px", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isCameraOff ? "📷" : "📹"}
        </button>
        <button onClick={handleHangUp}
          style={{ width: 56, height: 56, borderRadius: "50%", cursor: "pointer", background: "var(--danger)", border: "none", color: "#fff", fontSize: "20px", boxShadow: "0 4px 16px rgba(229,57,53,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ✕
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
