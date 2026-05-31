"use client";

import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { useP2PCall }    from "@/hooks/useP2PCall";
import { useFaceMask }   from "@/hooks/useFaceMask";
import { useVoiceTransform, type VoicePreset } from "@/hooks/useVoiceTransform";
import { useAmbientSound, type AmbientPreset } from "@/hooks/useAmbientSound";
import { SessionNotepad } from "@/components/session/SessionNotepad";
import { BreathingSync }  from "@/components/session/BreathingSync";
import { AVATAR_PRESETS, presetSwatch, type AvatarPreset } from "@/lib/avatar/presets";

interface VideoSessionProps {
  roomId: string;
  role:   "client" | "psychologist";
  onEnd?: () => void;
}

function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

// ─── Avatar swatch — shows skin + hair disc with preset name ─────────────────
function PresetSwatch({ preset, size, selected, onClick }: {
  preset: AvatarPreset; size: number; selected: boolean; onClick?: () => void;
}) {
  const c = presetSwatch(preset);
  return (
    <button
      onClick={onClick}
      title={preset.name}
      style={{
        width: size, height: size, borderRadius: "50%", cursor: "pointer",
        padding: 0, border: `3px solid ${selected ? "#4DA6FF" : "rgba(255,255,255,0.12)"}`,
        background: "transparent",
        boxShadow: selected ? "0 0 14px rgba(77,166,255,0.55)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.18s ease", flexShrink: 0,
      }}
    >
      {/* Disc: upper half = hair colour, lower half = skin colour */}
      <div style={{
        width: size - 8, height: size - 8, borderRadius: "50%", overflow: "hidden",
        background: c.skin,
        boxShadow: "inset 0 0 4px rgba(0,0,0,0.18)",
      }}>
        <div style={{
          width: "100%", height: "48%",
          background: c.hair,
          borderRadius: "100% 100% 0 0 / 80% 80% 0 0",
        }}/>
      </div>
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function MicIcon({ muted }: { muted: boolean }) {
  return muted ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
      <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}

function CamIcon({ off }: { off: boolean }) {
  return off ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06A4 4 0 1 1 7.28 7.28"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7 16 12 23 17V7z"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  );
}

function PhoneOffIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 1 1 0 0 1-.2-.15M5 3a2 2 0 0 0-2 2v3c0 1.05.81 1.93 1.85 2a12.84 12.84 0 0 0 .65 2.57"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function MaskIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      <defs><linearGradient id="mgi2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4DA6FF"/>
        <stop offset="55%" stopColor="#8B6CF8"/>
        <stop offset="100%" stopColor="#FF7B7B"/>
      </linearGradient></defs>
      <ellipse cx="20" cy="22" rx="19" ry="21" fill="url(#mgi2)"/>
      <ellipse cx="13" cy="19" rx="4.5" ry="3.5" fill="rgba(0,0,0,0.7)"/>
      <ellipse cx="27" cy="19" rx="4.5" ry="3.5" fill="rgba(0,0,0,0.7)"/>
      <rect x="14" y="28" width="12" height="4" rx="2" fill="rgba(0,0,0,0.7)"/>
    </svg>
  );
}

function LogoIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      <defs><linearGradient id="lggi2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4DA6FF"/>
        <stop offset="55%" stopColor="#8B6CF8"/>
        <stop offset="100%" stopColor="#FF7B7B"/>
      </linearGradient></defs>
      <ellipse cx="20" cy="22" rx="19" ry="21" fill="url(#lggi2)"/>
      <ellipse cx="13" cy="19" rx="4.5" ry="3.5" fill="rgba(0,0,0,0.7)"/>
      <ellipse cx="27" cy="19" rx="4.5" ry="3.5" fill="rgba(0,0,0,0.7)"/>
      <rect x="14" y="28" width="12" height="4" rx="2" fill="rgba(0,0,0,0.7)"/>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function VideoSession({ roomId, role, onEnd }: VideoSessionProps) {
  const [started,      setStarted]      = useState(false);
  const [presetIdx,    setPresetIdx]    = useState(() => Math.floor(Math.random() * AVATAR_PRESETS.length));
  const [voicePreset,  setVoicePreset]  = useState<VoicePreset>("off");
  const [showPicker,   setShowPicker]   = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotepad,  setShowNotepad]  = useState(false);
  const [showBreath,   setShowBreath]   = useState(false);

  const hideTimerRef      = useRef<ReturnType<typeof setTimeout>>();
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const ambient = useAmbientSound(null);

  const activePreset = AVATAR_PRESETS[presetIdx] ?? AVATAR_PRESETS[0];

  // ── On-device Memoji pipeline ────────────────────────────────────
  const { videoStream, audioStream, isReady: maskReady, lightingWarning, avatarCanvas } = useFaceMask({
    enabled: started,
    preset:  activePreset,
  });

  // ── Voice masking (browser AudioContext — no server) ─────────────
  const { transformedStream } = useVoiceTransform({ inputStream: audioStream, preset: voicePreset });

  // ── Compose stream: avatar video + masked audio ──────────────────
  const localStream = useMemo(() => {
    if (!videoStream) return null;
    const audio = transformedStream?.getAudioTracks() ?? audioStream?.getAudioTracks() ?? [];
    return new MediaStream([...videoStream.getVideoTracks(), ...audio]);
  }, [videoStream, transformedStream, audioStream]);

  // ── P2P WebRTC ───────────────────────────────────────────────────
  const {
    status, isMuted, isCameraOff, hasRemote, elapsed,
    remoteVideoRef, toggleMute, toggleCamera, hangUp, retryNow,
  } = useP2PCall({ roomId, localStream, onEnd });

  // ── Auto-hide controls ───────────────────────────────────────────
  const resetHide = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 4500);
  }, []);

  useEffect(() => {
    if (!started) return;
    resetHide();
    return () => clearTimeout(hideTimerRef.current);
  }, [started, resetHide]);

  useEffect(() => {
    if (!showControls) { setShowPicker(false); setShowSettings(false); }
  }, [showControls]);

  // Mount the WebGL canvas directly into the preview container.
  // Skips the blit-to-2D step which fails silently on Safari with KTX2 textures.
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container || !avatarCanvas) return;
    Object.assign(avatarCanvas.style, {
      width: "100%", height: "100%", display: "block", borderRadius: "16px",
    });
    container.appendChild(avatarCanvas);
    return () => { if (avatarCanvas.parentNode === container) container.removeChild(avatarCanvas); };
  }, [avatarCanvas]);

  const handleHangUp = () => { ambient.setEnabled(false); hangUp(); };

  // ── Derived status ───────────────────────────────────────────────
  const isCameraLoading = started && !maskReady;
  const isWaiting       = status === "waiting";
  const isFailed        = status === "failed";
  const isReconnecting  = status === "reconnecting";
  const isConnected     = status === "connected";

  const stateLabel =
    isCameraLoading           ? "Запуск аватара…"
    : status === "connecting" ? "Соединение…"
    : isWaiting && role === "client" ? "Ожидание специалиста…"
    : isWaiting               ? "Ожидание клиента…"
    : isReconnecting          ? "Восстановление связи…"
    : isFailed                ? "Соединение прервано"
    : hasRemote               ? "Соединение активно"
    : "";

  const dotColor =
    isConnected && hasRemote ? "#31D97B"
    : isFailed               ? "#FF4D4D"
    : isReconnecting         ? "#F59E0B"
    : "#F59E0B";

  const showSpinner = isCameraLoading || status === "connecting" || isWaiting || isReconnecting;

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "relative", width: "100vw", height: "100dvh",
      background: "#0A0D18", overflow: "hidden",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>

      {/* ── REMOTE VIDEO — full-screen background ─────────────── */}
      <video ref={remoteVideoRef} autoPlay playsInline style={{
        position: "absolute", inset: 0, zIndex: 1,
        width: "100%", height: "100%",
        objectFit: "contain",   // was "cover" — cover crops a square stream to landscape, hiding forehead/hair
        background: "#0A0D18",
      }}/>

      {/* ── Vignette ──────────────────────────────────────────── */}
      {started && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(10,13,24,0.72) 0%, transparent 18%, transparent 70%, rgba(10,13,24,0.88) 100%)",
        }}/>
      )}

      {/* ═══════════════════════════════════════════════════════
          PRE-SESSION SCREEN
      ════════════════════════════════════════════════════════════ */}
      {!started && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#0A0D18",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
            <LogoIcon size={34} />
            <span style={{ fontSize: 24, fontWeight: 700, color: "#F0F4FF", letterSpacing: "-0.02em" }}>
              aprosop
            </span>
          </div>

          <div style={{
            background: "rgba(14,18,32,0.85)", backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
            padding: "28px 32px", width: 360, marginBottom: 20,
          }}>
            <div style={{ fontSize: 11, color: "#4A5A72", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 18 }}>
              Выберите анонимный аватар
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 10 }}>
              {AVATAR_PRESETS.map((p, i) => (
                <PresetSwatch key={p.id} preset={p} size={44} selected={presetIdx === i}
                  onClick={() => setPresetIdx(i)} />
              ))}
            </div>

            {/* Selected preset name */}
            <div style={{
              textAlign: "center", fontSize: 13, color: "#8A9BB8",
              marginBottom: 18, fontWeight: 500,
            }}>
              {activePreset.name}
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(77,166,255,0.06)",
              border: "1px solid rgba(77,166,255,0.15)",
              borderRadius: 10, padding: "10px 14px",
            }}>
              <MaskIcon size={18} />
              <span style={{ fontSize: 12, color: "#8A9BB8", lineHeight: 1.5 }}>
                Специалист видит ваш 3D-аватар, не настоящее лицо
              </span>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#4A5A72", marginBottom: 26, fontFamily: "JetBrains Mono, monospace" }}>
            {role === "psychologist" ? "Комната специалиста" : "Анонимная сессия"} · {roomId.slice(0, 8)}…
          </div>

          <button
            onClick={() => setStarted(true)}
            style={{
              padding: "15px 52px", borderRadius: 13, cursor: "pointer",
              background: "linear-gradient(135deg, #4DA6FF 0%, #8B6CF8 100%)",
              border: "none", color: "#fff",
              fontSize: 16, fontWeight: 600, fontFamily: "inherit",
              boxShadow: "0 6px 28px rgba(77,166,255,0.38)",
              transition: "transform 0.18s ease, box-shadow 0.18s ease",
              letterSpacing: "-0.01em",
            }}
            onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1.04)", boxShadow: "0 10px 38px rgba(77,166,255,0.55)" })}
            onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)", boxShadow: "0 6px 28px rgba(77,166,255,0.38)" })}
          >
            Начать сессию
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 20 }}>
            <span style={{ fontSize: 11, color: "#31D97B" }}>●</span>
            <span style={{ fontSize: 11, color: "#4A5A72", fontFamily: "JetBrains Mono, monospace" }}>END-TO-END ENCRYPTED · P2P</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          IN-CALL UI
      ════════════════════════════════════════════════════════════ */}
      {started && (
        <div
          style={{ position: "absolute", inset: 0, zIndex: 10, cursor: showControls ? "default" : "none" }}
          onMouseMove={resetHide}
          onTouchStart={resetHide}
        >
          <div
            style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: showControls ? "none" : "auto" }}
            onMouseMove={resetHide} onTouchStart={resetHide}
          />

          {/* ── LOCAL PREVIEW — WebGL canvas mounted imperatively ── */}
          <div
            ref={previewContainerRef}
            style={{
              position: "absolute", bottom: 90, right: 16, zIndex: 15,
              width: 160, height: 160, borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "linear-gradient(155deg,#151d2e 0%,#0a0f1c 100%)",
              overflow: "hidden",
              opacity: maskReady ? 1 : 0.35,
              transition: "opacity 0.5s ease",
            }}
          />

          {/* ── LIGHTING WARNING ──────────────────────────────── */}
          {lightingWarning && maskReady && (
            <div style={{
              position: "absolute", bottom: 258, right: 16, zIndex: 16,
              width: 160, textAlign: "center",
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 8, padding: "5px 8px",
            }}>
              <span style={{ fontSize: 11, color: "#F59E0B", lineHeight: 1.35 }}>
                Лицо не распознано — проверьте освещение
              </span>
            </div>
          )}

          {/* ── STATUS OVERLAY ────────────────────────────────── */}
          {showSpinner && !isFailed && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 20,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 18,
              background: "rgba(10,13,24,0.84)", backdropFilter: "blur(4px)",
              pointerEvents: "none",
            }}>
              <div style={{
                width: 54, height: 54, borderRadius: "50%",
                border: "2px solid rgba(77,166,255,0.2)",
                borderTopColor: "#4DA6FF",
                animation: "spin 1.1s linear infinite",
              }}/>
              <p style={{ color: "#8A9BB8", fontSize: 15, margin: 0 }}>{stateLabel}</p>
              {isWaiting && (
                <p style={{ color: "#4A5A72", fontSize: 12, margin: 0, maxWidth: 260, textAlign: "center" }}>
                  Ожидание подключения второго участника
                </p>
              )}
            </div>
          )}

          {/* ── FAILED OVERLAY ────────────────────────────────── */}
          {isFailed && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 20,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 22,
              background: "rgba(10,13,24,0.88)", backdropFilter: "blur(6px)",
            }}>
              <LogoIcon size={48} />
              <p style={{ color: "#8A9BB8", fontSize: 15, margin: 0 }}>Соединение прервано</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={retryNow} style={actionBtn("#4DA6FF")}>Попробовать снова</button>
                <button onClick={onEnd}    style={actionBtn("#8A9BB8", true)}>Выйти</button>
              </div>
            </div>
          )}

          {/* ── RECONNECTING TOAST ────────────────────────────── */}
          {isReconnecting && (
            <div style={{
              position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)",
              zIndex: 30, whiteSpace: "nowrap",
              background: "rgba(10,13,24,0.88)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(245,158,11,0.35)", borderRadius: 9999,
              padding: "6px 18px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B", animation: "pulseDot 1s ease-in-out infinite" }}/>
              <span style={{ fontSize: 12, color: "#F59E0B" }}>Восстановление связи…</span>
            </div>
          )}

          {/* ── TOP BAR ───────────────────────────────────────── */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 25,
            height: 56, display: "flex", alignItems: "center",
            justifyContent: "space-between", padding: "0 16px",
            transition: "opacity 0.35s ease",
            opacity: showControls ? 1 : 0, pointerEvents: showControls ? "auto" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <LogoIcon size={16} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#F0F4FF", letterSpacing: "-0.01em" }}>aprosop</span>
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "rgba(10,13,24,0.72)", backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9999,
                padding: "4px 12px",
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: dotColor, boxShadow: `0 0 6px ${dotColor}`,
                  animation: hasRemote ? "pulseDot 2s ease-in-out infinite" : "none",
                }}/>
                <span style={{ fontSize: 12, color: "#8A9BB8" }}>{stateLabel}</span>
                {hasRemote && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.08)", fontSize: 12 }}>|</span>
                    <span style={{ fontSize: 12, color: "#4A5A72", fontVariantNumeric: "tabular-nums" }}>{fmt(elapsed)}</span>
                  </>
                )}
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(10,13,24,0.72)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(49,217,123,0.2)", borderRadius: 9999,
              padding: "4px 12px",
            }}>
              <span style={{ fontSize: 11, color: "#31D97B" }}>●</span>
              <span style={{ fontSize: 11, color: "#4A5A72", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>P2P · ENCRYPTED</span>
            </div>
          </div>

          {/* ── LEFT SIDE BUTTONS ─────────────────────────────── */}
          <div style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", gap: 8, zIndex: 25,
            transition: "opacity 0.35s ease",
            opacity: showControls ? 1 : 0, pointerEvents: showControls ? "auto" : "none",
          }}>
            <button onClick={() => { setShowNotepad(s => !s); setShowBreath(false); }}
              title="Заметки" style={sideBtn(showNotepad, "#4DA6FF")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
            <button onClick={() => { setShowBreath(s => !s); setShowNotepad(false); }}
              title="Дыхание" style={sideBtn(showBreath, "#31D97B")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
              </svg>
            </button>
            <button onClick={() => ambient.setEnabled((e: boolean) => !e)}
              title={ambient.enabled ? "Выкл. звуки" : "Звуки природы"}
              style={sideBtn(ambient.enabled, "#8B6CF8")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </button>
            <button onClick={() => setShowPicker(s => !s)} title="Аватар" style={sideBtn(showPicker, "#8B6CF8")}>
              <MaskIcon size={18} />
            </button>
            <button onClick={() => setShowSettings(s => !s)} title="Настройки" style={sideBtn(showSettings, "#8A9BB8")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>

          {/* ── FLOATING PANELS ───────────────────────────────── */}
          {showNotepad && <div style={floatingPanel("left", 70)}><SessionNotepad roomId={roomId} /></div>}
          {showBreath  && <div style={floatingPanel("left", 70)}><BreathingSync /></div>}

          {showPicker && (
            <div style={floatingPanel("left", 70)}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5A72", marginBottom: 14 }}>
                Ваш аватар
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {AVATAR_PRESETS.map((p, i) => (
                  <button key={p.id} onClick={() => { setPresetIdx(i); setShowPicker(false); }}
                    style={{
                      padding: "10px 6px", borderRadius: 12, cursor: "pointer",
                      border: `2px solid ${presetIdx === i ? "#4DA6FF" : "rgba(255,255,255,0.08)"}`,
                      background: presetIdx === i ? "rgba(77,166,255,0.12)" : "rgba(255,255,255,0.04)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      fontFamily: "inherit", transition: "all 0.18s ease",
                    }}>
                    <PresetSwatch preset={p} size={36} selected={presetIdx === i} />
                    <span style={{ fontSize: 10, color: presetIdx === i ? "#4DA6FF" : "#8A9BB8" }}>
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showSettings && (
            <div style={floatingPanel("left", 70)}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5A72", marginBottom: 14 }}>
                Настройки
              </div>
              <div style={{ fontSize: 11, color: "#4A5A72", marginBottom: 8 }}>Голос</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
                {(["off", "lower", "higher"] as VoicePreset[]).map(p => (
                  <button key={p} onClick={() => setVoicePreset(p)}
                    style={{
                      padding: "6px 4px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                      background: voicePreset === p ? "rgba(139,108,248,0.2)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${voicePreset === p ? "rgba(139,108,248,0.45)" : "rgba(255,255,255,0.06)"}`,
                      color: voicePreset === p ? "#B49CFF" : "#8A9BB8", fontFamily: "inherit",
                    }}>
                    {p === "off" ? "Обычный" : p === "lower" ? "Ниже" : "Выше"}
                  </button>
                ))}
              </div>
              {ambient.enabled && (
                <>
                  <div style={{ fontSize: 11, color: "#4A5A72", marginBottom: 8 }}>Звуки природы</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 10 }}>
                    {(["rain", "forest", "ocean"] as AmbientPreset[]).map(p => (
                      <button key={p} onClick={() => ambient.setPreset(p)}
                        style={{
                          padding: "6px 4px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                          background: ambient.preset === p ? "rgba(77,166,255,0.18)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${ambient.preset === p ? "rgba(77,166,255,0.4)" : "rgba(255,255,255,0.06)"}`,
                          color: ambient.preset === p ? "#4DA6FF" : "#8A9BB8", fontFamily: "inherit",
                        }}>
                        {p === "rain" ? "Дождь" : p === "forest" ? "Лес" : "Океан"}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "#4A5A72", marginBottom: 6 }}>Громкость</div>
                  <input type="range" min={0} max={1} step={0.05} value={ambient.volume}
                    onChange={e => ambient.setVolume(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#4DA6FF" }}/>
                </>
              )}
            </div>
          )}

          {/* ── BOTTOM CONTROLS ───────────────────────────────── */}
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 10, zIndex: 25,
            transition: "opacity 0.35s ease",
            opacity: showControls ? 1 : 0, pointerEvents: showControls ? "auto" : "none",
          }}>
            <CtrlBtn active={isMuted}     activeColor="#FF4D4D" onClick={toggleMute}   title={isMuted     ? "Включить микрофон" : "Выключить микрофон"}>
              <MicIcon muted={isMuted} />
            </CtrlBtn>
            <CtrlBtn active={isCameraOff} activeColor="#FF4D4D" onClick={toggleCamera} title={isCameraOff ? "Включить камеру" : "Выключить камеру"}>
              <CamIcon off={isCameraOff} />
            </CtrlBtn>
            <button
              onClick={handleHangUp}
              title="Завершить звонок"
              style={{
                width: 58, height: 58, borderRadius: "50%", cursor: "pointer",
                background: "linear-gradient(135deg, #FF4D4D 0%, #CC2929 100%)",
                border: "none", color: "#fff",
                boxShadow: "0 4px 22px rgba(255,77,77,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1.1)", boxShadow: "0 6px 30px rgba(255,77,77,0.55)" })}
              onMouseLeave={e => Object.assign((e.currentTarget as HTMLElement).style, { transform: "scale(1)", boxShadow: "0 4px 22px rgba(255,77,77,0.4)" })}
            >
              <PhoneOffIcon />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes pulseDot { 0%,100% { opacity:1; } 50% { opacity:0.45; } }
      `}</style>
    </div>
  );
}

function CtrlBtn({ children, active, activeColor, onClick, title }: {
  children: React.ReactNode; active: boolean; activeColor: string; onClick: () => void; title: string;
}) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
      background: active ? `${activeColor}22` : "rgba(14,18,32,0.8)",
      border: `1px solid ${active ? `${activeColor}55` : "rgba(255,255,255,0.1)"}`,
      color: active ? activeColor : "#F0F4FF",
      backdropFilter: "blur(16px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.18s ease",
      boxShadow: active ? `0 0 16px ${activeColor}33` : "none",
    }}>{children}</button>
  );
}

function sideBtn(active: boolean, accent: string): React.CSSProperties {
  return {
    width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
    background: active ? `${accent}22` : "rgba(14,18,32,0.8)",
    border: `1px solid ${active ? `${accent}55` : "rgba(255,255,255,0.08)"}`,
    color: active ? accent : "#8A9BB8",
    backdropFilter: "blur(16px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.18s ease",
  };
}

function actionBtn(color: string, ghost = false): React.CSSProperties {
  return {
    padding: "9px 24px", borderRadius: 9, cursor: "pointer",
    background: ghost ? "rgba(255,255,255,0.05)" : `${color}22`,
    border: `1px solid ${ghost ? "rgba(255,255,255,0.1)" : `${color}55`}`,
    color: ghost ? "#8A9BB8" : color,
    fontSize: 13, fontFamily: "inherit",
  };
}

function floatingPanel(side: "left" | "right", offsetX: number): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)",
    background: "rgba(10,13,24,0.92)", backdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
    padding: 18, zIndex: 26, width: 230,
    boxShadow: "0 16px 48px rgba(0,0,0,0.7)", color: "#F0F4FF",
  };
  if (side === "left") base.left = offsetX + 4;
  else base.right = offsetX + 4;
  return base;
}
