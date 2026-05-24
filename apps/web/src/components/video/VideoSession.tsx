"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Room, RoomEvent, Track, VideoPresets,
  createLocalAudioTrack, createLocalVideoTrack,
  type RemoteTrack,
} from "livekit-client";
import { useAmbientSound, type AmbientPreset } from "@/hooks/useAmbientSound";
import { SessionNotepad } from "@/components/session/SessionNotepad";
import { BreathingSync } from "@/components/session/BreathingSync";

const API         = process.env.NEXT_PUBLIC_API_URL    ?? "/api/v1";
const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "ws://155.212.128.231:7880";

interface VideoSessionProps {
  roomId: string;
  role:   "client" | "psychologist";
  onEnd?: () => void;
}

export function VideoSession({ roomId, role, onEnd }: VideoSessionProps) {
  const [status,       setStatus]       = useState<"connecting" | "connected" | "failed">("connecting");
  const [isMuted,      setIsMuted]      = useState(false);
  const [isCameraOff,  setIsCameraOff]  = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [hasRemote,    setHasRemote]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [micStream,    setMicStream]    = useState<MediaStream | null>(null);

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const roomRef        = useRef<Room | null>(null);
  const hideTimer      = useRef<ReturnType<typeof setTimeout>>();

  const ambient = useAmbientSound(micStream);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => clearTimeout(hideTimer.current);
  }, [resetHideTimer]);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      try {
        const access = localStorage.getItem("access_token");
        const res    = await fetch(`${API}/livekit/token/?room=${roomId}`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (!res.ok) throw new Error("Не удалось получить токен сессии");
        const { token } = await res.json();
        if (cancelled) return;

        const room = new Room({
          adaptiveStream: true,
          dynacast:       true,
          videoCaptureDefaults: { resolution: VideoPresets.h720.resolution },
        });
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
          if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
            track.attach(remoteVideoRef.current);
            setHasRemote(true);
          }
          if (track.kind === Track.Kind.Audio && remoteAudioRef.current) {
            track.attach(remoteAudioRef.current);
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
          track.detach();
          if (track.kind === Track.Kind.Video) setHasRemote(false);
        });

        room.on(RoomEvent.ParticipantDisconnected, () => setHasRemote(false));
        room.on(RoomEvent.Disconnected, () => { if (!cancelled) setStatus("failed"); });

        await room.connect(LIVEKIT_URL, token);
        if (cancelled) { room.disconnect(); return; }
        setStatus("connected");

        const [audioTrack, videoTrack] = await Promise.all([
          createLocalAudioTrack({ echoCancellation: true, noiseSuppression: true }),
          createLocalVideoTrack({ resolution: VideoPresets.h720.resolution }),
        ]);
        if (cancelled) { room.disconnect(); return; }

        if (localVideoRef.current) videoTrack.attach(localVideoRef.current);
        setMicStream(new MediaStream([audioTrack.mediaStreamTrack]));

        await room.localParticipant.publishTrack(audioTrack);
        await room.localParticipant.publishTrack(videoTrack);

      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Ошибка подключения");
      }
    }

    connect();
    return () => {
      cancelled = true;
      roomRef.current?.disconnect();
      roomRef.current = null;
    };
  }, [roomId]);

  const toggleMute = async () => {
    if (!roomRef.current) return;
    await roomRef.current.localParticipant.setMicrophoneEnabled(isMuted);
    setIsMuted(m => !m);
  };

  const toggleCamera = async () => {
    if (!roomRef.current) return;
    await roomRef.current.localParticipant.setCameraEnabled(isCameraOff);
    setIsCameraOff(c => !c);
  };

  const handleHangUp = () => {
    ambient.setEnabled(false);
    roomRef.current?.disconnect();
    roomRef.current = null;
    onEnd?.();
  };

  const stateColor = status === "connected" && hasRemote ? "#31B557"
    : status === "failed" ? "#E53935" : "#8D9AA3";

  const stateLabel = status === "failed"    ? "Соединение разорвано"
    : status === "connecting"               ? "Подключение..."
    : hasRemote                             ? "Соединение установлено"
    : role === "client"                     ? "Ожидание психолога..."
    : "Ожидание клиента...";

  if (error) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0E1621", color: "#8D9AA3", flexDirection: "column", gap: "16px" }}>
      <span style={{ fontSize: "32px" }}>⚠️</span>
      <p style={{ fontFamily: "var(--font)" }}>{error}</p>
      <button className="btn btn-primary" onClick={onEnd}>← Назад</button>
    </div>
  );

  return (
    <div
      style={{ position: "relative", width: "100vw", height: "100vh", background: "#0E1621", overflow: "hidden", cursor: showControls ? "default" : "none" }}
      onMouseMove={resetHideTimer}
    >
      <video ref={remoteVideoRef} autoPlay playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <audio ref={remoteAudioRef} autoPlay />

      {!hasRemote && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", border: "2px solid var(--accent)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#8D9AA3", fontSize: "15px", fontFamily: "var(--font)" }}>{stateLabel}</p>
        </div>
      )}

      {/* Status bar */}
      <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(23,33,43,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(43,58,76,0.8)", borderRadius: "var(--radius-full)", padding: "6px 16px", zIndex: 10, transition: "opacity 0.3s", opacity: showControls ? 1 : 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: stateColor }} />
        <span style={{ fontSize: "13px", color: "#8D9AA3", fontFamily: "var(--font)" }}>{stateLabel}</span>
      </div>

      {/* Local preview */}
      <div style={{ position: "absolute", bottom: "84px", right: "16px", width: 176, height: 132, borderRadius: "var(--radius)", border: "1px solid rgba(43,58,76,0.8)", overflow: "hidden", background: "#0E1621", boxShadow: "var(--shadow-lg)", transition: "opacity 0.3s", opacity: showControls ? 1 : 0.4 }}>
        <video ref={localVideoRef} autoPlay playsInline muted
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
      </div>

      {/* Right-side buttons */}
      <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "10px", transition: "opacity 0.3s", opacity: showControls ? 1 : 0, zIndex: 20 }}>
        <SessionNotepad roomId={roomId} />
        <BreathingSync />
        <button onClick={() => ambient.setEnabled((e: boolean) => !e)} title={ambient.enabled ? "Выключить звуки природы" : "Включить звуки природы"}
          style={{ width: 44, height: 44, borderRadius: "50%", background: ambient.enabled ? "var(--accent)" : "rgba(23,33,43,0.9)", border: "1px solid var(--border)", color: "#fff", fontSize: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
          {ambient.enabled ? "🌿" : "🔕"}
        </button>
        <button onClick={() => setShowSettings(s => !s)}
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
