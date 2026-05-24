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

// ── Sprite sizes ────────────────────────────────────────────────────────────
const COSMO_W = p(12), COSMO_H = p(16); // cosmonaut
const SAT_W   = p(20), SAT_H   = p(7);  // satellite
const COMET_W = p(13), COMET_H = p(13); // comet (diagonal bounding box)
const ROVER_W = p(14), ROVER_H = p(9);  // ground rover
const CRATER_W = p(16), CRATER_H = p(5); // crater rim (collision height)
const LIFE_W = p(5), LIFE_H = p(5);

// ── COSMONAUT ───────────────────────────────────────────────────────────────
// canvas: COSMO_W × (COSMO_H + p(2)), drawn at cosmoY - p(2)
function buildCosmonautSprite(leg: number, dead: boolean, ink: string, bg: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = COSMO_W; c.height = COSMO_H + p(2);
  const ctx = c.getContext('2d')!;

  // Antenna (rows 0-3)
  px(ctx, ink, p(5), 0,    p(2), p(1));
  px(ctx, ink, p(5), p(1), p(2), p(1));

  // Helmet oval (rows 4-19)
  px(ctx, ink, p(3), p(2),      p(6), p(1)); // top cap
  px(ctx, ink, p(2), p(3),      p(8), p(6)); // main block
  px(ctx, ink, p(3), p(9),      p(6), p(1)); // bottom cap

  // Visor
  const visor = dead ? '#660000' : '#102b5e';
  px(ctx, visor, p(3), p(3), p(6), p(4));
  if (!dead) {
    px(ctx, '#4a6fbb', p(4), p(3), p(2), p(1)); // visor highlight
  } else {
    // X eyes
    px(ctx, '#ff4444', p(3), p(3), p(1), p(1));
    px(ctx, '#ff4444', p(8), p(3), p(1), p(1));
    px(ctx, '#ff4444', p(4), p(4), p(1), p(1));
    px(ctx, '#ff4444', p(7), p(4), p(1), p(1));
    px(ctx, '#ff4444', p(5), p(5), p(2), p(1));
    px(ctx, '#ff4444', p(3), p(6), p(1), p(1));
    px(ctx, '#ff4444', p(8), p(6), p(1), p(1));
  }

  // Neck connector (rows 20-21)
  px(ctx, ink, p(4), p(10), p(4), p(1));

  // Backpack / life-support (sticks out left of body)
  px(ctx, ink, p(0), p(11), p(3), p(4));
  // Body
  px(ctx, ink, p(2), p(11), p(8), p(4));
  // Chest panel detail
  px(ctx, '#404040', p(4), p(12), p(3), p(2));
  px(ctx, '#888',    p(5), p(12), p(1), p(1)); // indicator light

  // Legs (rows 30-35)
  if (dead) {
    px(ctx, ink, p(3), p(15), p(2), p(2));
    px(ctx, ink, p(7), p(15), p(2), p(2));
    px(ctx, ink, p(2), p(17), p(3), p(1));
    px(ctx, ink, p(6), p(17), p(3), p(1));
  } else if (leg === 0) {
    px(ctx, ink, p(3), p(15), p(2), p(2)); // left leg down
    px(ctx, ink, p(2), p(17), p(3), p(1)); // left boot
    px(ctx, ink, p(7), p(15), p(2), p(2)); // right leg
    px(ctx, ink, p(6), p(17), p(3), p(1)); // right boot
  } else {
    px(ctx, ink, p(3), p(14), p(2), p(2)); // left leg forward
    px(ctx, ink, p(2), p(16), p(3), p(1)); // left boot
    px(ctx, ink, p(7), p(15), p(2), p(2)); // right leg
    px(ctx, ink, p(6), p(17), p(3), p(1)); // right boot
  }
  return c;
}

// ── SATELLITE ───────────────────────────────────────────────────────────────
function buildSatelliteSprite(ink: string, bg: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = SAT_W; c.height = SAT_H;
  const ctx = c.getContext('2d')!;

  // Antenna
  px(ctx, ink, p(9), 0,    p(2), p(1));
  px(ctx, ink, p(8), p(1), p(4), p(1));

  // Central body
  px(ctx, ink, p(8), p(1), p(4), p(5));
  // Body window
  px(ctx, '#336699', p(9), p(2), p(2), p(2));
  px(ctx, '#88aacc', p(9), p(2), p(1), p(1)); // window highlight

  // Left solar panel array
  px(ctx, ink, p(0), p(3), p(8), p(2));
  // Panel cell dividers (bg gaps between cells)
  px(ctx, bg, p(2), p(3), p(1), p(2));
  px(ctx, bg, p(4), p(3), p(1), p(2));
  px(ctx, bg, p(6), p(3), p(1), p(2));

  // Right solar panel array
  px(ctx, ink, p(12), p(3), p(8), p(2));
  px(ctx, bg,  p(14), p(3), p(1), p(2));
  px(ctx, bg,  p(16), p(3), p(1), p(2));
  px(ctx, bg,  p(18), p(3), p(1), p(2));

  return c;
}

// ── COMET (diagonal — core lower-left, trail upper-right) ───────────────────
function buildCometSprite(ink: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = COMET_W; c.height = COMET_H;
  const ctx = c.getContext('2d')!;

  // Bright core (lower-left)
  px(ctx, ink, 0,    p(10), p(3), p(3));
  px(ctx, ink, p(1), p(9),  p(2), p(1)); // top of core

  // Trail (diagonal, fading toward upper-right)
  ctx.globalAlpha = 0.8;
  px(ctx, ink, p(3), p(8), p(2), p(2));
  ctx.globalAlpha = 0.55;
  px(ctx, ink, p(5), p(6), p(2), p(2));
  ctx.globalAlpha = 0.35;
  px(ctx, ink, p(7), p(4), p(2), p(2));
  ctx.globalAlpha = 0.2;
  px(ctx, ink, p(9), p(2), p(2), p(2));
  ctx.globalAlpha = 0.1;
  px(ctx, ink, p(11), 0, p(2), p(2));
  ctx.globalAlpha = 1;

  return c;
}

// ── ROVER ───────────────────────────────────────────────────────────────────
function buildRoverSprite(ink: string, bg: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = ROVER_W; c.height = ROVER_H;
  const ctx = c.getContext('2d')!;

  // Antenna mast
  px(ctx, ink, p(10), 0,    p(1), p(2));
  px(ctx, ink, p(9),  p(1), p(3), p(1)); // dish base

  // Body
  px(ctx, ink, p(2), p(2), p(10), p(4));
  // Camera / optics
  px(ctx, bg,       p(3), p(3), p(2), p(2));
  px(ctx, '#4488aa', p(3), p(3), p(2), p(1)); // lens tint
  // Instrument box
  px(ctx, '#444', p(6), p(2), p(3), p(2));
  // Wheel struts
  px(ctx, ink, p(3),  p(6), p(1), p(1));
  px(ctx, ink, p(10), p(6), p(1), p(1));

  // Left wheel (rounded via corner cuts)
  px(ctx, ink, p(1), p(6), p(4), p(3));
  px(ctx, bg,  p(2), p(6), p(2), p(1)); // cut top
  px(ctx, bg,  p(2), p(8), p(2), p(1)); // cut bottom
  px(ctx, bg,  p(1), p(7), p(1), p(1)); // cut left
  px(ctx, bg,  p(4), p(7), p(1), p(1)); // cut right
  px(ctx, bg,  p(2), p(7), p(2), p(1)); // hub hole

  // Right wheel
  px(ctx, ink, p(9),  p(6), p(4), p(3));
  px(ctx, bg,  p(10), p(6), p(2), p(1));
  px(ctx, bg,  p(10), p(8), p(2), p(1));
  px(ctx, bg,  p(9),  p(7), p(1), p(1));
  px(ctx, bg,  p(12), p(7), p(1), p(1));
  px(ctx, bg,  p(10), p(7), p(2), p(1));

  return c;
}

// ── CRATER (rocky rim; void is transparent to reveal canvas background) ─────
// sprite height = CRATER_H + p(2), drawn at GROUND - CRATER_H
function buildCraterSprite(ink: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = CRATER_W; c.height = CRATER_H + p(2);
  const ctx = c.getContext('2d')!;

  // Left rocky rim
  px(ctx, ink, p(2),  0,    p(2), p(1)); // peak
  px(ctx, ink, p(1),  p(1), p(3), p(2)); // mid
  px(ctx, ink, p(0),  p(3), p(5), p(2)); // base to ground

  // Right rocky rim (mirror)
  px(ctx, ink, p(12), 0,    p(2), p(1));
  px(ctx, ink, p(12), p(1), p(3), p(2));
  px(ctx, ink, p(11), p(3), p(5), p(2));

  // Shadow at pit floor (just below rims)
  px(ctx, '#2a2a2a', p(5), p(4), p(6), p(2));

  return c;
}

// ── LIFE HEART ──────────────────────────────────────────────────────────────
function buildLifeSprite(filled: boolean, ink: string, lite: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = LIFE_W; c.height = LIFE_H;
  const ctx = c.getContext('2d')!;
  const cl = filled ? ink : lite;
  px(ctx, cl, p(1), 0,    p(1), p(1));
  px(ctx, cl, p(3), 0,    p(1), p(1));
  px(ctx, cl, 0,    p(1), p(5), p(2));
  px(ctx, cl, p(1), p(3), p(3), p(1));
  px(ctx, cl, p(2), p(4), p(1), p(1));
  return c;
}

// ── Ground & Clouds ─────────────────────────────────────────────────────────
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

// ── Game state ───────────────────────────────────────────────────────────────
interface Obs { x: number; y: number; type: 'rover' | 'satellite' | 'comet' | 'crater'; w: number; h: number; }
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
    dogY: GROUND - COSMO_H, dogVY: 0, onGround: true, jumpsLeft: 2,
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
  s.speed = Math.min(SPEED_MAX, SPEED0 + Math.pow(s.score, 0.75) * 0.18);
  if (s.t % 6 === 0) s.score++;
  s.groundOff += s.speed;
  for (const c of s.clouds) { c.x -= s.speed * 0.22; if (c.x < -70) c.x = W + 20; }
  if (!s.onGround) {
    s.dogVY += GRAVITY;
    s.dogY  += s.dogVY;
    if (s.dogY >= GROUND - COSMO_H) {
      s.dogY = GROUND - COSMO_H; s.dogVY = 0; s.onGround = true; s.jumpsLeft = 2;
    }
  }
  if (s.onGround && ++s.legTimer >= 8) { s.legTimer = 0; s.legFrame ^= 1; }
  if (s.invincible > 0) s.invincible--;

  if (--s.nextObs <= 0) {
    const rnd = Math.random();
    if (rnd < 0.28) {
      // Rover — sometimes a pair
      const n = Math.random() < 0.3 ? 2 : 1;
      for (let i = 0; i < n; i++)
        s.obstacles.push({ x: W + i * (ROVER_W + p(3)), y: GROUND - ROVER_H, type: 'rover', w: ROVER_W, h: ROVER_H });
    } else if (rnd < 0.52) {
      // Crater
      s.obstacles.push({ x: W, y: GROUND - CRATER_H, type: 'crater', w: CRATER_W, h: CRATER_H });
    } else if (rnd < 0.76) {
      // Satellite — 3 height options
      const yOpts = [
        GROUND - COSMO_H + p(3) - SAT_H,      // body level: must jump
        GROUND - COSMO_H - p(4) - SAT_H,      // above head: safe to run under
        GROUND - COSMO_H - p(20) - SAT_H,     // high: always safe
      ];
      s.obstacles.push({ x: W, y: yOpts[Math.floor(Math.random() * 3)], type: 'satellite', w: SAT_W, h: SAT_H });
    } else {
      // Comet — 3 height options
      const yOpts = [
        GROUND - COSMO_H + p(2) - COMET_H,
        GROUND - COSMO_H - p(6) - COMET_H,
        GROUND - COSMO_H - p(18) - COMET_H,
      ];
      s.obstacles.push({ x: W, y: yOpts[Math.floor(Math.random() * 3)], type: 'comet', w: COMET_W, h: COMET_H });
    }
    s.nextObs = Math.max(38, Math.round(70 + Math.random() * 80 - s.speed * 3));
  }

  for (let i = s.obstacles.length - 1; i >= 0; i--) {
    s.obstacles[i].x -= s.speed;
    if (s.obstacles[i].x < -120) s.obstacles.splice(i, 1);
  }

  // Cosmonaut hitbox (slightly inset)
  const dl = DOG_X + p(2), dr = DOG_X + COSMO_W - p(2);
  const dt = s.dogY + p(2), db = s.dogY + COSMO_H - p(2);
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

// ── React component ──────────────────────────────────────────────────────────
interface LeaderEntry { player_name: string; score: number; }

export default function LuckyPage() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const gsRef        = useRef<S>(fresh());
  const rafRef       = useRef(0);
  const onDeadRef    = useRef<(score: number) => void>(() => {});
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

    // Pre-render all sprites for day and night
    const spDay = {
      cosmo:  [buildCosmonautSprite(0, false, D_INK, D_BG), buildCosmonautSprite(1, false, D_INK, D_BG), buildCosmonautSprite(0, true, D_INK, D_BG)],
      sat:    buildSatelliteSprite(D_INK, D_BG),
      comet:  buildCometSprite(D_INK),
      rover:  buildRoverSprite(D_INK, D_BG),
      crater: buildCraterSprite(D_INK),
      life:   [buildLifeSprite(false, D_INK, D_LITE), buildLifeSprite(true, D_INK, D_LITE)],
    };
    const spNight = {
      cosmo:  [buildCosmonautSprite(0, false, N_INK, N_BG), buildCosmonautSprite(1, false, N_INK, N_BG), buildCosmonautSprite(0, true, N_INK, N_BG)],
      sat:    buildSatelliteSprite(N_INK, N_BG),
      comet:  buildCometSprite(N_INK),
      rover:  buildRoverSprite(N_INK, N_BG),
      crater: buildCraterSprite(N_INK),
      life:   [buildLifeSprite(false, N_INK, N_LITE), buildLifeSprite(true, N_INK, N_LITE)],
    };

    let active = true, lastTime = 0, accum = 0;
    let prevDead = false, prevNight = false;

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
        s.dogVY    = s.onGround ? JUMP_V : JUMP_V2;
        s.onGround = false;
        s.jumpsLeft--;
      }
    }

    const held = { on: false };
    const onKey   = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        const tag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;
        e.preventDefault();
        if (!held.on) { held.on = true; doJump(); }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space' || e.code === 'ArrowUp') held.on = false; };
    const onTouch = (e: TouchEvent) => { e.preventDefault(); doJump(); };

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
        ctx.drawImage(sp.cosmo[0], DOG_X, GROUND - COSMO_H - p(2));
        ctx.font = '700 13px Inter, sans-serif';
        ctx.fillStyle = ink;
        ctx.textAlign = 'center';
        ctx.fillText('PRESS SPACE / TAP TO START', W / 2, CH / 2);
        ctx.textAlign = 'left';
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const flash = s.invincible > 0 && Math.floor(s.t / 5) % 2 === 1;

      // Draw obstacles — craters need special ground-erasure for the void
      for (const o of s.obstacles) {
        if      (o.type === 'rover')    { ctx.drawImage(sp.rover,  o.x, o.y); }
        else if (o.type === 'satellite'){ ctx.drawImage(sp.sat,    o.x, o.y); }
        else if (o.type === 'comet')    { ctx.drawImage(sp.comet,  o.x, o.y); }
        else if (o.type === 'crater')   {
          ctx.fillStyle = cvBg;
          ctx.fillRect(o.x + p(5), GROUND - 1, o.w - p(10), 8);
          ctx.drawImage(sp.crater, o.x, o.y);
        }
      }

      if (!flash) {
        const spr = s.dead ? sp.cosmo[2] : sp.cosmo[s.onGround ? s.legFrame : 0];
        ctx.drawImage(spr, DOG_X, s.dogY - p(2));
      }

      ctx.font = '700 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = hi;
      ctx.fillText(`HI ${String(s.best).padStart(5, '0')}`, W - 20, 24);
      ctx.fillStyle = ink;
      ctx.fillText(String(s.score).padStart(5, '0'), W - 20, 40);
      ctx.textAlign = 'left';
      for (let i = 0; i < 3; i++) ctx.drawImage(sp.life[i < s.lives ? 1 : 0], 16 + i * 18, 16);

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
    };
  }, []);

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
          <span style={{ fontSize: '13px', color: txtClr }}>Результат {deadScore} — попасть в таблицу:</span>
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
