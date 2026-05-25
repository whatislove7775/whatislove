"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SignalingClient } from "@/lib/webrtc/signalingClient";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
];

export type P2PStatus = "idle" | "connecting" | "waiting" | "connected" | "disconnected" | "failed";

interface UseP2PCallOptions {
  roomId: string;
  localStream: MediaStream | null;
  onEnd?: () => void;
}

export function useP2PCall({ roomId, localStream, onEnd }: UseP2PCallOptions) {
  const [status,      setStatus]      = useState<P2PStatus>("idle");
  const [isMuted,     setIsMuted]     = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [hasRemote,   setHasRemote]   = useState(false);
  const [elapsed,     setElapsed]     = useState(0);

  const pcRef          = useRef<RTCPeerConnection | null>(null);
  const sigRef         = useRef<SignalingClient | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const cancelRef      = useRef(false);
  const offerMadeRef   = useRef(false);
  const hasRemoteRef   = useRef(false);
  const elapsedTimer   = useRef<ReturnType<typeof setInterval>>();

  const stopElapsed = useCallback(() => {
    clearInterval(elapsedTimer.current);
    setElapsed(0);
  }, []);

  const startElapsed = useCallback(() => {
    stopElapsed();
    elapsedTimer.current = setInterval(() => setElapsed(e => e + 1), 1000);
  }, [stopElapsed]);

  const closePeer = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.ontrack              = null;
      pcRef.current.onicecandidate       = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    offerMadeRef.current = false;
  }, []);

  const makeOffer = useCallback(async () => {
    if (offerMadeRef.current || !pcRef.current || !sigRef.current) return;
    offerMadeRef.current = true;
    try {
      const offer = await pcRef.current.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pcRef.current.setLocalDescription(offer);
      sigRef.current.send({ type: "offer", sdp: offer });
    } catch (e) {
      console.error("[useP2PCall] createOffer failed:", e);
    }
  }, []);

  useEffect(() => {
    if (!localStream) return;
    cancelRef.current = false;
    setStatus("connecting");

    const sig = new SignalingClient(roomId);
    sigRef.current = sig;

    // Build RTCPeerConnection and add local tracks
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) sigRef.current?.send({ type: "ice-candidate", candidate: candidate.toJSON() });
    };

    pc.ontrack = ({ streams }) => {
      if (streams[0] && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = streams[0];
      }
      if (!hasRemoteRef.current) {
        hasRemoteRef.current = true;
        setHasRemote(true);
        setStatus("connected");
        startElapsed();
      }
    };

    pc.oniceconnectionstatechange = () => {
      const s = pc.iceConnectionState;
      if (s === "disconnected" || s === "failed" || s === "closed") {
        setHasRemote(false);
        setStatus(s === "failed" ? "failed" : "waiting");
        stopElapsed();
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      } else if (s === "connected" || s === "completed") {
        setStatus("connected");
      }
    };

    const unsubscribe = sig.onMessage(async (msg) => {
      if (cancelRef.current) return;
      try {
        switch (msg.type) {
          case "peer-joined":
            await makeOffer();
            break;

          case "ready":
            await makeOffer();
            break;

          case "offer":
            if (pc.signalingState === "have-local-offer") {
              // Glare: both peers sent offers. Roll back ours, accept theirs.
              await pc.setLocalDescription({ type: "rollback" });
              offerMadeRef.current = false;
            }
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sig.send({ type: "answer", sdp: answer });
            break;

          case "answer":
            if (pc.signalingState === "have-local-offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            }
            break;

          case "ice-candidate":
            if (pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
            break;

          case "peer-left":
          case "bye":
            hasRemoteRef.current = false;
            setHasRemote(false);
            setStatus("waiting");
            stopElapsed();
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            offerMadeRef.current = false;
            break;
        }
      } catch (e) {
        console.warn("[useP2PCall] signal handling error:", e);
      }
    });

    const init = async () => {
      try {
        await sig.connect();
      } catch {
        if (!cancelRef.current) setStatus("failed");
        return;
      }
      if (cancelRef.current) return;
      sig.send({ type: "ready" });
      setStatus("waiting");
    };

    init().catch(() => !cancelRef.current && setStatus("failed"));

    return () => {
      cancelRef.current = true;
      unsubscribe();
      sig.disconnect();
      closePeer();
      stopElapsed();
      setStatus("idle");
      setHasRemote(false);
    };
  }, [roomId, localStream]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = useCallback(() => {
    const sender = pcRef.current?.getSenders().find(s => s.track?.kind === "audio");
    if (sender?.track) {
      const next = !sender.track.enabled;
      sender.track.enabled = next;
      setIsMuted(!next);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const sender = pcRef.current?.getSenders().find(s => s.track?.kind === "video");
    if (sender?.track) {
      const next = !sender.track.enabled;
      sender.track.enabled = next;
      setIsCameraOff(!next);
    }
  }, []);

  const hangUp = useCallback(() => {
    cancelRef.current = true;
    sigRef.current?.disconnect();
    sigRef.current = null;
    closePeer();
    stopElapsed();
    setStatus("idle");
    setHasRemote(false);
    onEnd?.();
  }, [closePeer, stopElapsed, onEnd]);

  return {
    status, isMuted, isCameraOff, hasRemote, elapsed,
    remoteVideoRef, toggleMute, toggleCamera, hangUp,
  };
}
