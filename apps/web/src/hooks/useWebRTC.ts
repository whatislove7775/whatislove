"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SignalingClient } from "@/lib/webrtc/signalingClient";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "turn:openrelay.metered.ca:80",  username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
];

interface UseWebRTCOptions {
  roomId: string;
  localStream: MediaStream | null;
}

export function useWebRTC({ roomId, localStream }: UseWebRTCOptions) {
  const [remoteStream, setRemoteStream]     = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<string>("idle");
  const [signalingStatus, setSignalingStatus] = useState<string>("disconnected");

  const peerRef      = useRef<RTCPeerConnection | null>(null);
  const signalingRef = useRef<SignalingClient | null>(null);
  const remoteRef    = useRef(new MediaStream());

  const closePeer = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
  }, []);

  const makePeer = useCallback((stream: MediaStream, isCaller: boolean, signaling: SignalingClient) => {
    closePeer();
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local tracks
    stream.getTracks().forEach(t => pc.addTrack(t, stream));

    // Receive remote tracks
    remoteRef.current = new MediaStream();
    pc.ontrack = e => {
      e.streams[0].getTracks().forEach(t => remoteRef.current.addTrack(t));
      setRemoteStream(new MediaStream(remoteRef.current.getTracks()));
    };

    pc.onicecandidate = e => {
      if (e.candidate) signaling.send({ type: "ice-candidate", candidate: e.candidate.toJSON() });
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setConnectionState("connected");
      }
    };

    if (isCaller) {
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then(o => pc.setLocalDescription(o))
        .then(() => signaling.send({ type: "offer", sdp: pc.localDescription! }));
    }

    peerRef.current = pc;
    return pc;
  }, [closePeer]);

  useEffect(() => {
    // Wait for both roomId and camera stream before connecting
    if (!roomId || !localStream) return;

    const signaling = new SignalingClient(roomId);
    signalingRef.current = signaling;

    const unsub = signaling.onMessage(async msg => {
      if (!localStream) return;

      if (msg.type === "peer-joined") {
        makePeer(localStream, true, signaling);
        return;
      }
      if (msg.type === "offer") {
        const pc = makePeer(localStream, false, signaling);
        await pc.setRemoteDescription(msg.sdp);
        const ans = await pc.createAnswer();
        await pc.setLocalDescription(ans);
        signaling.send({ type: "answer", sdp: pc.localDescription! });
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
        closePeer();
        setRemoteStream(null);
        setConnectionState("idle");
      }
    });

    signaling.connect()
      .then(() => {
        setSignalingStatus("connected");
        signaling.send({ type: "ready" });
      })
      .catch(() => setSignalingStatus("error"));

    return () => {
      unsub();
      signaling.disconnect();
      closePeer();
      setSignalingStatus("disconnected");
    };
  }, [roomId, localStream, makePeer, closePeer]);

  const hangUp = useCallback(() => {
    signalingRef.current?.disconnect();
    closePeer();
    setRemoteStream(null);
    setConnectionState("idle");
  }, [closePeer]);

  return {
    remoteStream,
    connectionState,
    signalingStatus,
    isConnected: connectionState === "connected",
    hangUp,
  };
}
