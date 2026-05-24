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

function MaskIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      <defs>
        <linearGradient id="mg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4DA6FF"/>
          <stop offset="55%" stopColor="#8B6CF8"/>
          <stop offset="100%" stopColor="#FF7B7B"/>
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="22" rx="19" ry="21" fill="url(#mg)"/>
      <ellipse cx="13" cy="19" rx="4.5" ry="3.5" fill="rgba(0,0,0,0.7)"/>
      <ellipse cx="27" cy="19" rx="4.5" ry="3.5" fill="rgba(0,0,0,0.7)"/>
      <rect x="14" y="28" width="12" height="4" rx="2" fill="rgba(0,0,0,0.7)"/>
    </svg>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function VideoSession({ roomId, role, onEnd }: VideoSessionProps) {
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const elapsedTimer = useRef<ReturnType<typeof setInterval>>();

  const displayName = role === "psychologist" ? "Психолог" : "Клиент";

  const { status, isMuted, isCameraOff, hasRemote, initContainer, toggleMute, toggleCamera, hangUp } =
    useCallSession({ roomId, displayName, onEnd });

  const ambient = useAmbientSound(null);

  // Start timer when connected with remote
  useEffect(() => {
    if (hasRemote) {
      elapsedTimer.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(elapsedTimer.current);
    }
    return () => clearInterval(elapsedTimer.current);
  }, [hasRemote]);

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

  const isConnected = status === "connected";
  const isLoading   = status === "loading" || status === "idle";
  const isFailed    = status === "failed";

  const stateLabel = isFailed          ? "Соединение разорвано"
    : status === "reconnecting"        ? "Переподключение..."
    : isLoading                        ? "Подключение..."
    : hasRemote                        ? "Соединение активно"
    : role === "client"                ? "Ожидание специалиста..."
    : "Ожидание клиента...";

  const dotColor = isConnected && hasRemote ? "#31D97B"
    : isFailed        ? "#FF4D4D"
    : status === "reconnecting" ? "#F59E0B"
    : "#8A9BB8";

  return (
    <div
      style={{
        position: "relative", width: "100vw", height: "100vh",
        background: "#0C0F1A", overflow: "hidden",
        cursor: showControls ? "default" : "none",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
      onMouseMove={resetHideTimer}
    >
      {/* ── Jitsi iframe fills background ── */}
      <div
        ref={initContainer}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />

      {/* ── Gradient corner vignettes (branding layer) ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(12,15,26,0.7) 0%, transparent 18%, transparent 75%, rgba(12,15,26,0.85) 100%)",
      }} />

      {/* ── Waiting state ── */}
      {(!isConnected || !hasRemote) && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: "20px", pointerEvents: "none",
          background: "rgba(12,15,26,0.85)", backdropFilter: "blur(2px)",
        }}>
          {isLoading || status === "reconnecting" ? (
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              border: "2px solid rgba(77,166,255,0.3)",
              borderTopColor: "#4DA6FF",
              animation: "spin 1s linear infinite",
            }}/>
          ) : (
            <MaskIcon size={48} />
          )}
          <p style={{ color: "#8A9BB8", fontSize: "15px", letterSpacing: "0.01em" }}>
            {stateLabel}
          </p>
          {isFailed && (
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 20px", borderRadius: "8px",
                background: "rgba(77,166,255,0.15)", border: "1px solid rgba(77,166,255,0.3)",
                color: "#4DA6FF", fontSize: "13px", cursor: "pointer",
                fontFamily: "Inter, sans-serif", pointerEvents: "auto",
              }}
            >
              Переподключиться
            </button>
          )}
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: "56px",
        transition: "opacity 0.35s ease",
        opacity: showControls ? 1 : 0,
        pointerEvents: showControls ? "auto" : "none",
      }}>
        {/* Left: brand + status */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MaskIcon size={18} />
            <span style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.01em", color: "#F0F4FF" }}>
              aprosop
            </span>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: "rgba(12,15,26,0.6)", backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9999px",
            padding: "4px 12px",
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: dotColor,
              boxShadow: `0 0 6px ${dotColor}`,
              animation: isConnected && hasRemote ? "pulse-glow 2s infinite" : "none",
            }}/>
            <span style={{ fontSize: "12px", color: "#8A9BB8" }}>{stateLabel}</span>
            {hasRemote && (
              <span style={{ fontSize: "12px", color: "#4A5A72", borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "10px", marginLeft: "4px" }}>
                {formatTime(elapsed)}
              </span>
            )}
          </div>
        </div>

        {/* Right: privacy badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(12,15,26,0.6)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: "9999px",
          padding: "4px 12px",
        }}>
          <span style={{ fontSize: "11px", color: "#31D97B" }}>●</span>
          <span style={{ fontSize: "11px", color: "#4A5A72", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>
            REC-ATTEMPT: BLOCKED
          </span>
        </div>
      </div>

      {/* ── RIGHT PANEL (psychologist emotion sidebar placeholder) ── */}
      {role === "psychologist" && hasRemote && (
        <div style={{
          position: "absolute", right: "20px", top: "76px", bottom: "100px",
          width: "220px", zIndex: 10,
          transition: "opacity 0.35s ease",
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? "auto" : "none",
          display: "flex", flexDirection: "column", gap: "10px",
        }}>
          <div style={{
            background: "rgba(12,15,26,0.75)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px",
            padding: "16px", flex: 1,
          }}>
            <div style={{ fontSize: "10px", color: "#4A5A72", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
              EMOTION GRID
            </div>
            {[
              { label: "Тревога",    val: 68, color: "#FF4D4D" },
              { label: "Спокойствие",val: 43, color: "#4DA6FF" },
              { label: "Грусть",     val: 71, color: "#8B6CF8" },
              { label: "Любопытство",val: 32, color: "#31D97B" },
            ].map(e => (
              <div key={e.label} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#8A9BB8" }}>{e.label}</span>
                  <span style={{ fontSize: "12px", color: e.color, fontFamily: "JetBrains Mono, monospace" }}>{e.val}</span>
                </div>
                <div style={{ height: "3px", background: "rgba(255,255,255,0.06)", borderRadius: "9999px" }}>
                  <div style={{ height: "100%", width: `${e.val}%`, background: e.color, borderRadius: "9999px", opacity: 0.8 }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SIDE BUTTONS (non-psychologist sidebar controls) ── */}
      <div style={{
        position: "absolute",
        right: role === "psychologist" && hasRemote ? "250px" : "20px",
        top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: "8px",
        zIndex: 20,
        transition: "opacity 0.35s ease",
        opacity: showControls ? 1 : 0,
        pointerEvents: showControls ? "auto" : "none",
      }}>
        <SessionNotepad roomId={roomId} />
        <BreathingSync />
        <button
          onClick={() => ambient.setEnabled((e: boolean) => !e)}
          title={ambient.enabled ? "Выключить звуки природы" : "Включить звуки природы"}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: ambient.enabled ? "rgba(77,166,255,0.2)" : "rgba(12,15,26,0.75)",
            border: `1px solid ${ambient.enabled ? "rgba(77,166,255,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: "#F0F4FF", fontSize: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(12px)",
          }}>
          {ambient.enabled ? "🌿" : "🔕"}
        </button>
        <button
          onClick={() => setShowSettings(s => !s)}
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: showSettings ? "rgba(139,108,248,0.2)" : "rgba(12,15,26,0.75)",
            border: `1px solid ${showSettings ? "rgba(139,108,248,0.4)" : "rgba(255,255,255,0.08)"}`,
            color: "#F0F4FF", fontSize: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(12px)",
          }}>
          ⚙
        </button>
      </div>

      {/* ── SETTINGS PANEL ── */}
      {showSettings && (
        <div style={{
          position: "absolute",
          right: role === "psychologist" && hasRemote ? "300px" : "70px",
          top: "50%", transform: "translateY(-50%)",
          background: "rgba(12,15,26,0.9)", backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px",
          padding: "18px", zIndex: 30, width: "210px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
        }}>
          <div style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5A72", marginBottom: "14px" }}>
            Настройки
          </div>
          {ambient.enabled && (
            <div>
              <div style={{ fontSize: "11px", color: "#4A5A72", marginBottom: "8px" }}>Звуки природы</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px" }}>
                {(["rain", "forest", "ocean"] as AmbientPreset[]).map(p => (
                  <button key={p} onClick={() => ambient.setPreset(p)}
                    style={{
                      padding: "6px 8px", borderRadius: "8px", fontSize: "11px", cursor: "pointer",
                      background: ambient.preset === p ? "rgba(77,166,255,0.2)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${ambient.preset === p ? "rgba(77,166,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                      color: ambient.preset === p ? "#4DA6FF" : "#8A9BB8",
                      fontFamily: "Inter, sans-serif",
                    }}>
                    {p === "rain" ? "🌧 Дождь" : p === "forest" ? "🌲 Лес" : "🌊 Океан"}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: "11px", color: "#4A5A72", marginBottom: "6px" }}>Громкость</div>
              <input type="range" min={0} max={1} step={0.05} value={ambient.volume}
                onChange={e => ambient.setVolume(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#4DA6FF" }} />
            </div>
          )}
        </div>
      )}

      {/* ── BOTTOM CONTROLS ── */}
      <div style={{
        position: "absolute", bottom: "28px", left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: "10px", alignItems: "center",
        zIndex: 20,
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: showControls ? 1 : 0,
        pointerEvents: showControls ? "auto" : "none",
      }}>
        {/* Mic */}
        <button
          onClick={toggleMute}
          title={isMuted ? "Включить микрофон" : "Выключить микрофон"}
          style={{
            width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
            background: isMuted ? "rgba(255,77,77,0.15)" : "rgba(12,15,26,0.75)",
            border: `1px solid ${isMuted ? "rgba(255,77,77,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: isMuted ? "#FF4D4D" : "#F0F4FF",
            fontSize: "18px", backdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease",
          }}>
          {isMuted ? "🔇" : "🎤"}
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          title={isCameraOff ? "Включить камеру" : "Выключить камеру"}
          style={{
            width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
            background: isCameraOff ? "rgba(255,77,77,0.15)" : "rgba(12,15,26,0.75)",
            border: `1px solid ${isCameraOff ? "rgba(255,77,77,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: isCameraOff ? "#FF4D4D" : "#F0F4FF",
            fontSize: "18px", backdropFilter: "blur(16px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease",
          }}>
          {isCameraOff ? "📷" : "📹"}
        </button>

        {/* Mask toggle (decorative) */}
        <button
          title="AI-маска активна"
          style={{
            width: 48, height: 48, borderRadius: "50%", cursor: "default",
            background: "rgba(77,166,255,0.12)",
            border: "1px solid rgba(77,166,255,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(16px)",
          }}>
          <MaskIcon size={20} />
        </button>

        {/* Hang up */}
        <button
          onClick={handleHangUp}
          title="Завершить"
          style={{
            width: 56, height: 56, borderRadius: "50%", cursor: "pointer",
            background: "linear-gradient(135deg, #FF4D4D, #CC2929)",
            border: "none", color: "#fff",
            fontSize: "18px",
            boxShadow: "0 4px 20px rgba(255,77,77,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
