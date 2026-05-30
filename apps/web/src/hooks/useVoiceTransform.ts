"use client";

import { useEffect, useRef, useState } from "react";

export type VoicePreset = "off" | "lower" | "higher";

interface UseVoiceTransformOptions {
  inputStream: MediaStream | null;
  preset: VoicePreset;
}

export function useVoiceTransform({ inputStream, preset }: UseVoiceTransformOptions) {
  const [transformedStream, setTransformedStream] = useState<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Cleanup previous AudioContext
    const prevCtx = ctxRef.current;
    if (prevCtx) {
      prevCtx.close().catch(() => {});
      ctxRef.current = null;
    }
    setTransformedStream(null);

    if (!inputStream) return;

    // When preset is "off", return inputStream unchanged (with original video tracks)
    if (preset === "off") {
      setTransformedStream(inputStream);
      return;
    }

    const audioTracks = inputStream.getAudioTracks();
    if (audioTracks.length === 0) {
      setTransformedStream(inputStream);
      return;
    }

    let cancelled = false;

    const audioCtx = new AudioContext();
    ctxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(new MediaStream(audioTracks));
    const dest = audioCtx.createMediaStreamDestination();

    // Build BiquadFilter chain
    const lowshelf = audioCtx.createBiquadFilter();
    lowshelf.type = "lowshelf";
    lowshelf.frequency.value = 320;

    const peaking = audioCtx.createBiquadFilter();
    peaking.type = "peaking";
    peaking.frequency.value = 1000;
    peaking.Q.value = 1.2;

    const highshelf = audioCtx.createBiquadFilter();
    highshelf.type = "highshelf";
    highshelf.frequency.value = 2500;

    if (preset === "lower") {
      lowshelf.gain.value  = 7;
      peaking.gain.value   = -4;
      highshelf.gain.value = -3;
    } else {
      // "higher"
      lowshelf.gain.value  = -6;
      peaking.gain.value   = 3;
      highshelf.gain.value = 5;
    }

    source.connect(lowshelf);
    lowshelf.connect(peaking);
    peaking.connect(highshelf);
    highshelf.connect(dest);

    // Combine transformed audio with original video tracks
    const transformedAudioTracks = dest.stream.getAudioTracks();
    const videoTracks = inputStream.getVideoTracks();
    const combined = new MediaStream([...transformedAudioTracks, ...videoTracks]);

    if (!cancelled) {
      setTransformedStream(combined);
    }

    return () => {
      cancelled = true;
      audioCtx.close().catch(() => {});
      if (ctxRef.current === audioCtx) ctxRef.current = null;
    };
  }, [inputStream, preset]); // eslint-disable-line react-hooks/exhaustive-deps

  return { transformedStream };
}
