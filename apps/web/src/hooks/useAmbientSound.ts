"use client";

import { useEffect, useRef, useState } from "react";

export type AmbientPreset = "rain" | "forest" | "ocean" | "off";

export function useAmbientSound(micStream: MediaStream | null) {
  const [preset, setPreset]   = useState<AmbientPreset>("rain");
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume]   = useState(0.25);

  const ctxRef      = useRef<AudioContext | null>(null);
  const gainRef     = useRef<GainNode | null>(null);
  const noiseRef    = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceRef  = useRef<ReturnType<typeof setInterval>>();

  // Synthesize nature sound via colored noise + filters
  const buildNoise = (ctx: AudioContext, type: AmbientPreset): AudioBufferSourceNode => {
    const bufLen = ctx.sampleRate * 4;
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data   = buf.getChannelData(0);

    // Pink noise approximation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
    for (let i = 0; i < bufLen; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop   = true;

    // Shape the noise with filters per preset
    const filters: BiquadFilterNode[] = [];

    if (type === "rain") {
      const hi = ctx.createBiquadFilter();
      hi.type = "highpass"; hi.frequency.value = 800; hi.Q.value = 0.5;
      const lo = ctx.createBiquadFilter();
      lo.type = "lowpass"; lo.frequency.value = 8000;
      filters.push(hi, lo);
    } else if (type === "forest") {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 1200; lp.Q.value = 0.8;
      const pk = ctx.createBiquadFilter();
      pk.type = "peaking"; pk.frequency.value = 400; pk.gain.value = 6;
      filters.push(lp, pk);
    } else if (type === "ocean") {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass"; lp.frequency.value = 600; lp.Q.value = 1.2;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass"; hp.frequency.value = 80;
      filters.push(lp, hp);
    }

    // Chain: src → filters → gain
    let node: AudioNode = src;
    for (const f of filters) { node.connect(f); node = f; }
    return src; // caller connects to gain
  };

  const stop = () => {
    clearInterval(silenceRef.current);
    noiseRef.current?.stop();
    noiseRef.current = null;
    ctxRef.current?.close();
    ctxRef.current  = null;
    gainRef.current = null;
  };

  useEffect(() => {
    if (!enabled || preset === "off") { stop(); return; }

    const ctx  = new AudioContext();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);

    ctxRef.current  = ctx;
    gainRef.current = gain;

    const src = buildNoise(ctx, preset);

    // Connect noise through filter chain to gain
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = preset === "rain" ? 8000 : preset === "ocean" ? 600 : 1200;
    src.connect(lp);
    lp.connect(gain);
    src.start();
    noiseRef.current = src;

    // Silence detection: boost volume during quiet pauses
    if (micStream) {
      const micSrc  = ctx.createMediaStreamSource(micStream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      micSrc.connect(analyser);
      analyserRef.current = analyser;
      const buf = new Uint8Array(analyser.frequencyBinCount);

      silenceRef.current = setInterval(() => {
        analyser.getByteFrequencyData(buf);
        const rms = buf.reduce((a, b) => a + b, 0) / buf.length;
        const target = rms < 10 ? Math.min(volume * 2, 0.6) : volume;
        if (gainRef.current) gainRef.current.gain.linearRampToValueAtTime(target, ctx.currentTime + 1.5);
      }, 1500);
    }

    return stop;
  }, [enabled, preset]);

  // Update volume live
  useEffect(() => {
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.linearRampToValueAtTime(volume, ctxRef.current.currentTime + 0.3);
    }
  }, [volume]);

  return { preset, setPreset, enabled, setEnabled, volume, setVolume };
}
