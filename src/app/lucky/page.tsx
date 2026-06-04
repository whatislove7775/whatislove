'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const CW = 800, CH = 300, GROUND = 245;
const P = 2;
const DOG_X = 80;
const GRAVITY = 0.58, JUMP_V = -13.5, JUMP_V2 = -11;
const SPEED0 = 5, SPEED_MAX = 16;
const STEP = 1000 / 60;

function p(n: number) { return n * P; }
function px(ctx: CanvasRenderingContext2D, c: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
}

// Day palette
const D_INK = '#535353', D_BG = '#ffffff', D_HI = '#9e9e9e', D_LITE = '#d0d0d0';
const D_CLOUD = '#efefef', D_CANVAS = '#ffffff';
// Night palette
const N_INK = '#d0d0d0', N_BG = '#1a1a1a', N_HI = '#888888', N_LITE = '#3a3a3a';
const N_CLOUD = '#2a2a2a', N_CANVAS = '#1a1a1a';

const DOG_W = p(20), DOG_H = p(22);

function buildDuckSprite(leg: number, dead: boolean, ink: string, bg: string, colored = false): HTMLCanvasElement {
  const FILL = colored ? '#f4f4f4' : bg;    // white plumage
  const SHAD = colored ? '#cfcfcf' : bg;    // soft shading
  const WING = colored ? '#bdbdbd' : bg;    // wing crease
  const BEAK = colored ? '#e8841a' : ink;   // orange bill
  const BEAKD= colored ? '#b85f00' : ink;   // bill shadow
  const LEGS = colored ? '#e8841a' : ink;   // orange legs

  const c = document.createElement('canvas');
  c.width = DOG_W; c.height = DOG_H + p(2);
  const ctx = c.getContext('2d')!;
  const y = p(2);

  // ════ INK SILHOUETTE (outline) ════
  // Head
  px(ctx, ink, p(13), y+p(0), p(3), p(1));
  px(ctx, ink, p(12), y+p(1), p(5), p(1));
  px(ctx, ink, p(12), y+p(2), p(4), p(1));
  // Neck (tall, gentle S-curve)
  px(ctx, ink, p(12), y+p(3), p(3), p(1));
  px(ctx, ink, p(11), y+p(4), p(3), p(1));
  px(ctx, ink, p(11), y+p(5), p(3), p(1));
  px(ctx, ink, p(10), y+p(6), p(3), p(1));
  px(ctx, ink, p(10), y+p(7), p(3), p(1));
  // Body (plump teardrop)
  px(ctx, ink, p(4),  y+p(8),  p(9),  p(1));
  px(ctx, ink, p(2),  y+p(9),  p(12), p(1));
  px(ctx, ink, p(1),  y+p(10), p(14), p(1));
  px(ctx, ink, p(1),  y+p(11), p(14), p(1));
  px(ctx, ink, p(1),  y+p(12), p(14), p(1));
  px(ctx, ink, p(1),  y+p(13), p(13), p(1));
  px(ctx, ink, p(2),  y+p(14), p(11), p(1));
  px(ctx, ink, p(3),  y+p(15), p(9),  p(1));
  px(ctx, ink, p(4),  y+p(16), p(7),  p(1));
  // Tail (upturned flick, back-left)
  px(ctx, ink, p(1),  y+p(7),  p(3),  p(1));
  px(ctx, ink, p(0),  y+p(8),  p(4),  p(1));
  px(ctx, ink, p(0),  y+p(9),  p(3),  p(1));

  // ════ WHITE FILL (inset by 1px for a clean outline) ════
  px(ctx, FILL, p(13), y+p(1), p(3), p(1));   // head interior
  px(ctx, FILL, p(13), y+p(2), p(2), p(1));
  px(ctx, FILL, p(13), y+p(3), p(1), p(1));   // neck interior
  px(ctx, FILL, p(12), y+p(4), p(1), p(1));
  px(ctx, FILL, p(12), y+p(5), p(1), p(1));
  px(ctx, FILL, p(11), y+p(6), p(1), p(1));
  px(ctx, FILL, p(11), y+p(7), p(1), p(1));
  px(ctx, FILL, p(4),  y+p(9),  p(9),  p(1)); // body interior
  px(ctx, FILL, p(2),  y+p(10), p(12), p(1));
  px(ctx, FILL, p(2),  y+p(11), p(12), p(1));
  px(ctx, FILL, p(2),  y+p(12), p(12), p(1));
  px(ctx, FILL, p(2),  y+p(13), p(11), p(1));
  px(ctx, FILL, p(3),  y+p(14), p(9),  p(1));
  px(ctx, FILL, p(4),  y+p(15), p(7),  p(1));
  px(ctx, FILL, p(1),  y+p(8),  p(2),  p(1)); // tail interior

  // ════ SOFT BELLY SHADING ════
  px(ctx, SHAD, p(2),  y+p(13), p(9),  p(1));
  px(ctx, SHAD, p(3),  y+p(14), p(7),  p(1));

  // ════ WING (folded, diagonal crease) ════
  px(ctx, WING, p(6),  y+p(11), p(7), p(1));
  px(ctx, WING, p(7),  y+p(12), p(6), p(1));
  px(ctx, WING, p(9),  y+p(13), p(4), p(1));

  // ════ EYE ════
  if (dead) {
    px(ctx, ink, p(13), y+p(1), p(1), p(1));
    px(ctx, ink, p(14), y+p(1), p(1), p(1));
    px(ctx, ink, p(13), y+p(2), p(1), p(1));
    px(ctx, ink, p(14), y+p(2), p(1), p(1));
  } else {
    px(ctx, ink, p(14), y+p(1), p(1), p(1));
  }

  // ════ BILL (flat, orange, pointing right) ════
  px(ctx, BEAK,  p(16), y+p(1), p(4), p(1));  // upper bill
  px(ctx, BEAKD, p(19), y+p(1), p(1), p(1));  // bill tip shadow
  px(ctx, BEAK,  p(16), y+p(2), p(3), p(1));  // lower bill
  px(ctx, BEAKD, p(16), y+p(2), p(3), p(1));  // under-bill shadow
  px(ctx, ink,   p(17), y+p(1), p(1), p(1));  // nostril

  // ════ LEGS + WEBBED FEET (orange, walk cycle) ════
  if (leg === 0) {
    px(ctx, LEGS, p(6),  y+p(16), p(2), p(4));  // back leg straight
    px(ctx, LEGS, p(4),  y+p(20), p(6), p(1));  // back webbed foot
    px(ctx, LEGS, p(9),  y+p(16), p(2), p(3));  // front leg bent
    px(ctx, LEGS, p(8),  y+p(19), p(6), p(1));  // front webbed foot
  } else {
    px(ctx, LEGS, p(6),  y+p(16), p(2), p(3));  // back leg bent
    px(ctx, LEGS, p(4),  y+p(19), p(6), p(1));  // back webbed foot
    px(ctx, LEGS, p(9),  y+p(16), p(2), p(4));  // front leg straight
    px(ctx, LEGS, p(8),  y+p(20), p(6), p(1));  // front webbed foot
  }
  return c;
}

const POOP_W = p(16), POOP_H = p(18);

function buildHydrantSprite(ink: string, bg: string, colored = false): HTMLCanvasElement {
  const RED  = colored ? '#cc2200' : ink;   // main red body
  const HI   = colored ? '#ff5533' : bg;    // lighter red highlight
  const BOLT = colored ? '#666666' : bg;    // bolt/detail color

  const c = document.createElement('canvas');
  c.width = POOP_W; c.height = POOP_H;
  const ctx = c.getContext('2d')!;
  // Top bolt cap
  px(ctx, RED,  p(6), p(0),  p(4), p(1));
  px(ctx, RED,  p(5), p(1),  p(6), p(1));
  // Dome
  px(ctx, RED,  p(4), p(2),  p(8), p(1));
  px(ctx, RED,  p(3), p(3),  p(10), p(1));
  px(ctx, HI,   p(7), p(3),  p(2), p(1));   // dome highlight
  // Neck
  px(ctx, RED,  p(5), p(4),  p(6), p(1));
  // Collar flanges
  px(ctx, RED,  p(3), p(5),  p(10), p(1));
  px(ctx, RED,  p(2), p(6),  p(12), p(1));
  // Main barrel
  px(ctx, RED,  p(3), p(7),  p(10), p(8));
  // Front nozzle highlight + center bolt
  px(ctx, HI,   p(6), p(9),  p(4), p(3));
  px(ctx, BOLT, p(7), p(9),  p(1), p(1));
  px(ctx, BOLT, p(8), p(11), p(1), p(1));
  px(ctx, BOLT, p(7), p(10), p(2), p(1));
  // Top-barrel highlight stripe
  px(ctx, HI,   p(6), p(7),  p(4), p(1));
  // Chain bolt at top of barrel
  px(ctx, BOLT, p(7), p(7),  p(2), p(1));
  // Side nozzles
  px(ctx, RED,  p(0),  p(8),  p(3), p(3));
  px(ctx, RED,  p(13), p(8),  p(3), p(3));
  px(ctx, HI,   p(0),  p(9),  p(1), p(1));
  px(ctx, HI,   p(15), p(9),  p(1), p(1));
  // Waist
  px(ctx, RED,  p(4), p(15), p(8),  p(1));
  // Base flange
  px(ctx, RED,  p(3), p(16), p(10), p(1));
  px(ctx, RED,  p(1), p(17), p(14), p(1));
  return c;
}

const BIRD_W = p(20), BIRD_H = p(13);

function buildFlyingDuckSprite(wing: number, ink: string, bg: string, colored = false): HTMLCanvasElement {
  const FILL = colored ? '#f0f0f0' : bg;
  const WING = colored ? '#c0c0c0' : bg;
  const BEAK = colored ? '#e87820' : ink;

  const c = document.createElement('canvas');
  const yb = p(3);
  c.width = BIRD_W; c.height = BIRD_H;
  const ctx = c.getContext('2d')!;

  // ── Tail ──
  px(ctx, ink,  p(0), yb+p(2), p(3), p(2));
  px(ctx, ink,  p(1), yb+p(1), p(2), p(1));
  px(ctx, FILL, p(1), yb+p(2), p(1), p(1));

  // ── Body fill then outline ──
  px(ctx, FILL, p(3), yb+p(3), p(7), p(2));   // interior
  px(ctx, ink,  p(2), yb+p(2), p(9), p(1));   // top edge
  px(ctx, ink,  p(2), yb+p(3), p(1), p(3));   // left side
  px(ctx, ink,  p(3), yb+p(6), p(8), p(1));   // bottom edge
  px(ctx, ink,  p(10),yb+p(3), p(1), p(3));   // right side body
  // Wing crease
  px(ctx, WING, p(4), yb+p(4), p(5), p(1));

  // ── Neck + head fill then outline ──
  px(ctx, FILL, p(12), yb+p(2), p(3), p(2));  // head interior
  px(ctx, ink,  p(11), yb+p(1), p(5), p(1));  // head top
  px(ctx, ink,  p(10), yb+p(2), p(2), p(3));  // neck+head left
  px(ctx, ink,  p(15), yb+p(2), p(1), p(3));  // head right edge
  px(ctx, ink,  p(11), yb+p(5), p(4), p(1));  // head bottom

  // ── Eye ──
  px(ctx, ink, p(13), yb+p(2), p(1), p(1));

  // ── Beak (orange, flat bill) ──
  px(ctx, BEAK, p(16), yb+p(2), p(4), p(1));  // upper bill
  px(ctx, BEAK, p(17), yb+p(3), p(2), p(1));  // bill tip
  px(ctx, BEAK, p(16), yb+p(4), p(4), p(1));  // lower bill

  // ── Wings (up or down flap) ──
  if (wing === 0) {
    px(ctx, ink,  p(4), yb-p(2), p(7), p(2));
    px(ctx, ink,  p(5), yb-p(3), p(4), p(1));
    px(ctx, FILL, p(5), yb-p(2), p(5), p(1));  // wing fill
  } else {
    px(ctx, ink,  p(4), yb+p(7), p(7), p(2));
    px(ctx, ink,  p(5), yb+p(9), p(4), p(1));
    px(ctx, FILL, p(5), yb+p(7), p(5), p(1));  // wing fill
  }
  return c;
}

const LIFE_W = p(9), LIFE_H = p(9);

function buildDuckFootSprite(filled: boolean, ink: string, lite: string, colored = false): HTMLCanvasElement {
  const cl   = colored ? (filled ? '#e8841a' : '#6e4420') : (filled ? ink : lite);
  const claw = colored ? (filled ? '#a85410' : '#3e2410') : cl;
  const shad = colored ? (filled ? '#c86c10' : '#5a3618') : cl;

  const c = document.createElement('canvas');
  c.width = LIFE_W; c.height = LIFE_H;
  const ctx = c.getContext('2d')!;
  // ── Webbed foot, toes splayed UP, ankle at bottom ──
  // Claw tips (top of each toe)
  px(ctx, claw, p(0), p(0), p(1), p(1));   // left toe claw
  px(ctx, claw, p(4), p(0), p(1), p(1));   // middle toe claw
  px(ctx, claw, p(8), p(0), p(1), p(1));   // right toe claw
  // Three toes (gaps between define them)
  px(ctx, cl, p(0), p(1), p(2), p(2));     // left toe
  px(ctx, cl, p(4), p(1), p(2), p(2));     // middle toe (slightly taller)
  px(ctx, cl, p(3), p(2), p(3), p(1));
  px(ctx, cl, p(7), p(1), p(2), p(2));     // right toe
  // Webbing fan between toes
  px(ctx, cl, p(0), p(3), p(9), p(2));     // full web
  px(ctx, cl, p(1), p(5), p(7), p(1));
  px(ctx, cl, p(2), p(6), p(5), p(1));
  // Webbing inner shading (gives the scalloped duck look)
  px(ctx, shad, p(2), p(4), p(1), p(1));
  px(ctx, shad, p(6), p(4), p(1), p(1));
  // Ankle (bottom)
  px(ctx, cl,   p(3), p(7), p(3), p(2));
  px(ctx, shad, p(3), p(7), p(1), p(2));
  return c;
}

function drawGround(ctx: CanvasRenderingContext2D, offset: number, W: number, ink: string, hi: string) {
  ctx.fillStyle = ink;
  ctx.fillRect(0, GROUND, W, 2);
  for (let x = ((-offset) % 60 + 60) % 60; x < W; x += 60)
    ctx.fillRect(Math.round(x), GROUND + 4, 20, 1);
  ctx.fillStyle = hi;
  for (let x = ((-offset + 32) % 60 + 60) % 60; x < W; x += 60)
    ctx.fillRect(Math.round(x), GROUND + 8, 7, 1);
}

function drawClouds(ctx: CanvasRenderingContext2D, clouds: { x: number; y: number }[], color: string) {
  ctx.fillStyle = color;
  for (const cl of clouds) {
    ctx.fillRect(cl.x,     cl.y + 6, 46, 10);
    ctx.fillRect(cl.x + 8, cl.y,     32, 16);
    ctx.fillRect(cl.x + 4, cl.y + 3, 40, 14);
  }
}

interface Obs { x: number; y: number; type: 'poop' | 'bird'; w: number; h: number; }
interface S {
  running: boolean; dead: boolean;
  score: number; best: number; speed: number;
  dogY: number; dogVY: number; onGround: boolean; jumpsLeft: number;
  legFrame: number; legTimer: number; invincible: number;
  obstacles: Obs[]; clouds: { x: number; y: number }[];
  nextObs: number; groundOff: number; t: number; lives: number;
}

function fresh(best = 0, W = CW): S {
  return {
    running: false, dead: false, score: 0, best, speed: SPEED0,
    dogY: GROUND - DOG_H, dogVY: 0, onGround: true, jumpsLeft: 2,
    legFrame: 0, legTimer: 0, invincible: 0, obstacles: [],
    clouds: [
      { x: Math.round(W * 0.16), y: 55 },
      { x: Math.round(W * 0.49), y: 72 },
      { x: Math.round(W * 0.79), y: 42 },
    ],
    nextObs: 90, groundOff: 0, t: 0, lives: 3,
  };
}

function updateState(s: S, W: number) {
  s.t++;
  // Speed ramps like Google dino: fast early gain, then slower approach to max
  s.speed = Math.min(SPEED_MAX, SPEED0 + Math.pow(s.score, 0.75) * 0.18);
  if (s.t % 6 === 0) s.score++;
  s.groundOff += s.speed;
  for (const c of s.clouds) { c.x -= s.speed * 0.22; if (c.x < -70) c.x = W + 20; }
  if (!s.onGround) {
    s.dogVY += GRAVITY;
    s.dogY  += s.dogVY;
    if (s.dogY >= GROUND - DOG_H) {
      s.dogY = GROUND - DOG_H; s.dogVY = 0; s.onGround = true; s.jumpsLeft = 2;
    }
  }
  if (s.onGround && ++s.legTimer >= 8) { s.legTimer = 0; s.legFrame ^= 1; }
  if (s.invincible > 0) s.invincible--;
  if (--s.nextObs <= 0) {
    if (Math.random() < 0.55) {
      const n = Math.random() < 0.28 ? 2 : 1;
      for (let i = 0; i < n; i++)
        s.obstacles.push({ x: W + i * (POOP_W + p(4)), y: GROUND - POOP_H, type: 'poop', w: POOP_W, h: POOP_H });
    } else {
      // low bird grazes the running goose's head → forces a jump
      const yOpts = [GROUND - DOG_H - BIRD_H + p(5), GROUND - DOG_H - p(6) - BIRD_H, GROUND - DOG_H - p(14) - BIRD_H];
      s.obstacles.push({ x: W, y: yOpts[Math.floor(Math.random() * 3)], type: 'bird', w: BIRD_W, h: BIRD_H });
    }
    s.nextObs = Math.max(38, Math.round(70 + Math.random() * 80 - s.speed * 3));
  }
  for (let i = s.obstacles.length - 1; i >= 0; i--) {
    s.obstacles[i].x -= s.speed;
    if (s.obstacles[i].x < -120) s.obstacles.splice(i, 1);
  }
  const dl = DOG_X + p(3), dr = DOG_X + DOG_W - p(3);
  const dt = s.dogY + p(2), db = s.dogY + DOG_H - p(1);
  if (!s.dead && s.invincible === 0) {
    for (const o of s.obstacles) {
      if (dr > o.x + p(2) && dl < o.x + o.w - p(2) && db > o.y + p(2) && dt < o.y + o.h - p(1)) {
        s.lives--;
        if (s.lives <= 0) { s.dead = true; s.best = Math.max(s.best, s.score); }
        else               s.invincible = 100;
        break;
      }
    }
  }
}

interface LeaderEntry { player_name: string; score: number; }

export default function LuckyPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const gsRef       = useRef<S>(fresh());
  const rafRef      = useRef(0);
  const onDeadRef   = useRef<(score: number) => void>(() => {});
  const onRestartRef = useRef<() => void>(() => {});

  const [nightMode,   setNightMode]   = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [showSubmit,  setShowSubmit]  = useState(false);
  const [deadScore,   setDeadScore]   = useState(0);
  const [playerName,  setPlayerName]  = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/scores');
      const data = await res.json();
      if (Array.isArray(data)) setLeaderboard(data);
    } catch {}
  }, []);

  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  onDeadRef.current = (score: number) => {
    setDeadScore(score);
    setShowSubmit(score > 0);
    setSubmitted(false);
  };
  onRestartRef.current = () => { setShowSubmit(false); setSubmitted(false); };

  const submitScore = async () => {
    if (!playerName.trim() || submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName.trim(), score: deadScore }),
      });
      setSubmitted(true);
      setShowSubmit(false);
      loadLeaderboard();
    } catch {}
    setSubmitting(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = Math.min(CW, window.innerWidth);
    gsRef.current = fresh(0, W);

    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = W * dpr;
    canvas.height = CH * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = CH + 'px';
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    const spDay = {
      dog:  [buildDuckSprite(0, false, D_INK, D_BG, true), buildDuckSprite(1, false, D_INK, D_BG, true), buildDuckSprite(0, true, D_INK, D_BG, true)],
      poop: buildHydrantSprite(D_INK, D_BG, true),
      bird: [buildFlyingDuckSprite(0, D_INK, D_BG, true), buildFlyingDuckSprite(1, D_INK, D_BG, true)],
      life: [buildDuckFootSprite(false, D_INK, D_LITE, true), buildDuckFootSprite(true, D_INK, D_LITE, true)],
    };
    const spNight = {
      dog:  [buildDuckSprite(0, false, N_INK, N_BG), buildDuckSprite(1, false, N_INK, N_BG), buildDuckSprite(0, true, N_INK, N_BG)],
      poop: buildHydrantSprite(N_INK, N_BG),
      bird: [buildFlyingDuckSprite(0, N_INK, N_BG), buildFlyingDuckSprite(1, N_INK, N_BG)],
      life: [buildDuckFootSprite(false, N_INK, N_LITE), buildDuckFootSprite(true, N_INK, N_LITE)],
    };

    let active = true, lastTime = 0, accum = 0;
    let prevDead = false, prevNight = false;

    // Synthesized quack — realistic mallard duck (no external asset needed)
    let audioCtx: AudioContext | null = null;
    function quack() {
      try {
        const AC = (window.AudioContext || (window as any).webkitAudioContext);
        if (!AC) return;
        if (!audioCtx) audioCtx = new AC();
        const ac = audioCtx;
        if (ac.state === 'suspended') ac.resume();
        const now = ac.currentTime;
        const dur = 0.21;

        // ── VOICED SOURCE ────────────────────────────────────────
        // Mallard female: 560 → 260 Hz pitch glide (downward quack)
        const osc = ac.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(560, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + dur);

        // Vocal flutter: ~20 Hz FM — duck syrinx is never perfectly stable
        const flutter = ac.createOscillator();
        flutter.frequency.value = 21;
        const flutterAmt = ac.createGain();
        flutterAmt.gain.value = 16; // ±16 Hz pitch deviation
        flutter.connect(flutterAmt);
        flutterAmt.connect(osc.frequency);

        // ── WAVESHAPER (syrinx non-linearity → harsh buzzy timbre) ──
        const distort = ac.createWaveShaper();
        const WN = 512;
        const wc = new Float32Array(WN);
        for (let i = 0; i < WN; i++) {
          const x = (i / (WN - 1)) * 2 - 1;
          // Asymmetric soft-clip: emphasises odd harmonics like a real duck
          wc[i] = x >= 0
            ? 1 - Math.exp(-x * 3.8)
            : -(1 - Math.exp(x * 2.6));
        }
        distort.curve = wc;
        distort.oversample = '4x';

        // ── NOISE ("KW" consonant burst + continuous breathiness) ──
        const nLen = Math.floor(ac.sampleRate * 0.22);
        const nBuf = ac.createBuffer(1, nLen, ac.sampleRate);
        const nd = nBuf.getChannelData(0);
        for (let i = 0; i < nLen; i++) nd[i] = Math.random() * 2 - 1;
        const noiseNode = ac.createBufferSource();
        noiseNode.buffer = nBuf;

        // Consonant burst: shaped noise 1200 Hz, decays in 25 ms
        const nFiltBurst = ac.createBiquadFilter();
        nFiltBurst.type = 'bandpass';
        nFiltBurst.frequency.value = 1200;
        nFiltBurst.Q.value = 1.6;
        const nGainBurst = ac.createGain();
        nGainBurst.gain.setValueAtTime(0.55, now);
        nGainBurst.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

        // Continuous breathiness: quiet hiss throughout quack
        const nFiltBreath = ac.createBiquadFilter();
        nFiltBreath.type = 'bandpass';
        nFiltBreath.frequency.value = 2800;
        nFiltBreath.Q.value = 1.2;
        const nGainBreath = ac.createGain();
        nGainBreath.gain.setValueAtTime(0.0001, now);
        nGainBreath.gain.linearRampToValueAtTime(0.08, now + 0.01);
        nGainBreath.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        // ── FORMANT FILTERS ──────────────────────────────────────
        // F1: duck throat cavity — glides from ~1000 → 500 Hz with pitch
        const f1 = ac.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.setValueAtTime(960, now);
        f1.frequency.exponentialRampToValueAtTime(490, now + dur);
        f1.Q.value = 4.5;

        // F2: nasal/sinus resonance — fixed ~2100 Hz (classic honk)
        const f2 = ac.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.value = 2100;
        f2.Q.value = 3.8;

        // Low-pass: remove non-realistic >5 kHz harsh artefacts
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 5000;
        lp.Q.value = 0.7;

        // ── MIX ──────────────────────────────────────────────────
        const mix = ac.createGain();
        mix.gain.value = 1;

        // ── MASTER ENVELOPE: "W-AAAK" shape ──────────────────────
        // Fast attack → plateau → slight sag → tail
        const env = ac.createGain();
        env.gain.setValueAtTime(0.001, now);
        env.gain.exponentialRampToValueAtTime(0.82, now + 0.006);  // sharp attack
        env.gain.setValueAtTime(0.82, now + 0.028);                // loud plateau
        env.gain.linearRampToValueAtTime(0.48, now + 0.08);        // natural sag
        env.gain.exponentialRampToValueAtTime(0.001, now + dur);   // tail off

        // ── ROUTING ──────────────────────────────────────────────
        osc.connect(distort);
        distort.connect(f1);
        distort.connect(f2);
        f1.connect(mix);
        f2.connect(mix);

        noiseNode.connect(nFiltBurst);
        nFiltBurst.connect(nGainBurst);
        nGainBurst.connect(mix);

        noiseNode.connect(nFiltBreath);
        nFiltBreath.connect(nGainBreath);
        nGainBreath.connect(mix);

        mix.connect(lp);
        lp.connect(env);
        env.connect(ac.destination);

        // ── START / STOP ─────────────────────────────────────────
        flutter.start(now); flutter.stop(now + dur + 0.02);
        osc.start(now);     osc.stop(now + dur + 0.02);
        noiseNode.start(now); noiseNode.stop(now + dur + 0.02);
      } catch {}
    }

    function doJump() {
      const s = gsRef.current;
      if (!s.running && !s.dead) { s.running = true; accum = 0; return; }
      if (s.dead) {
        gsRef.current = fresh(Math.max(s.best, s.score), W);
        gsRef.current.running = true;
        accum = 0;
        prevDead = false;
        onRestartRef.current();
        return;
      }
      if (s.jumpsLeft > 0) {
        s.dogVY   = s.onGround ? JUMP_V : JUMP_V2;
        s.onGround = false;
        s.jumpsLeft--;
        quack();
      }
    }

    const held = { on: false };
    const onKey    = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        const tag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        if (!held.on) { held.on = true; doJump(); }
      }
    };
    const onKeyUp  = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') held.on = false; };
    const onTouch  = (e: TouchEvent) => { e.preventDefault(); doJump(); };

    document.addEventListener('keydown',  onKey);
    document.addEventListener('keyup',    onKeyUp);
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    canvas.addEventListener('click',      doJump);

    function tick(now: number) {
      if (!active) return;
      const s = gsRef.current;

      if (lastTime > 0 && s.running && !s.dead) {
        accum += Math.min(now - lastTime, 100);
        let steps = 0;
        while (accum >= STEP && steps < 2) { updateState(s, W); accum -= STEP; steps++; }
        if (accum > STEP) accum = 0;
      }
      lastTime = now;

      if (s.dead && !prevDead) { prevDead = true; onDeadRef.current(s.score); }

      // Night mode: on for 500pts every 1500pt cycle (day 0-999, night 1000-1499, day 1500-2499…)
      const isNight = s.running && s.score >= 1000 && s.score % 1500 >= 1000;
      if (isNight !== prevNight) { prevNight = isNight; setNightMode(isNight); }

      const sp    = isNight ? spNight : spDay;
      const ink   = isNight ? N_INK   : D_INK;
      const hi    = isNight ? N_HI    : D_HI;
      const cvBg  = isNight ? N_CANVAS : D_CANVAS;
      const cloud = isNight ? N_CLOUD  : D_CLOUD;

      ctx.fillStyle = cvBg;
      ctx.fillRect(0, 0, W, CH);
      drawClouds(ctx, s.clouds, cloud);
      drawGround(ctx, s.running ? s.groundOff : 0, W, ink, hi);

      if (!s.running) {
        ctx.drawImage(sp.dog[0], DOG_X, GROUND - DOG_H - p(2));
        ctx.font = '700 13px Inter, sans-serif';
        ctx.fillStyle = ink;
        ctx.textAlign = 'center';
        ctx.fillText('PRESS SPACE / TAP TO START', W / 2, CH / 2);
        ctx.textAlign = 'left';
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const flash = s.invincible > 0 && Math.floor(s.t / 5) % 2 === 1;
      const wing  = Math.floor(s.t / 12) % 2;

      for (const o of s.obstacles) {
        if (o.type === 'poop') ctx.drawImage(sp.poop, o.x, o.y);
        else                   ctx.drawImage(sp.bird[wing], o.x, o.y);
      }
      if (!flash) {
        const spr = s.dead ? sp.dog[2] : sp.dog[s.onGround ? s.legFrame : 0];
        ctx.drawImage(spr, DOG_X, s.dogY - p(2));
      }

      ctx.font = '700 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = hi;
      ctx.fillText(`HI ${String(s.best).padStart(5, '0')}`, W - 20, 24);
      ctx.fillStyle = ink;
      ctx.fillText(String(s.score).padStart(5, '0'), W - 20, 40);
      ctx.textAlign = 'left';
      for (let i = 0; i < 3; i++) ctx.drawImage(sp.life[i < s.lives ? 1 : 0], 16 + i * 22, 14);

      if (s.dead) {
        ctx.fillStyle = isNight ? 'rgba(0,0,0,0.82)' : 'rgba(255,255,255,0.85)';
        ctx.fillRect(0, 0, W, CH);
        ctx.textAlign = 'center';
        ctx.font = '700 18px Inter, sans-serif';
        ctx.fillStyle = ink;
        ctx.fillText('GAME OVER', W / 2, CH / 2 - 14);
        ctx.font = '700 12px Inter, sans-serif';
        ctx.fillStyle = hi;
        ctx.fillText(`SCORE  ${s.score}`, W / 2, CH / 2 + 8);
        ctx.fillStyle = ink;
        ctx.fillText('PRESS SPACE / TAP', W / 2, CH / 2 + 28);
        ctx.textAlign = 'left';
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('keydown',  onKey);
      document.removeEventListener('keyup',    onKeyUp);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('click',      doJump);
      if (audioCtx) audioCtx.close().catch(() => {});
    };
  }, []);

  // Toggle night-mode class on <html> so globals.css rules take effect site-wide
  useEffect(() => {
    document.documentElement.classList.toggle('night-mode', nightMode);
    return () => document.documentElement.classList.remove('night-mode');
  }, [nightMode]);

  const txtClr = nightMode ? '#d0d0d0' : '#535353';
  const dimClr = nightMode ? '#666666' : '#aaaaaa';
  const brdClr = nightMode ? '#333333' : '#cccccc';

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', width: '100%', gap: '20px',
      background: nightMode ? '#1a1a1a' : 'transparent',
      transition: 'background 0.4s',
      padding: '24px 0',
      minHeight: '100%',
    }}>
      <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', touchAction: 'none' }} />

      {showSubmit && !submitted && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: '13px', color: txtClr }}>
            Результат {deadScore} — попасть в таблицу:
          </span>
          <input
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submitScore()}
            placeholder="ваше имя"
            maxLength={30}
            autoFocus
            style={{
              padding: '7px 12px', border: `1px solid ${brdClr}`,
              fontFamily: 'inherit', fontSize: '16px',
              background: nightMode ? '#222' : '#fff', color: txtClr, outline: 'none',
            }}
          />
          <button
            onClick={submitScore}
            disabled={submitting || !playerName.trim()}
            style={{
              padding: '7px 16px', border: 'none', fontFamily: 'inherit',
              fontWeight: 800, fontSize: '13px', cursor: 'pointer',
              background: nightMode ? '#d0d0d0' : '#000',
              color: nightMode ? '#000' : '#fff',
              opacity: !playerName.trim() ? 0.4 : 1,
            }}
          >
            {submitting ? '...' : 'отправить'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', minWidth: '200px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: dimClr, letterSpacing: '0.1em', marginBottom: '4px' }}>
          ЛУЧШИЕ РЕЗУЛЬТАТЫ
        </div>
        {leaderboard.length === 0 ? (
          <div style={{ fontSize: '12px', color: dimClr }}>пока нет результатов</div>
        ) : leaderboard.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: txtClr, alignItems: 'baseline' }}>
            <span style={{ color: dimClr, width: '12px', textAlign: 'right', fontSize: '10px' }}>{i + 1}</span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.player_name}</span>
            <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {String(e.score).padStart(5, '0')}
            </span>
          </div>
        ))}
      </div>

      <Link href="/" style={{ fontSize: '12px', color: dimClr, textDecoration: 'none' }}>← главная</Link>
    </div>
  );
}
