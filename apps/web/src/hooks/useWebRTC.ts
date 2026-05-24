"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SignalingClient } from "@/lib/webrtc/signalingClient";

// Prefer VP8 (universal) → VP9 → H264; limit video to 800kbps, audio to 64kbps
function applyBandwidthConstraints(pc: RTCPeerConnection) {
  pc.getSenders().forEach(sender => {
    const params = sender.getParameters();
    if (!params.encodings?.length) params.encodings = [{}];
    if (sender.track?.kind === "video") {
      params.encodings[0].maxBitrate = 800_000;
      params.encodings[0].scaleResolutionDownBy = 1;
    } else if (sender.track?.kind === "audio") {
      params.encodings[0].maxBitrate = 64_000;
    }
    sender.setParameters(params).catch(() => {});
  });
}

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
  const [remoteStream, setRemoteStream]       = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<string>("idle");
  const [signalingStatus, setSignalingStatus] = useState<string>("disconnected");

  const peerRef         = useRef<RTCPeerConnection | null>(null);
  const signalingRef    = useRef<SignalingClient | null>(null);
  const localStreamRef  = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const isCallerRef     = useRef(false);

  // Keep localStreamRef current; replace tracks on existing peer — replaceTrack
  // never triggers renegotiation, keeping signaling clean.
  useEffect(() => {
    localStreamRef.current = localStream;
    const pc = peerRef.current;
    if (!pc || !localStream) return;
    const senders = pc.getSenders();
    localStream.getTracks().forEach(track => {
      const sender = senders.find(s => s.track?.kind === track.kind || s.track === null);
      if (sender) {
        sender.replaceTrack(track).catch(() => {});
      } else {
        // callee: no transceiver pre-created, so addTrack is fine (triggers renegotiation via onnegotiationneeded, which callee ignores)
        pc.addTrack(track, localStream);
      }
    });
  }, [localStream]);

  const makePeer = useCallback((isCaller: boolean): RTCPeerConnection => {
    peerRef.current?.close();
    isCallerRef.current = isCaller;

    const pc = new RTCPeerConnection({
      iceServers: ICE_SERVERS,
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
    });
    peerRef.current = pc;

    // Add tracks from current stream (only when callee — caller uses transceivers above)
    const stream = localStreamRef.current;
    if (stream && !isCaller) {
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
    }

    remoteStreamRef.current = new MediaStream();
    pc.ontrack = e => {
      // e.streams may be empty when caller uses addTransceiver — use e.track directly
      const track = e.track;
      if (!remoteStreamRef.current!.getTrackById(track.id)) {
        remoteStreamRef.current!.addTrack(track);
      }
      setRemoteStream(new MediaStream(remoteStreamRef.current!.getTracks()));
    };

    pc.onicecandidate = e => {
      if (e.candidate) signalingRef.current?.send({ type: "ice-candidate", candidate: e.candidate.toJSON() });
    };

    pc.onconnectionstatechange = () => setConnectionState(pc.connectionState);
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setConnectionState("connected");
        applyBandwidthConstraints(pc);
      }
    };

    // Only the caller drives negotiation — callee never sends unsolicited offers.
    // onnegotiationneeded is the single source of truth for offer creation.
    pc.onnegotiationneeded = async () => {
      if (!isCallerRef.current) return;
      if (pc.signalingState !== "stable") return;
      try {
        const offer = await pc.createOffer();
        if (pc.signalingState !== "stable") return; // recheck after async gap
        await pc.setLocalDescription(offer);
        signalingRef.current?.send({ type: "offer", sdp: pc.localDescription! });
      } catch (e) {
        console.error("onnegotiationneeded error:", e);
      }
    };

    // Caller: add sendrecv transceivers so onnegotiationneeded fires even before camera is ready.
    // If stream tracks are present they replace the transceiver senders below via replaceTrack.
    if (isCaller) {
      pc.addTransceiver("audio", { direction: "sendrecv" });
      pc.addTransceiver("video", { direction: "sendrecv" });
    }

    return pc;
  }, []);

  // WebSocket connects once — NOT dependent on localStream
  useEffect(() => {
    if (!roomId) return;

    const signaling = new SignalingClient(roomId);
    signalingRef.current = signaling;

    const unsub = signaling.onMessage(async msg => {
      const pc = peerRef.current;

      if (msg.type === "peer-joined") {
        makePeer(true);
        return;
      }

      if (msg.type === "offer") {
        if (pc && pc.signalingState !== "stable") {
          console.warn("Glare detected, ignoring offer in state:", pc.signalingState);
          return;
        }
        // Renegotiation: reuse existing peer; Initial: create new peer
        const activePc = pc ?? makePeer(false);
        await activePc.setRemoteDescription(msg.sdp);
        const ans = await activePc.createAnswer();
        await activePc.setLocalDescription(ans);
        signaling.send({ type: "answer", sdp: activePc.localDescription! });
        return;
      }

      if (msg.type === "answer") {
        if (!pc || pc.signalingState !== "have-local-offer") {
          console.warn("Ignoring answer in state:", pc?.signalingState);
          return;
        }
        await pc.setRemoteDescription(msg.sdp).catch(console.error);
        return;
      }

      if (msg.type === "ice-candidate") {
        if (pc?.remoteDescription) {
          await pc.addIceCandidate(msg.candidate).catch(console.error);
        }
        return;
      }

      if (msg.type === "peer-left") {
        peerRef.current?.close();
        peerRef.current = null;
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
      peerRef.current?.close();
      peerRef.current = null;
      signalingRef.current = null;
      setSignalingStatus("disconnected");
    };
  }, [roomId, makePeer]); // NO localStream dependency

  const hangUp = useCallback(() => {
    signalingRef.current?.disconnect();
    peerRef.current?.close();
    peerRef.current = null;
    setRemoteStream(null);
    setConnectionState("idle");
  }, []);

  return { remoteStream, connectionState, signalingStatus, isConnected: connectionState === "connected", hangUp };
}
