"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useP2PCall }         from "@/hooks/useP2PCall";
import { useFaceMask }        from "@/hooks/useFaceMask";
import { useVoiceTransform, type VoicePreset } from "@/hooks/useVoiceTransform";
import { useAmbientSound, type AmbientPreset } from "@/hooks/useAmbientSound";
import { SessionNotepad }     from "@/components/session/SessionNotepad";
import { BreathingSync }      from "@/components/session/BreathingSync";
import { AvatarCanvas3D }     from "@/components/avatar/AvatarCanvas3D";
import type { FaceLandmarks } from "@/lib/mediapipe/faceRenderer";

interface VideoSessionProps {
  roomId: string;
  role:   "client" | "psychologist";
  onEnd?: () => void;
}

function fmt(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

// 6 deterministic avatar variant seeds (append to roomId)
const AVATAR_VARIANTS = ["_a1", "_a2", "_a3", "_a4", "_a5", "_a6"];

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

function HangUpIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
  );
}

function AvatarIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function LogoIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" fill="none">
      <defs>
        <linearGradient id="lggi2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4DA6FF"/>
          <stop offset="55%" stopColor="#8B6CF8"/>
          <stop offset="100%" stopColor="#FF7B7B"/>
        </linearGradient>
      </defs>
      <ellipse cx="20" cy="22" rx="19" ry="21" fill="url(#lggi2)"/>
      <ellipse cx="13" cy="19" rx="4.5" ry="3.5" fill="rgba(0,0,0,0.7)"/>
      <ellipse cx="27" cy="19" rx="4.5" ry="3.5" fill="rgba(0,0,0,0.7)"/>
      <rect x="14" y="28" width="12" height="4" rx="2" fill="rgba(0,0,0,0.7)"/>
    </svg>
  );
}

function VoiceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <path d="M8 23h8"/>
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function VideoSession({ roomId, role, onEnd }: VideoSessionProps) {
  const [started,      setStarted]      = useState(false);
  const [avatarVariant, setAvatarVariant] = useState(0);  // 0–5
  const [showPicker,   setShowPicker]   = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showNotepad,  setShowNotepad]  = useState(false);
  const [showBreath,   setShowBreath]   = useState(false);
  const [voicePreset,  setVoicePreset]  = useState<VoicePreset>("off");

  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const ambient = useAmbientSound(null);

  // Remote landmarks ref (updated without state to avoid re-renders every frame)
  const remoteLandmarksRef = useRef<FaceLandmarks | null>(null);
  const [remoteVariant, setRemoteVariant] = useState(0);

  // ── Client: face mask (audio + landmarks) ────────────────────────
  const { audioStream, isReady: maskReady, landmarksRef, lightingWarning } = useFaceMask({
    enabled: started && role === "client",
  });

  const { transformedStream } = useVoiceTransform({
    inputStream: audioStream,
    preset:      voicePreset,
  });

  const clientStream = transformedStream ?? audioStream;

  // ── Psychologist: real camera ────────────────────────────────────
  const [psychStream, setPsychStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    if (!started || role !== "psychologist") return;
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    }).then(s => { if (!cancelled) setPsychStream(s); }).catch(console.error);
    return () => {
      cancelled = true;
      setPsychStream(prev => { prev?.getTracks().forEach(t => t.stop()); return null; });
    };
  }, [started, role]);

  const localStream = role === "client" ? clientStream : psychStream;

  // ── Remote landmarks callback (psychologist) ─────────────────────
  const handleRemoteLandmarks = useCallback((lm: FaceLandmarks, av: number) => {
    remoteLandmarksRef.current = lm;
    // Only update state if variant changes (rare)
    setRemoteVariant(prev => av !== prev ? av : prev);
  }, []);

  // ── P2P Call ─────────────────────────────────────────────────────
  const {
    status, isMuted, isCameraOff, hasRemote, elapsed,
    remoteVideoRef, toggleMute, toggleCamera, hangUp, retryNow,
  } = useP2PCall({
    roomId,
    localStream,
    role,
    localLandmarksRef: role === "client" ? landmarksRef : undefined,
    avatarId:          role === "client" ? avatarVariant + 1 : undefined,
    onRemoteLandmarks: role === "psychologist" ? handleRemoteLandmarks : undefined,
    onEnd,
  });

  // ── Auto-hide controls ────────────────────────────────────────────
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

  useEffect(() => { if (!showControls) setShowPicker(false); }, [showControls]);

  const handleStart  = () => setStarted(true);
  const handleHangUp = () => { ambient.setEnabled(false); hangUp(); };
  const cycleVoice = () => setVoicePreset(p => p === "off" ? "lower" : p === "lower" ? "higher" : "off");

  // Avatar seed for psychologist display
  const remoteAvatarSeed = roomId + AVATAR_VARIANTS[remoteVariant % AVATAR_VARIANTS.length];
  const localAvatarSeed  = roomId + AVATAR_VARIANTS[avatarVariant % AVATAR_VARIANTS.length];

  // ── Derived state ─────────────────────────────────────────────────
  const isCameraLoading = started && role === "client" && !maskReady;
  const isPsychLoading  = started && role === "psychologist" && !psychStream;
  const isWaiting       = status === "waiting";
  const isFailed        = status === "failed";
  const isReconnecting  = status === "reconnecting";
  const isConnected     = status === "connected";

  const stateLabel =
    isCameraLoading || isPsychLoading ? "Запуск камеры…"
    : status === "connecting"         ? "Соединение с сервером…"
    : isWaiting && role === "client"  ? "Ожидание специалиста…"
    : isWaiting                       ? "Ожидание клиента…"
    : isReconnecting                  ? "Восстановление связи…"
    : isFailed                        ? "Соединение прервано"
    : hasRemote                       ? "Соединение активно"
    : "";

  const dotColor =
    isConnected && hasRemote ? "#31D97B"
    : isFailed               ? "#FF4D4D"
    : "#F59E0B";

  const showSpinner = isCameraLoading || isPsychLoading || status === "connecting" || isWaiting || isReconnecting;
  const voiceLabel  = voicePreset === "off" ? "Голос: откл" : voicePreset === "lower" ? "Голос: ниже" : "Голос: выше";

  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "relative", width: "100vw", height: "100dvh",
      background: "#0A0D18", overflow: "hidden",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>

      {/* ══ REMOTE DISPLAY — full-screen ═══════════════════════════ */}
      {/* Client sees psychologist's real video */}
      {role === "client" && (
        <video
          ref={remoteVideoRef}
          autoPlay playsInline
          style={{
            position: "absolute", inset: 0, zIndex: 1,
            width: "100%", height: "100%", objectFit: "cover",
            background: "#0A0D18",
          }}
        />
      )}

      {/* Psychologist sees client's 3D avatar (full-screen) */}
      {role === "psychologist" && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <AvatarCanvas3D
            landmarksRef={remoteLandmarksRef}
            avatarSeed={remoteAvatarSeed}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      )}

      {/* Waiting-for-avatar placeholder */}
      {role === "psychologist" && started && !hasRemote && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
        }}>
          <AvatarIcon size={48} />
          <span style={{ fontSize: 14, color: "#4A5A72" }}>Ожидание аватара клиента…</span>
        </div>
      )}

      {/* ══ Vignette ══════════════════════════════════════════════ */}
      {started && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(10,13,24,0.72) 0%, transparent 18%, transparent 70%, rgba(10,13,24,0.88) 100%)",
        }}/>
      )}

      {/* ══ PRE-SESSION SCREEN ═════════════════════════════════════ */}
      {!started && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "#0A0D18",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
            <LogoIcon size={34} />
            <span style={{ fontSize: 24, fontWeight: 700, color: "#F0F4FF", letterSpacing: "-0.02em" }}>aprosop</span>
          </div>

          {role === "client" && (
            <div style={{
              background: "rgba(14,18,32,0.88)", backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20,
              padding: "28px 32px", width: 360, marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, color: "#4A5A72", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
                Выберите аватар
              </div>

              {/* Avatar variant picker: 6 mini 3D previews */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 22 }}>
                {AVATAR_VARIANTS.map((v, i) => (
                  <button
                    key={v}
                    onClick={() => setAvatarVariant(i)}
                    style={{
                      width: 44, height: 44, borderRadius: 10, cursor: "pointer", padding: 0,
                      border: `2px solid ${avatarVariant === i ? "#4DA6FF" : "rgba(255,255,255,0.1)"}`,
                      background: avatarVariant === i ? "rgba(77,166,255,0.15)" : "rgba(255,255,255,0.04)",
                      overflow: "hidden", transition: "all 0.18s ease",
                    }}
                    title={`Аватар ${i + 1}`}
                  >
                    {/* Tiny 3D avatar preview — null landmarksRef, just renders static pose */}
                    <AvatarCanvas3D
                      landmarksRef={{ current: null }}
                      avatarSeed={roomId + v}
                      width={44}
                      height={44}
                      style={{ width: 44, height: 44 }}
                    />
                  </button>
                ))}
              </div>

              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "rgba(77,166,255,0.06)",
                border: "1px solid rgba(77,166,255,0.15)",
                borderRadius: 10, padding: "10px 14px",
              }}>
                <AvatarIcon size={18} />
                <span style={{ fontSize: 12, color: "#8A9BB8", lineHeight: 1.5 }}>
                  Специалист видит только ваш 3D-аватар и не получает видео
                </span>
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, color: "#4A5A72", marginBottom: 26, fontFamily: "JetBrains Mono, monospace" }}>
            {role === "psychologist" ? "Комната специалиста" : "Анонимная сессия"} · {roomId.slice(0, 8)}…
          </div>

          <button
            onClick={handleStart}
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

      {/* ══ IN-CALL UI ═════════════════════════════════════════════ */}
      {started && (
        <div
          style={{ position: "absolute", inset: 0, zIndex: 10, cursor: showControls ? "default" : "none" }}
          onMouseMove={resetHide}
          onTouchStart={resetHide}
        >
          <div
            style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: showControls ? "none" : "auto" }}
            onMouseMove={resetHide}
            onTouchStart={resetHide}
          />

          {/* ── CLIENT LOCAL PREVIEW — 3D avatar ────────────────── */}
          {role === "client" && (
            <div style={{
              position: "absolute", bottom: 90, right: 16, zIndex: 15,
              width: 160, height: 120, borderRadius: 12, overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "#0c1122",
              opacity: maskReady ? 1 : 0.3,
              transition: "opacity 0.4s ease",
            }}>
              <AvatarCanvas3D
                landmarksRef={landmarksRef}
                avatarSeed={localAvatarSeed}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          )}

          {/* ── LIGHTING WARNING ─────────────────────────────────── */}
          {role === "client" && lightingWarning && maskReady && (
            <div style={{
              position: "absolute", top: 64, left: "50%", transform: "translateX(-50%)",
              zIndex: 30, whiteSpace: "nowrap",
              background: "rgba(10,13,24,0.92)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(245,158,11,0.4)", borderRadius: 9999,
              padding: "7px 18px", display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ fontSize: 12, color: "#F59E0B" }}>Недостаточное освещение — аватар не определяет лицо</span>
            </div>
          )}

          {/* ── STATUS OVERLAY ──────────────────────────────────── */}
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

          {/* ── FAILED OVERLAY ──────────────────────────────────── */}
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

          {/* ── RECONNECTING TOAST ──────────────────────────────── */}
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

          {/* ── TOP BAR ─────────────────────────────────────────── */}
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
              <span style={{ fontSize: 11, color: "#4A5A72", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.05em" }}>
                {role === "client" ? "АНОНИМНО · P2P" : "P2P · ENCRYPTED"}
              </span>
            </div>
          </div>

          {/* ── LEFT SIDE BUTTONS ───────────────────────────────── */}
          <div style={{
            position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", gap: 8, zIndex: 25,
            transition: "opacity 0.35s ease",
            opacity: showControls ? 1 : 0, pointerEvents: showControls ? "auto" : "none",
          }}>
            {role === "psychologist" && (
              <button onClick={() => { setShowNotepad(s => !s); setShowBreath(false); }}
                title="Заметки" style={sideBtn(showNotepad, "#4DA6FF")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
            )}
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
            {role === "client" && (
              <button onClick={() => setShowPicker(s => !s)} title="Аватар" style={sideBtn(showPicker, "#8B6CF8")}>
                <AvatarIcon size={18} />
              </button>
            )}
            {role === "client" && (
              <button onClick={cycleVoice} title={voiceLabel}
                style={{ ...sideBtn(voicePreset !== "off", "#4DA6FF"), flexDirection: "column", gap: 2, height: "auto", padding: "8px 4px", minWidth: 40 }}>
                <VoiceIcon />
                <span style={{ fontSize: 8, letterSpacing: "0.02em", lineHeight: 1, color: voicePreset !== "off" ? "#4DA6FF" : "#4A5A72" }}>
                  {voicePreset === "off" ? "откл" : voicePreset === "lower" ? "ниже" : "выше"}
                </span>
              </button>
            )}
          </div>

          {/* ── FLOATING PANELS ─────────────────────────────────── */}
          {showNotepad && <div style={floatingPanel("left", 70)}><SessionNotepad roomId={roomId} /></div>}
          {showBreath  && <div style={floatingPanel("left", 70)}><BreathingSync /></div>}

          {showPicker && role === "client" && (
            <div style={floatingPanel("left", 70)}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5A72", marginBottom: 14 }}>
                Выберите аватар
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {AVATAR_VARIANTS.map((v, i) => (
                  <button key={v} onClick={() => { setAvatarVariant(i); setShowPicker(false); }}
                    style={{
                      padding: 0, borderRadius: 10, cursor: "pointer", overflow: "hidden",
                      border: `2px solid ${avatarVariant === i ? "#4DA6FF" : "rgba(255,255,255,0.08)"}`,
                      background: "transparent", width: 70, height: 70,
                      transition: "all 0.18s ease",
                    }}>
                    <AvatarCanvas3D
                      landmarksRef={{ current: null }}
                      avatarSeed={roomId + v}
                      width={70} height={70}
                      style={{ width: 70, height: 70 }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {ambient.enabled && (
            <div style={{ ...floatingPanel("left", 70), top: "auto", bottom: 100, transform: "none" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#4A5A72", marginBottom: 10 }}>
                Звуки природы
              </div>
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
            </div>
          )}

          {/* ── BOTTOM CONTROLS ─────────────────────────────────── */}
          <div style={{
            position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: 10, zIndex: 25,
            transition: "opacity 0.35s ease",
            opacity: showControls ? 1 : 0, pointerEvents: showControls ? "auto" : "none",
          }}>
            <CtrlBtn active={isMuted} activeColor="#FF4D4D" onClick={toggleMute} title={isMuted ? "Включить микрофон" : "Выключить микрофон"}>
              <MicIcon muted={isMuted} />
            </CtrlBtn>
            {role === "psychologist" && (
              <CtrlBtn active={isCameraOff} activeColor="#FF4D4D" onClick={toggleCamera} title={isCameraOff ? "Включить камеру" : "Выключить камеру"}>
                <CamIcon off={isCameraOff} />
              </CtrlBtn>
            )}
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
              <HangUpIcon />
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

// ─── Sub-components ───────────────────────────────────────────────────────────
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
    }}>
      {children}
    </button>
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
    padding: 18, zIndex: 26, width: 240,
    boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
    color: "#F0F4FF",
  };
  if (side === "left") base.left = offsetX + 4;
  else base.right = offsetX + 4;
  return base;
}
