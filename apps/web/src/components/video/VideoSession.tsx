"use client";

/**
 * VideoSession — главный компонент видеосессии.
 *
 * Схема потоков:
 *   Камера → <video#local-raw> (скрыт)
 *         → MediaPipe FaceMesh (On-Device AI)
 *         → WebGL Canvas (хромированная маска)
 *         → captureStream(30fps)
 *         → WebRTC RTCPeerConnection
 *         → Психолог (P2P, без сервера)
 *
 * Психолог видит маску, точно передающую мимику.
 * Сервер не получает ни одного кадра видео.
 */

import { useEffect, useRef, useState } from "react";
import { useFaceMask } from "@/hooks/useFaceMask";
import { useWebRTC } from "@/hooks/useWebRTC";
import styles from "./VideoSession.module.css";

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

  // 1. Захват камеры и микрофона
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 720 }, audio: true })
      .then((stream) => {
        setCameraStream(stream);
        if (rawVideoRef.current) {
          rawVideoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        setCameraError(`Нет доступа к камере: ${err.message}`);
      });

    return () => {
      cameraStream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. MediaPipe маска (только для клиента)
  const { maskedStream, isReady: maskReady } = useFaceMask({
    sourceVideo: rawVideoRef.current,
    outputCanvas: maskCanvasRef.current,
    enabled: maskEnabled && !!cameraStream,
  });

  // 3. WebRTC: передаём либо маскированный поток (клиент), либо сырой (психолог)
  const localStream = maskEnabled ? maskedStream : cameraStream;
  const { remoteStream, connectionState, isConnected, hangUp } = useWebRTC({
    roomId,
    localStream,
  });

  // 4. Прикрепляем удалённый поток
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    cameraStream?.getAudioTracks().forEach((t) => {
      t.enabled = isMuted;
    });
    setIsMuted((m) => !m);
  };

  const toggleCamera = () => {
    cameraStream?.getVideoTracks().forEach((t) => {
      t.enabled = isCameraOff;
    });
    setIsCameraOff((c) => !c);
  };

  const handleHangUp = () => {
    hangUp();
    cameraStream?.getTracks().forEach((t) => t.stop());
    onEnd?.();
  };

  if (cameraError) {
    return (
      <div className={styles.error}>
        <p>{cameraError}</p>
      </div>
    );
  }

  return (
    <div className={styles.sessionWrapper}>
      {/* Индикатор соединения */}
      <div className={styles.statusBar}>
        <span
          className={`${styles.statusDot} ${
            isConnected ? styles.connected : styles.connecting
          }`}
        />
        <span className={styles.statusText}>
          {isConnected ? "Соединение установлено" : `${connectionState}…`}
        </span>
        {role === "client" && (
          <span className={styles.maskBadge}>
            {maskEnabled && maskReady ? "AI-маска активна" : "Маска загружается…"}
          </span>
        )}
      </div>

      {/* Основной экран — удалённый участник */}
      <div className={styles.remoteContainer}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={styles.remoteVideo}
        />
        {!remoteStream && (
          <div className={styles.waitingPlaceholder}>
            <p>Ожидание подключения специалиста…</p>
          </div>
        )}
      </div>

      {/* Локальный предпросмотр */}
      <div className={styles.localContainer}>
        {/* Скрытый элемент для сырого потока камеры */}
        <video
          ref={rawVideoRef}
          autoPlay
          playsInline
          muted
          style={{ display: "none" }}
        />
        {/* Canvas с наложенной маской (показываем клиенту) */}
        {role === "client" ? (
          <canvas ref={maskCanvasRef} className={styles.localPreview} />
        ) : (
          <video
            autoPlay
            playsInline
            muted
            ref={(el) => {
              if (el) el.srcObject = cameraStream;
            }}
            className={styles.localPreview}
          />
        )}
      </div>

      {/* Панель управления */}
      <div className={styles.controls}>
        <button
          className={`${styles.controlBtn} ${isMuted ? styles.active : ""}`}
          onClick={toggleMute}
          title={isMuted ? "Включить микрофон" : "Выключить микрофон"}
        >
          {isMuted ? "🔇" : "🎤"}
        </button>

        <button
          className={`${styles.controlBtn} ${isCameraOff ? styles.active : ""}`}
          onClick={toggleCamera}
          title={isCameraOff ? "Включить камеру" : "Выключить камеру"}
        >
          {isCameraOff ? "📷" : "📹"}
        </button>

        {role === "client" && (
          <button
            className={`${styles.controlBtn} ${maskEnabled ? styles.maskOn : ""}`}
            onClick={() => setMaskEnabled((m) => !m)}
            title="Переключить AI-маску"
          >
            🎭
          </button>
        )}

        <button
          className={`${styles.controlBtn} ${styles.hangupBtn}`}
          onClick={handleHangUp}
          title="Завершить сессию"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
