"use client";

import { useEffect, useRef, useState } from "react";
import { useFaceMask } from "@/hooks/useFaceMask";
import { useWebRTC } from "@/hooks/useWebRTC";

interface VideoSessionProps {
  roomId: string;
  role: "client" | "psychologist";
  onEnd?: () => void;
}

export function VideoSession({ roomId, role, onEnd }: VideoSessionProps) {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [maskEnabled, setMaskEnabled] = useState(role === "client");

  const rawVideoRef = useRef<HTMLVideoElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream;
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then((s) => {
        stream = s;
        setCameraStream(s);
        if (rawVideoRef.current) rawVideoRef.current.srcObject = s;
      })
      .catch((err) => setCameraError(`Нет доступа к камере: ${err.message}`));
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const { maskedStream, isReady: maskReady } = useFaceMask({
    sourceVideo: rawVideoRef.current,
    outputCanvas: maskCanvasRef.current,
    enabled: maskEnabled && !!cameraStream,
  });

  // WebRTC стартует на сырой камере сразу; когда маска готова — треки заменяются через replaceTrack
  const localStream = (maskEnabled && maskedStream) ? maskedStream : cameraStream;

  const { remoteStream, connectionState, isConnected, hangUp } = useWebRTC({ roomId, localStream });

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    cameraStream?.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
    setIsMuted((m) => !m);
  };

  const toggleCamera = () => {
    cameraStream?.getVideoTracks().forEach((t) => { t.enabled = isCameraOff; });
    setIsCameraOff((c) => !c);
  };

  const handleHangUp = () => {
    hangUp();
    cameraStream?.getTracks().forEach((t) => t.stop());
    onEnd?.();
  };

  if (cameraError) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#050810", color: "#b8c8dc", fontFamily: "var(--font-body)" }}>
        <p>{cameraError}</p>
      </div>
    );
  }

  const stateColor = isConnected ? "#4caf82" : connectionState === "idle" ? "#7888a0" : "#e8b84b";
  const stateLabel = isConnected ? "Соединение установлено" : connectionState === "idle" ? "Ожидание..." : `${connectionState}`;

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#050810", overflow: "hidden" }}>

      {/* Статус */}
      <div style={{ position: "absolute", top: "1rem", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(10,15,26,0.8)", border: "1px solid #2a3448", padding: "0.4rem 1rem", backdropFilter: "blur(8px)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: stateColor, display: "inline-block" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#a8b8cc" }}>{stateLabel}</span>
        {role === "client" && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#4a5870", marginLeft: "0.5rem" }}>
            {maskEnabled ? (maskReady ? "AI-маска" : "маска загружается...") : "маска выкл"}
          </span>
        )}
      </div>

      {/* Удалённый видео (основной) */}
      <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      {!remoteStream && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", letterSpacing: "0.12em", color: "#4a5870" }}>
            {role === "client" ? "ОЖИДАНИЕ ПСИХОЛОГА" : "ОЖИДАНИЕ КЛИЕНТА"}
          </p>
        </div>
      )}

      {/* Локальный превью */}
      <div style={{ position: "absolute", bottom: "5rem", right: "1rem", width: 180, height: 135, border: "1px solid #2a3448", overflow: "hidden", background: "#0a0f1a" }}>
        <video ref={rawVideoRef} autoPlay playsInline muted style={{ display: maskEnabled ? "none" : "block", width: "100%", height: "100%", objectFit: "cover" }} />
        <canvas ref={maskCanvasRef} style={{ display: maskEnabled ? "block" : "none", width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Контролы */}
      <div style={{ position: "absolute", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "0.75rem" }}>
        {[
          { label: isMuted ? "🔇" : "🎤", onClick: toggleMute, active: isMuted },
          { label: isCameraOff ? "📷" : "📹", onClick: toggleCamera, active: isCameraOff },
          ...(role === "client" ? [{ label: "🎭", onClick: () => setMaskEnabled((m) => !m), active: maskEnabled }] : []),
        ].map((btn, i) => (
          <button key={i} onClick={btn.onClick} style={{ width: 48, height: 48, borderRadius: "50%", background: btn.active ? "#2a3448" : "rgba(10,15,26,0.8)", border: `1px solid ${btn.active ? "#b8c8dc" : "#2a3448"}`, color: "#b8c8dc", fontSize: "1.2rem", cursor: "pointer", backdropFilter: "blur(8px)" }}>
            {btn.label}
          </button>
        ))}
        <button onClick={handleHangUp} style={{ width: 48, height: 48, borderRadius: "50%", background: "#7a2020", border: "1px solid #c04040", color: "#fff", fontSize: "1rem", cursor: "pointer" }}>
          ✕
        </button>
      </div>
    </div>
  );
}
