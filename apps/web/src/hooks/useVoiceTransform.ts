"use client";

import { useEffect, useRef, useState } from "react";

export type VoicePreset = "off" | "lower" | "higher";

interface UseVoiceTransformOptions {
  inputStream: MediaStream | null;
  preset: VoicePreset;
}

/**
 * useVoiceTransform — local, in-browser voice masking (no server compute).
 *
 * A lowshelf → peaking → highshelf BiquadFilter chain reshapes the voice's
 * formants so it sounds noticeably different while staying intelligible.
 *
 * Fast path: when preset is "off", the AudioContext is bypassed entirely —
 * the raw inputStream is returned as-is with zero added latency.
 *
 * Switching between "lower" / "higher" rebuilds the graph (and the AudioContext)
 * once. Switching TO "off" tears it down and returns the raw stream immediately.
 */
export function useVoiceTransform({ inputStream, preset }: UseVoiceTransformOptions) {
  const [transformedStream, setTransformedStream] = useState<MediaStream | null>(null);
  const ctxRef    = useRef<AudioContext | null>(null);
  const filtersRef = useRef<{ low: BiquadFilterNode; peak: BiquadFilterNode; high: BiquadFilterNode } | null>(null);

  useEffect(() => {
    setTransformedStream(null);
    filtersRef.current = null;

    if (!inputStream || inputStream.getAudioTracks().length === 0) {
      setTransformedStream(inputStream);
      return;
    }
    if (preset === "off") {
      setTransformedStream(inputStream);
      return;
    }

    const audioCtx = new AudioContext({ latencyHint: "interactive", sampleRate: 48000 });
    ctxRef.current = audioCtx;

    const source = audioCtx.createMediaStreamSource(new MediaStream(inputStream.getAudioTracks()));
    const dest   = audioCtx.createMediaStreamDestination();

    const low = audioCtx.createBiquadFilter();
    low.type = "lowshelf"; low.frequency.value = 320;
    const peak = audioCtx.createBiquadFilter();
    peak.type = "peaking"; peak.frequency.value = 1000; peak.Q.value = 1.2;
    const high = audioCtx.createBiquadFilter();
    high.type = "highshelf"; high.frequency.value = 2500;

    source.connect(low); low.connect(peak); peak.connect(high); high.connect(dest);
    filtersRef.current = { low, peak, high };

    const [lo, pk, hi] =
      preset === "lower"  ? [ 7, -4, -3] :
      /* higher */          [-6,  3,  5];
    low.gain.value = lo; peak.gain.value = pk; high.gain.value = hi;

    setTransformedStream(new MediaStream(dest.stream.getAudioTracks()));

    return () => {
      audioCtx.close().catch(() => {});
      if (ctxRef.current === audioCtx) ctxRef.current = null;
      filtersRef.current = null;
    };
  }, [inputStream, preset]);

  return { transformedStream };
}
