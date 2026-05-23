"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useFaceMask } from "@/hooks/useFaceMask";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useAmbientSound, type AmbientPreset } from "@/hooks/useAmbientSound";
import { SessionNotepad } from "@/components/session/SessionNotepad";
import { BreathingSync } from "@/components/session/BreathingSync";

interface VideoSessionProps {
  roomId: string;
  role: "client" | "psychologist";
  onEnd?: () => void;
}

export function VideoSession({ roomId, role, onEnd }: VideoSessionProps) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError]   = useState<string | null>(null);
  const [isMuted, setIsMuted]           = useState(false);
  const [isCameraOff, setIsCameraOff]   = useState(false);
  const [maskEnabled, setMaskEnabled]   = useState(role === "client");
  const [showControls, setShowControls] = useState(true);
  const [emotionGrid, setEmotionGrid]   = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [videoEl, setVideoEl]           = useState<HTMLVideoElement | null>(null);
  const [canvasEl, setCanvasEl]         = useState<HTMLCanvasElement | null>(null);

  const rawVideoRef    = useRef<HTMLVideoElement>(null);
  const maskCanvasRef  = useRef<HTMLCanvasElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const hideTimer      = useRef<ReturnType<typeof setTimeout>>();

  const ambient = useAmbientSound(cameraStream);

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720, frameRate: 30 }, audio: true })
      .then(s => {
        stream = s;
        setCameraStream(s);
        if (rawVideoRef.current) {
          rawVideoRef.current.srcObject = s;
          setVideoEl(rawVideoRef.current);
          setCanvasEl(maskCanvasRef.current);
        }
      })
      .catch(err => setCameraError(`Нет доступа к камере: ${err.message}`));
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  const { maskedStream, isReady: maskReady } = useFaceMask({
    sourceVideo: videoEl,
    outputCanvas: canvasEl,
    enabled: maskEnabled && !!cameraStream,
  });

  const localStream = maskEnabled && maskedStream ? maskedStream : cameraStream;
  const { remoteStream, connectionState, signalingStatus, isConnected, hangUp } = useWebRTC({ roomId, localStream });

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Auto-hide controls
  const resetHideTimer = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 4000);
  };
  useEffect(() => { resetHideTimer(); return () => clearTimeout(hideTimer.current); }, []);

  const toggleMute = () => {
    cameraStream?.getAudioTracks().forEach(t => { t.enabled = isMuted; });
    setIsMuted(m => !m);
  };
  const toggleCamera = () => {
    cameraStream?.getVideoTracks().forEach(t => { t.enabled = isCameraOff; });
    setIsCameraOff(c => !c);
  };
  const handleHangUp = () => {
    hangUp();
    ambient.setEnabled(false);
    cameraStream?.getTracks().forEach(t => t.stop());
    onEnd?.();
  };

  const stateColor = isConnected ? "#31B557"
    : signalingStatus === "error" ? "#E53935"
    : "#8D9AA3";
  const stateLabel = isConnected ? "Соединение установлено"
    : signalingStatus === "error"       ? "Ошибка WebSocket"
    : signalingStatus === "disconnected" ? "Ожидание камеры..."
    : connectionState === "idle"         ? "Ожидание участника..."
    : connectionState;

  if (cameraError) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0E1621", color: "#8D9AA3", flexDirection: "column", gap: "16px" }}>
      <span style={{ fontSize: "32px" }}>📷</span>
      <p style={{ fontFamily: "var(--font)" }}>{cameraError}</p>
    </div>
  );

  return (
    <div
      style={{ position: "relative", width: "100vw", height: "100vh", background: "#0E1621", overflow: "hidden", cursor: "none" }}
      onMouseMove={resetHideTimer}
      style2={{ cursor: showControls ? "default" : "none" }}
    >
      {/* Remote video */}
      <video ref={remoteVideoRef} autoPlay playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }} />

      {/* Waiting overlay */}
      {!remoteStream && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#8D9AA3", fontSize: "15px", fontFamily: "var(--font)" }}>
            {role === "client" ? "Ожидание психолога..." : "Ожидание клиента..."}
          </p>
        </div>
      )}

      {/* Emotion grid overlay for psychologist */}
      {role === "psychologist" && emotionGrid && remoteStream && (
        <canvas style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          pointerEvents: "none", opacity: 0.6, mixBlendMode: "screen",
        }} />
      )}

      {/* Status bar */}
      <div style={{
        position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: "8px",
        background: "rgba(23,33,43,0.85)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(43,58,76,0.8)", borderRadius: "var(--radius-full)",
        padding: "6px 16px", zIndex: 10,
        transition: "opacity 0.3s", opacity: showControls ? 1 : 0,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: stateColor }} />
        <span style={{ fontSize: "13px", color: "#8D9AA3", fontFamily: "var(--font)" }}>{stateLabel}</span>
        {role === "client" && (
          <span style={{ fontSize: "12px", color: "#5A6A7A", marginLeft: "4px" }}>
            {maskEnabled ? (maskReady ? "· AI-маска" : "· загрузка...") : "· маска выкл"}
          </span>
        )}
      </div>

      {/* Local preview */}
      <div style={{
        position: "absolute", bottom: "84px", right: "16px",
        width: 176, height: 132, borderRadius: "var(--radius)",
        border: "1px solid rgba(43,58,76,0.8)", overflow: "hidden",
        background: "#0E1621", boxShadow: "var(--shadow-lg)",
        transition: "opacity 0.3s", opacity: showControls ? 1 : 0.4,
      }}>
        <video ref={rawVideoRef} autoPlay playsInline muted
          style={{ display: maskEnabled ? "none" : "block", width: "100%", height: "100%", objectFit: "cover" }} />
        <canvas ref={maskCanvasRef}
          style={{ display: maskEnabled ? "block" : "none", width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Floating action buttons (right side) */}
      <div style={{
        position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: "10px",
        transition: "opacity 0.3s", opacity: showControls ? 1 : 0,
        zIndex: 20,
      }}>
        <SessionNotepad roomId={roomId} />
        <BreathingSync />
        {/* Ambient sound toggle */}
        <button
          onClick={() => ambient.setEnabled(e => !e)}
          title={ambient.enabled ? "Выключить звуки природы" : "Включить звуки природы"}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: ambient.enabled ? "var(--accent)" : "rgba(23,33,43,0.9)",
            border: "1px solid var(--border)", color: "#fff",
            fontSize: "18px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >{ambient.enabled ? "🌿" : "🔕"}</button>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(s => !s)}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: showSettings ? "var(--bg-elevated)" : "rgba(23,33,43,0.9)",
            border: "1px solid var(--border)", color: "var(--text-secondary)",
            fontSize: "18px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >⚙️</button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div style={{
          position: "absolute", right: "72px", top: "50%", transform: "translateY(-50%)",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", padding: "16px", zIndex: 30,
          width: "220px", boxShadow: "var(--shadow-lg)",
        }}>
          <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "14px", color: "var(--text-secondary)" }}>Настройки</div>

          {/* Ambient preset */}
          {ambient.enabled && (
            <div style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "6px" }}>Звуки природы</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {(["rain", "forest", "ocean"] as AmbientPreset[]).map(p => (
                  <button key={p} onClick={() => ambient.setPreset(p)}
                    style={{
                      padding: "6px", borderRadius: "6px", fontSize: "12px", cursor: "pointer",
                      background: ambient.preset === p ? "var(--accent)" : "var(--bg-elevated)",
                      border: "1px solid var(--border)", color: ambient.preset === p ? "#fff" : "var(--text-secondary)",
                      fontFamily: "var(--font)",
                    }}>
                    {p === "rain" ? "🌧 Дождь" : p === "forest" ? "🌲 Лес" : "🌊 Океан"}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: "8px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Громкость</div>
                <input type="range" min={0} max={1} step={0.05} value={ambient.volume}
                  onChange={e => ambient.setVolume(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)" }} />
              </div>
            </div>
          )}

          {/* Psychologist-only: emotion grid */}
          {role === "psychologist" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px" }}>Сетка эмоций</span>
              <button onClick={() => setEmotionGrid(g => !g)}
                style={{
                  width: 32, height: 18, borderRadius: "9px", cursor: "pointer", border: "none",
                  background: emotionGrid ? "var(--accent)" : "var(--bg-elevated)",
                  position: "relative", transition: "background 0.2s",
                }}>
                <span style={{
                  position: "absolute", top: "3px", left: emotionGrid ? "16px" : "3px",
                  width: 12, height: 12, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s",
                }} />
              </button>
            </div>
          )}

          {/* Client: mask toggle */}
          {role === "client" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px" }}>AI-маска</span>
              <button onClick={() => setMaskEnabled(m => !m)}
                style={{
                  width: 32, height: 18, borderRadius: "9px", cursor: "pointer", border: "none",
                  background: maskEnabled ? "var(--accent)" : "var(--bg-elevated)",
                  position: "relative", transition: "background 0.2s",
                }}>
                <span style={{
                  position: "absolute", top: "3px", left: maskEnabled ? "16px" : "3px",
                  width: 12, height: 12, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s",
                }} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom controls */}
      <div style={{
        position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: "10px", alignItems: "center",
        transition: "opacity 0.3s", opacity: showControls ? 1 : 0,
        zIndex: 20,
      }}>
        {[
          { icon: isMuted ? "🔇" : "🎤", onClick: toggleMute, active: isMuted, title: isMuted ? "Включить микрофон" : "Выключить" },
          { icon: isCameraOff ? "📷" : "📹", onClick: toggleCamera, active: isCameraOff, title: isCameraOff ? "Включить камеру" : "Выключить" },
        ].map((btn, i) => (
          <button key={i} onClick={btn.onClick} title={btn.title}
            style={{
              width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
              background: btn.active ? "var(--bg-elevated)" : "rgba(23,33,43,0.85)",
              border: `1px solid ${btn.active ? "var(--border-hover)" : "var(--border)"}`,
              color: btn.active ? "var(--text)" : "var(--text-secondary)",
              fontSize: "18px", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{btn.icon}</button>
        ))}

        <button onClick={handleHangUp}
          style={{
            width: 56, height: 56, borderRadius: "50%", cursor: "pointer",
            background: "var(--danger)", border: "none", color: "#fff",
            fontSize: "20px", boxShadow: "0 4px 16px rgba(229,57,53,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
