/**
 * useWebRTC — управляет полным жизненным циклом WebRTC peer connection:
 * 1. Захват камеры/микрофона
 * 2. Установка P2P соединения через сигнальный сервер
 * 3. Получение удалённого потока
 *
 * Видео никогда не проходит через сервер — только ICE/SDP сигналы.
 */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SignalingClient } from "@/lib/webrtc/signalingClient";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

interface UseWebRTCOptions {
  roomId: string;
  localStream: MediaStream | null;
}

interface UseWebRTCReturn {
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState | "idle";
  isConnected: boolean;
  hangUp: () => void;
}

export function useWebRTC({ roomId, localStream }: UseWebRTCOptions): UseWebRTCReturn {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState | "idle">("idle");

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const signalingRef = useRef<SignalingClient | null>(null);
  const isCallerRef = useRef(false);

  const createPeer = useCallback(
    (isCaller: boolean): RTCPeerConnection => {
      const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Добавляем локальные треки (с маской MediaPipe)
      localStream?.getTracks().forEach((track) => {
        peer.addTrack(track, localStream);
      });

      // Получаем удалённый поток
      const remote = new MediaStream();
      setRemoteStream(remote);
      peer.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => remote.addTrack(track));
      };

      // ICE кандидаты → через сигнальный сервер
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          signalingRef.current?.send({
            type: "ice-candidate",
            candidate: event.candidate.toJSON(),
          });
        }
      };

      peer.onconnectionstatechange = () => {
        setConnectionState(peer.connectionState);
      };

      if (isCaller) {
        // Caller создаёт offer
        peer
          .createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
          .then((offer) => peer.setLocalDescription(offer))
          .then(() => {
            signalingRef.current?.send({
              type: "offer",
              sdp: peer.localDescription!,
            });
          });
      }

      return peer;
    },
    [localStream]
  );

  useEffect(() => {
    if (!roomId || !localStream) return;

    const signaling = new SignalingClient(roomId);
    signalingRef.current = signaling;

    const unsubscribe = signaling.onMessage(async (msg) => {
      switch (msg.type) {
        case "peer-joined": {
          // Мы первые в комнате — становимся caller
          isCallerRef.current = true;
          peerRef.current = createPeer(true);
          break;
        }

        case "offer": {
          // Мы вторые — отвечаем на offer
          if (!peerRef.current) {
            peerRef.current = createPeer(false);
          }
          await peerRef.current.setRemoteDescription(msg.sdp);
          const answer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(answer);
          signaling.send({ type: "answer", sdp: peerRef.current.localDescription! });
          break;
        }

        case "answer": {
          await peerRef.current?.setRemoteDescription(msg.sdp);
          break;
        }

        case "ice-candidate": {
          await peerRef.current?.addIceCandidate(msg.candidate);
          break;
        }

        case "peer-left": {
          peerRef.current?.close();
          peerRef.current = null;
          setRemoteStream(null);
          setConnectionState("idle");
          break;
        }
      }
    });

    signaling.connect().then(() => {
      signaling.send({ type: "ready" });
    });

    return () => {
      unsubscribe();
      signaling.disconnect();
      peerRef.current?.close();
      peerRef.current = null;
    };
  }, [roomId, localStream, createPeer]);

  const hangUp = useCallback(() => {
    signalingRef.current?.disconnect();
    peerRef.current?.close();
    peerRef.current = null;
    setRemoteStream(null);
    setConnectionState("idle");
  }, []);

  return {
    remoteStream,
    connectionState,
    isConnected: connectionState === "connected",
    hangUp,
  };
}
