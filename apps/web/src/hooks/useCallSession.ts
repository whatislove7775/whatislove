"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const JITSI_DOMAIN = "meet.jit.si";

export type CallStatus = "idle" | "loading" | "connected" | "reconnecting" | "failed";

interface UseCallSessionOptions {
  roomId:      string;
  displayName: string;
  onEnd?:      () => void;
}

// Singleton script loader — loads external_api.js once per page
let _scriptPromise: Promise<void> | null = null;
function loadJitsiScript(): Promise<void> {
  if (typeof (window as any).JitsiMeetExternalAPI !== "undefined") return Promise.resolve();
  if (_scriptPromise) return _scriptPromise;
  _scriptPromise = new Promise((resolve, reject) => {
    const s  = document.createElement("script");
    s.src    = `https://${JITSI_DOMAIN}/external_api.js`;
    s.async  = true;
    s.onload = () => resolve();
    s.onerror = () => { _scriptPromise = null; reject(new Error("Jitsi script load failed")); };
    document.head.appendChild(s);
  });
  return _scriptPromise;
}

export function useCallSession({ roomId, displayName, onEnd }: UseCallSessionOptions) {
  const [status,      setStatus]      = useState<CallStatus>("idle");
  const [isMuted,     setIsMuted]     = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [hasRemote,   setHasRemote]   = useState(false);

  const apiRef        = useRef<any>(null);
  const containerRef  = useRef<HTMLDivElement | null>(null);
  const cancelRef     = useRef(false);
  const retryCount    = useRef(0);
  const retryTimer    = useRef<ReturnType<typeof setTimeout>>();
  const participantCount = useRef(0);

  // Dispose Jitsi instance and clear retry timer
  const dispose = useCallback(() => {
    clearTimeout(retryTimer.current);
    if (apiRef.current) {
      try { apiRef.current.dispose(); } catch { /* ignore */ }
      apiRef.current = null;
    }
  }, []);

  // Core connect logic — called initially and on reconnect
  const connect = useCallback(async (container: HTMLDivElement) => {
    if (cancelRef.current) return;
    setStatus("loading");

    try {
      await loadJitsiScript();
      if (cancelRef.current) return;

      dispose();

      // Room name is deterministic from our session ID
      const roomName = `aprosop-${roomId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 24)}`;

      const api = new (window as any).JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        width:      "100%",
        height:     "100%",
        parentNode: container,
        userInfo:   { displayName },

        configOverwrite: {
          startWithAudioMuted:    false,
          startWithVideoMuted:    false,
          enableWelcomePage:      false,
          prejoinPageEnabled:     false,
          disableDeepLinking:     true,
        },

        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS:                [],   // hide Jitsi's toolbar — we use our own
          HIDE_INVITE_MORE_HEADER:        true,
          SHOW_JITSI_WATERMARK:           false,
          SHOW_WATERMARK_FOR_GUESTS:      false,
          SHOW_CHROME_EXTENSION_BANNER:   false,
          MOBILE_APP_PROMO:               false,
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          CLOSE_PAGE_GUEST_HINT:          false,
          DEFAULT_REMOTE_DISPLAY_NAME:    "Участник",
        },
      });

      apiRef.current = api;

      api.addEventListener("videoConferenceJoined", () => {
        retryCount.current = 0;
        participantCount.current = 0;
        setHasRemote(false);
        setStatus("connected");
      });

      api.addEventListener("participantJoined", () => {
        participantCount.current += 1;
        setHasRemote(participantCount.current > 0);
      });
      api.addEventListener("participantLeft", () => {
        participantCount.current = Math.max(0, participantCount.current - 1);
        setHasRemote(participantCount.current > 0);
      });

      api.addEventListener("readyToClose", () => {
        if (!cancelRef.current) onEnd?.();
      });

      api.addEventListener("audioMuteStatusChanged", ({ muted }: { muted: boolean }) => {
        setIsMuted(muted);
      });

      api.addEventListener("videoMuteStatusChanged", ({ muted }: { muted: boolean }) => {
        setIsCameraOff(muted);
      });

      // Reconnect with exponential backoff on connection failure
      api.addEventListener("connectionFailed", () => {
        if (cancelRef.current) return;
        const delay = Math.min(1000 * 2 ** retryCount.current, 30_000); // max 30s
        retryCount.current += 1;
        setStatus("reconnecting");
        dispose();
        retryTimer.current = setTimeout(() => {
          if (!cancelRef.current && containerRef.current) {
            connect(containerRef.current);
          }
        }, delay);
      });

      // Network quality monitoring — Jitsi handles adaptive bitrate internally,
      // but we can trigger manual quality hints on slow connections
      const nav = navigator as any;
      if (nav.connection) {
        const onNetworkChange = () => {
          if (!apiRef.current) return;
          const type = nav.connection.effectiveType;
          // On very slow connections, disable video to keep audio stable
          if (type === "2g" || type === "slow-2g") {
            apiRef.current.executeCommand("toggleVideo");
          }
        };
        nav.connection.addEventListener("change", onNetworkChange);
        // Store cleanup fn on the api object for later removal
        (api as any)._netCleanup = () =>
          nav.connection.removeEventListener("change", onNetworkChange);
      }

    } catch (err: any) {
      if (!cancelRef.current) setStatus("failed");
    }
  }, [roomId, displayName, onEnd, dispose]);

  // Initialize: attach container ref and start connection
  const initContainer = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (el && !cancelRef.current) connect(el);
  }, [connect]);

  // Controls — delegate to Jitsi API commands
  const toggleMute   = useCallback(() => apiRef.current?.executeCommand("toggleAudio"),    []);
  const toggleCamera = useCallback(() => apiRef.current?.executeCommand("toggleVideo"),    []);
  const hangUp       = useCallback(() => {
    cancelRef.current = true;
    // Cleanup network listener if installed
    if (apiRef.current?._netCleanup) apiRef.current._netCleanup();
    dispose();
    onEnd?.();
  }, [dispose, onEnd]);

  // Component unmount cleanup
  useEffect(() => {
    cancelRef.current  = false;
    retryCount.current = 0;
    participantCount.current = 0;
    return () => {
      cancelRef.current = true;
      if (apiRef.current?._netCleanup) apiRef.current._netCleanup();
      dispose();
    };
  }, [dispose]);

  return { status, isMuted, isCameraOff, hasRemote, initContainer, toggleMute, toggleCamera, hangUp };
}
