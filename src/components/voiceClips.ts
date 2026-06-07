'use client';

// Простой проигрыватель голосовых клипов через Web Audio API.
// Загружает mp3, декодирует и обрезает тишину по краям (energy-gate),
// чтобы воспроизводить только сам произнесённый фрагмент.

type Clip = { buffer: AudioBuffer; start: number; end: number };

let ac: AudioContext | null = null;
const cache: Record<string, Clip> = {};
const pending: Record<string, Promise<Clip | null>> = {};

function getAC(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ac) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
  }
  return ac;
}

/**
 * Находит главный голосовой участок: считает RMS по окнам ~20мс,
 * берёт порог от пика и возвращает диапазон [start, end] в секундах.
 * mode 'full'  — весь голосовой диапазон (от первого до последнего звука);
 * mode 'last'  — последний сегмент после паузы (полезно, когда нужно
 *                извлечь конкретное слово в конце записи).
 */
function detectRange(buf: AudioBuffer, mode: 'full' | 'last'): { start: number; end: number } {
  const data = buf.getChannelData(0);
  const sr = buf.sampleRate;
  const win = Math.max(1, Math.floor(sr * 0.02)); // 20 мс
  const rms: number[] = [];
  for (let i = 0; i < data.length; i += win) {
    let sum = 0;
    const end = Math.min(i + win, data.length);
    for (let j = i; j < end; j++) sum += data[j] * data[j];
    rms.push(Math.sqrt(sum / (end - i)));
  }
  const peak = Math.max(...rms, 1e-6);
  const thresh = peak * 0.12;

  // индексы окон выше порога
  const voiced = rms.map(v => v >= thresh);

  // первый/последний голосовой индекс
  let first = voiced.indexOf(true);
  let last = voiced.lastIndexOf(true);
  if (first === -1) return { start: 0, end: buf.duration };

  if (mode === 'last') {
    // ищем начало последнего сегмента: идём от конца назад до паузы
    const gapWins = Math.ceil(0.06 / 0.02); // пауза > ~60мс разделяет сегменты
    let segStart = last;
    let silence = 0;
    for (let k = last; k >= first; k--) {
      if (voiced[k]) { segStart = k; silence = 0; }
      else { silence++; if (silence >= gapWins) break; }
    }
    first = segStart;
  }

  // небольшой запас по краям (10мс)
  const pad = 1;
  const start = Math.max(0, (first - pad) * win) / sr;
  const end = Math.min(data.length, (last + 1 + pad) * win) / sr;
  return { start, end };
}

async function loadClip(name: string, url: string, mode: 'full' | 'last'): Promise<Clip | null> {
  if (cache[name]) return cache[name];
  if (pending[name]) return pending[name];
  const ctx = getAC();
  if (!ctx) return null;
  pending[name] = (async () => {
    try {
      const ab = await fetch(url).then(r => r.arrayBuffer());
      const buffer = await ctx.decodeAudioData(ab);
      const { start, end } = detectRange(buffer, mode);
      const clip = { buffer, start, end };
      cache[name] = clip;
      return clip;
    } catch {
      return null;
    } finally {
      delete pending[name];
    }
  })();
  return pending[name];
}

/** Воспроизводит обрезанный голосовой клип. Вызывать из обработчика клика. */
export async function playVoice(name: string, url: string, mode: 'full' | 'last' = 'full', vol = 1) {
  const ctx = getAC();
  if (!ctx) return;
  if (ctx.state === 'suspended') { try { await ctx.resume(); } catch {} }
  const clip = await loadClip(name, url, mode);
  if (!clip) return;
  const src = ctx.createBufferSource();
  src.buffer = clip.buffer;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(g);
  g.connect(ctx.destination);
  src.start(0, clip.start, Math.max(0.05, clip.end - clip.start));
}
