"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SignalingClient } from "@/lib/webrtc/signalingClient";

function applyBandwidthConstraints(pc: RTCPeerConnection) {
  pc.getSenders().forEach(sender => {
    const params = sender.getParameters();
    if (!params.encodings?.length) params.encodings = [{}];
    if (sender.track?.kind === "video") params.encodings[0].maxBitrate = 800_000;
    else if (sender.track?.kind === "audio") params.encodings[0].maxBitrate = 64_000;
    sender.setParameters(params).catch(() => {});
  });
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  // TURN временно отключён — включить после проверки coturn на сервере
  // { urls: ["turn:155.212.128.231:3478", "turn:155.212.128.231:3478?transport=tcp"],
  //   username: "aprosop", credential: "anonpsy2024turn" },
];

interface UseWebRTCOptions {
  roomId: string;
  localStream: MediaStream | null;
}

export function useWebRTC({ roomId, localStream }: UseWebRTCOptions) {
  const [remoteStream,     setRemoteStream]     = useState<MediaStream | null>(null);
  const [connectionState,  setConnectionState]  = useState<string>("idle");
  const [signalingStatus,  setSignalingStatus]  = useState<string>("disconnected");

  const peerRef          = useRef<RTCPeerConnection | null>(null);
  const signalingRef     = useRef<SignalingClient | null>(null);
  const localStreamRef   = useRef<MediaStream | null>(null);
  const remoteStreamRef  = useRef<MediaStream | null>(null);
  const isCallerRef      = useRef(false);
  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]); // buffer candidates arriving before SDP

  // Attach stream tracks to peer transceivers by kind.
  // replaceTrack never triggers renegotiation; addTrack does only if no matching transceiver.
  const attachTracks = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    const transceivers = pc.getTransceivers();
    stream.getTracks().forEach(track => {
      const transceiver = transceivers.find(t => t.kind === track.kind);
      if (transceiver) {
        // replaceTrack works even when sender.track is null
        transceiver.sender.replaceTrack(track).catch(() => {});
      } else {
        // No transceiver for this kind (callee before renegotiation) — addTrack creates one
        pc.addTrack(track, stream);
      }
    });
  }, []);

  // Drain ICE candidates that arrived before remote description was set
  const drainQueue = useCallback(async (pc: RTCPeerConnection) => {
    const queued = iceCandidateQueue.current.splice(0);
    for (const c of queued) {
      await pc.addIceCandidate(c).catch(console.error);
    }
  }, []);

  // When localStream changes: update ref and push tracks to existing peer
  useEffect(() => {
    localStreamRef.current = localStream;
    const pc = peerRef.current;
    if (!pc || !localStream) return;
    attachTracks(pc, localStream);
  }, [localStream, attachTracks]);

  const makePeer = useCallback((isCaller: boolean): RTCPeerConnection => {
    peerRef.current?.close();
    isCallerRef.current   = isCaller;
    iceCandidateQueue.current = [];

    const pc = new RTCPeerConnection({
      iceServers:          ICE_SERVERS,
      bundlePolicy:        "max-bundle",
      rtcpMuxPolicy:       "require",
      iceCandidatePoolSize: 10, // pre-gather candidates before offer/answer
    } as RTCConfiguration);
    peerRef.current = pc;

    remoteStreamRef.current = new MediaStream();
    pc.ontrack = e => {
      const track = e.track;
      if (!remoteStreamRef.current!.getTrackById(track.id)) {
        remoteStreamRef.current!.addTrack(track);
      }
      setRemoteStream(new MediaStream(remoteStreamRef.current!.getTracks()));
    };

    pc.onicecandidate = e => {
      if (e.candidate) signalingRef.current?.send({ type: "ice-candidate", candidate: e.candidate.toJSON() });
    };

    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState);
      if (pc.connectionState === "connected") applyBandwidthConstraints(pc);
    };

    if (isCaller) {
      // Add sendrecv transceivers, attach current stream tracks immediately
      pc.addTransceiver("audio", { direction: "sendrecv" });
      pc.addTransceiver("video", { direction: "sendrecv" });
      const stream = localStreamRef.current;
      if (stream) attachTracks(pc, stream);

      // Create offer immediately — faster than waiting for onnegotiationneeded (async event)
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .then(() => signalingRef.current?.send({ type: "offer", sdp: pc.localDescription! }))
        .catch(err => console.error("createOffer:", err));
    }
    // Callee does NOT add tracks here — added after setRemoteDescription (correct transceiver binding)

    return pc;
  }, [attachTracks]);

  // WebSocket — connects once, does NOT depend on localStream
  useEffect(() => {
    if (!roomId) return;

    const signaling = new SignalingClient(roomId);
    signalingRef.current = signaling;

    const unsub = signaling.onMessage(async msg => {
      let pc = peerRef.current;

      if (msg.type === "peer-joined") {
        makePeer(true);
        return;
      }

      if (msg.type === "offer") {
        if (pc && pc.signalingState !== "stable") {
          console.warn("Glare — ignoring offer in state:", pc.signalingState);
          return;
        }
        const activePc = pc ?? makePeer(false);

        await activePc.setRemoteDescription(msg.sdp);
        await drainQueue(activePc); // flush any early ICE candidates

        // Attach local tracks AFTER setRemoteDescription so they bind
        // to the offer's transceivers (correct codec/kind pairing)
        const stream = localStreamRef.current;
        if (stream) attachTracks(activePc, stream);

        const answer = await activePc.createAnswer();
        await activePc.setLocalDescription(answer);
        signaling.send({ type: "answer", sdp: activePc.localDescription! });
        return;
      }

      if (msg.type === "answer") {
        if (!pc || pc.signalingState !== "have-local-offer") {
          console.warn("Ignoring answer in state:", pc?.signalingState);
          return;
        }
        await pc.setRemoteDescription(msg.sdp).catch(console.error);
        await drainQueue(pc); // flush any early ICE candidates
        return;
      }

      if (msg.type === "ice-candidate") {
        pc = peerRef.current;
        if (!pc) return;
        if (pc.remoteDescription) {
          await pc.addIceCandidate(msg.candidate).catch(console.error);
        } else {
          // Queue until remote description is set
          iceCandidateQueue.current.push(msg.candidate);
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
      iceCandidateQueue.current = [];
      setSignalingStatus("disconnected");
    };
  }, [roomId, makePeer, attachTracks, drainQueue]);

  const hangUp = useCallback(() => {
    signalingRef.current?.send({ type: "peer-left" });
    signalingRef.current?.disconnect();
    peerRef.current?.close();
    peerRef.current = null;
    setRemoteStream(null);
    setConnectionState("idle");
  }, []);

  return {
    remoteStream,
    connectionState,
    signalingStatus,
    isConnected: connectionState === "connected",
    hangUp,
  };
}
