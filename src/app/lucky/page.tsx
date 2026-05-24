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

const DOG_W = p(16), DOG_H = p(14);

function buildDogSprite(leg: number, dead: boolean, ink: string, bg: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = DOG_W; c.height = DOG_H + p(2);
  const ctx = c.getContext('2d')!;
  const x = 0, y = p(2);
  px(ctx, ink, x + p(1), y - p(1), p(2), p(1));
  px(ctx, ink, x,        y,        p(1), p(3));
  px(ctx, ink, x + p(1), y,        p(1), p(2));
  px(ctx, ink, x + p(2), y + p(3), p(9), p(6));
  px(ctx, bg,  x + p(3), y + p(5), p(6), p(2));
  px(ctx, ink, x + p(8), y,        p(8), p(7));
  px(ctx, ink, x + p(9), y - p(2), p(2), p(1));
  px(ctx, ink, x + p(8), y - p(1), p(4), p(2));
  px(ctx, bg,  x + p(9), y - p(1), p(1), p(1));
  px(ctx, ink, x + p(13), y + p(3), p(3), p(3));
  px(ctx, bg,  x + p(14), y + p(4), p(1), p(1));
  if (dead) {
    px(ctx, bg,  x + p(11), y + p(1), p(2), p(2));
    px(ctx, ink, x + p(11), y + p(1), p(1), p(1));
    px(ctx, ink, x + p(12), y + p(2), p(1), p(1));
    px(ctx, ink, x + p(12), y + p(1), p(1), p(1));
    px(ctx, ink, x + p(11), y + p(2), p(1), p(1));
  } else {
    px(ctx, bg,  x + p(11), y + p(1), p(2), p(2));
    px(ctx, ink, x + p(12), y + p(1), p(1), p(1));
  }
  if (leg === 0) {
    px(ctx, ink, x + p(4), y + p(9),  p(2), p(5));
    px(ctx, ink, x + p(4), y + p(13), p(3), p(1));
    px(ctx, ink, x + p(9), y + p(8),  p(2), p(3));
    px(ctx, ink, x + p(8), y + p(11), p(2), p(3));
    px(ctx, ink, x + p(8), y + p(13), p(3), p(1));
  } else {
    px(ctx, ink, x + p(4), y + p(8),  p(2), p(3));
    px(ctx, ink, x + p(5), y + p(11), p(2), p(3));
    px(ctx, ink, x + p(5), y + p(13), p(3), p(1));
    px(ctx, ink, x + p(9), y + p(9),  p(2), p(5));
    px(ctx, ink, x + p(9), y + p(13), p(3), p(1));
  }
  return c;
}

const POOP_W = p(12), POOP_H = p(13);

function buildPoopSprite(ink: string, bg: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = POOP_W; c.height = POOP_H;
  const ctx = c.getContext('2d')!;
  px(ctx, ink, p(5), p(0), p(2), p(1));
  px(ctx, ink, p(4), p(1), p(4), p(1));
  px(ctx, bg,  p(5), p(1), p(1), p(1));
  px(ctx, ink, p(3), p(2), p(6), p(1));
  px(ctx, ink, p(3), p(3), p(6), p(1));
  px(ctx, ink, p(2), p(4), p(8), p(2));
  px(ctx, ink, p(1), p(6), p(10), p(4));
  px(ctx, bg,  p(2), p(7), p(2), p(1));
  px(ctx, ink, p(3), p(7), p(1), p(1));
  px(ctx, bg,  p(7), p(7), p(2), p(1));
  px(ctx, ink, p(8), p(7), p(1), p(1));
  px(ctx, bg,  p(3), p(9), p(6), p(1));
  px(ctx, ink, p(3), p(9), p(1), p(1));
  px(ctx, ink, p(8), p(9), p(1), p(1));
  px(ctx, ink, p(0), p(10), p(12), p(3));
  px(ctx, bg,  p(1), p(11), p(3), p(1));
  px(ctx, bg,  p(8), p(11), p(2), p(1));
  return c;
}

const BIRD_W = p(15), BIRD_H = p(8);

function buildBirdSprite(wing: number, ink: string, bg: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = BIRD_W; c.height = BIRD_H;
  const ctx = c.getContext('2d')!;
  px(ctx, ink, p(2),  p(3), p(9), p(4));
  px(ctx, ink, p(8),  p(1), p(5), p(5));
  px(ctx, ink, p(13), p(3), p(3), p(1));
  px(ctx, bg,  p(10), p(2), p(2), p(2));
  px(ctx, ink, p(11), p(2), p(1), p(1));
  px(ctx, ink, 0,     p(4), p(3), p(2));
  if (wing === 0) px(ctx, ink, p(3), 0,    p(6), p(3));
  else            px(ctx, ink, p(3), p(6), p(6), p(3));
  return c;
}

const LIFE_W = p(5), LIFE_H = p(5);

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
      const yOpts = [GROUND - DOG_H - p(1) - BIRD_H, GROUND - DOG_H - p(6) - BIRD_H, GROUND - DOG_H - p(14) - BIRD_H];
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
      dog:  [buildDogSprite(0, false, D_INK, D_BG), buildDogSprite(1, false, D_INK, D_BG), buildDogSprite(0, true, D_INK, D_BG)],
      poop: buildPoopSprite(D_INK, D_BG),
      bird: [buildBirdSprite(0, D_INK, D_BG), buildBirdSprite(1, D_INK, D_BG)],
      life: [buildLifeSprite(false, D_INK, D_LITE), buildLifeSprite(true, D_INK, D_LITE)],
    };
    const spNight = {
      dog:  [buildDogSprite(0, false, N_INK, N_BG), buildDogSprite(1, false, N_INK, N_BG), buildDogSprite(0, true, N_INK, N_BG)],
      poop: buildPoopSprite(N_INK, N_BG),
      bird: [buildBirdSprite(0, N_INK, N_BG), buildBirdSprite(1, N_INK, N_BG)],
      life: [buildLifeSprite(false, N_INK, N_LITE), buildLifeSprite(true, N_INK, N_LITE)],
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
        s.dogVY   = s.onGround ? JUMP_V : JUMP_V2;
        s.onGround = false;
        s.jumpsLeft--;
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

  // Apply night mode to the full page (body background + text)
  useEffect(() => {
    document.body.style.background = nightMode ? '#1a1a1a' : '';
    document.body.style.color      = nightMode ? '#d0d0d0' : '';
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
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
