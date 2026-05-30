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
 * The output MediaStream is created ONCE per input and stays stable across
 * preset changes — switching presets only retunes the filter gains, so the
 * WebRTC connection is never torn down mid-call.
 */
export function useVoiceTransform({ inputStream, preset }: UseVoiceTransformOptions) {
  const [transformedStream, setTransformedStream] = useState<MediaStream | null>(null);
  const ctxRef    = useRef<AudioContext | null>(null);
  const filtersRef = useRef<{ low: BiquadFilterNode; peak: BiquadFilterNode; high: BiquadFilterNode } | null>(null);

  // Build the audio graph once per input stream.
  useEffect(() => {
    setTransformedStream(null);
    filtersRef.current = null;
    if (!inputStream || inputStream.getAudioTracks().length === 0) {
      setTransformedStream(inputStream);
      return;
    }

    const audioCtx = new AudioContext();
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

    setTransformedStream(new MediaStream(dest.stream.getAudioTracks()));

    return () => {
      audioCtx.close().catch(() => {});
      if (ctxRef.current === audioCtx) ctxRef.current = null;
      filtersRef.current = null;
    };
  }, [inputStream]);

  // Retune filter gains when the preset changes (no graph rebuild).
  useEffect(() => {
    const f = filtersRef.current;
    if (!f) return;
    const [lo, pk, hi] =
      preset === "lower"  ? [ 7, -4, -3] :
      preset === "higher" ? [-6,  3,  5] :
      /* off */             [ 0,  0,  0];
    f.low.gain.value  = lo;
    f.peak.gain.value = pk;
    f.high.gain.value = hi;
  }, [preset, transformedStream]);

  return { transformedStream };
}
