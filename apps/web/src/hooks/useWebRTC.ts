"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SignalingClient } from "@/lib/webrtc/signalingClient";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  // Public TURN for NAT traversal
  { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
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
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const localStreamRef = useRef<MediaStream | null>(null);

  // Keep localStreamRef in sync so we can replace tracks without recreating peer
  useEffect(() => {
    localStreamRef.current = localStream;

    if (!peerRef.current || !localStream) return;
    const senders = peerRef.current.getSenders();
    localStream.getTracks().forEach((track) => {
      const sender = senders.find((s) => s.track?.kind === track.kind);
      if (sender) sender.replaceTrack(track);
    });
  }, [localStream]);

  const createPeer = useCallback((isCaller: boolean): RTCPeerConnection => {
    const peer = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current!);
    });

    remoteStreamRef.current = new MediaStream();
    setRemoteStream(remoteStreamRef.current);

    peer.ontrack = (event) => {
      event.streams[0].getTracks().forEach((t) => remoteStreamRef.current.addTrack(t));
      setRemoteStream(new MediaStream(remoteStreamRef.current.getTracks()));
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        signalingRef.current?.send({ type: "ice-candidate", candidate: event.candidate.toJSON() });
      }
    };

    peer.onconnectionstatechange = () => setConnectionState(peer.connectionState);
    peer.oniceconnectionstatechange = () => {
      if (peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed") {
        setConnectionState("connected");
      }
    };

    if (isCaller) {
      peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => peer.setLocalDescription(offer))
        .then(() => signalingRef.current?.send({ type: "offer", sdp: peer.localDescription! }));
    }

    return peer;
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const signaling = new SignalingClient(roomId);
    signalingRef.current = signaling;

    const unsub = signaling.onMessage(async (msg) => {
      if (msg.type === "peer-joined") {
        peerRef.current?.close();
        peerRef.current = createPeer(true);
        return;
      }
      if (msg.type === "offer") {
        if (!peerRef.current) peerRef.current = createPeer(false);
        await peerRef.current.setRemoteDescription(msg.sdp);
        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        signaling.send({ type: "answer", sdp: peerRef.current.localDescription! });
        return;
      }
      if (msg.type === "answer") {
        await peerRef.current?.setRemoteDescription(msg.sdp);
        return;
      }
      if (msg.type === "ice-candidate") {
        try { await peerRef.current?.addIceCandidate(msg.candidate); } catch {}
        return;
      }
      if (msg.type === "peer-left") {
        peerRef.current?.close();
        peerRef.current = null;
        setRemoteStream(null);
        setConnectionState("idle");
      }
    });

    signaling.connect().then(() => signaling.send({ type: "ready" }));

    return () => {
      unsub();
      signaling.disconnect();
      peerRef.current?.close();
      peerRef.current = null;
    };
  }, [roomId, createPeer]);

  const hangUp = useCallback(() => {
    signalingRef.current?.disconnect();
    peerRef.current?.close();
    peerRef.current = null;
    setRemoteStream(null);
    setConnectionState("idle");
  }, []);

  return { remoteStream, connectionState, isConnected: connectionState === "connected", hangUp };
}
