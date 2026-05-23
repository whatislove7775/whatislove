'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

const CW = 800, CH = 300, GROUND = 245;
const P = 2;
const DOG_X = 80;
const GRAVITY = 0.58, JUMP_V = -13.5, JUMP_V2 = -11;
const SPEED0 = 5, SPEED_MAX = 14;
const INK = '#535353', HI = '#9e9e9e', BG = '#ffffff', LITE = '#d0d0d0';
const STEP = 1000 / 60;

function p(n: number) { return n * P; }
function px(ctx: CanvasRenderingContext2D, c: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

const DOG_W = p(16), DOG_H = p(14);

function buildDogSprite(leg: number, dead: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = DOG_W; c.height = DOG_H + p(2);
  const ctx = c.getContext('2d')!;
  const x = 0, y = p(2);
  px(ctx, INK, x,         y + p(3), p(2), p(1));
  px(ctx, INK, x + p(1),  y + p(2), p(1), p(1));
  px(ctx, INK, x,         y + p(1), p(1), p(2));
  px(ctx, INK, x + p(2),  y + p(3), p(9), p(6));
  px(ctx, BG,  x + p(3),  y + p(5), p(6), p(2));
  px(ctx, INK, x + p(8),  y,        p(8), p(7));
  px(ctx, INK, x + p(8),  y - p(2), p(3), p(3));
  px(ctx, BG,  x + p(9),  y - p(1), p(1), p(2));
  px(ctx, INK, x + p(13), y + p(3), p(3), p(3));
  px(ctx, BG,  x + p(14), y + p(4), p(1), p(1));
  if (dead) {
    px(ctx, BG, x + p(11), y + p(1), p(1), p(1));
    px(ctx, BG, x + p(13), y + p(1), p(1), p(1));
    px(ctx, BG, x + p(12), y + p(2), p(1), p(1));
    px(ctx, BG, x + p(11), y + p(3), p(1), p(1));
    px(ctx, BG, x + p(13), y + p(3), p(1), p(1));
  } else {
    px(ctx, BG,  x + p(11), y + p(1), p(2), p(2));
    px(ctx, INK, x + p(12), y + p(1), p(1), p(1));
  }
  if (leg === 0) {
    px(ctx, INK, x + p(4), y + p(9),  p(2), p(5));
    px(ctx, INK, x + p(4), y + p(13), p(3), p(1));
    px(ctx, INK, x + p(9), y + p(8),  p(2), p(3));
    px(ctx, INK, x + p(8), y + p(11), p(2), p(3));
    px(ctx, INK, x + p(8), y + p(13), p(3), p(1));
  } else {
    px(ctx, INK, x + p(4), y + p(8),  p(2), p(3));
    px(ctx, INK, x + p(5), y + p(11), p(2), p(3));
    px(ctx, INK, x + p(5), y + p(13), p(3), p(1));
    px(ctx, INK, x + p(9), y + p(9),  p(2), p(5));
    px(ctx, INK, x + p(9), y + p(13), p(3), p(1));
  }
  return c;
}

const POOP_W = p(12), POOP_H = p(13);

function buildPoopSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = POOP_W; c.height = POOP_H;
  const ctx = c.getContext('2d')!;
  px(ctx, INK, p(5),  0,      p(2), p(2));
  px(ctx, INK, p(4),  p(1),   p(1), p(1));
  px(ctx, INK, p(6),  p(1),   p(1), p(2));
  px(ctx, INK, p(4),  p(2),   p(2), p(1));
  px(ctx, INK, p(3),  p(3),   p(6), p(3));
  px(ctx, BG,  p(4),  p(4),   p(1), p(1));
  px(ctx, INK, p(2),  p(5),   p(8), p(1));
  px(ctx, INK, p(1),  p(6),   p(10), p(3));
  px(ctx, BG,  p(2),  p(7),   p(2), p(1));
  px(ctx, INK, 0,     p(8),   p(12), p(1));
  px(ctx, INK, 0,     p(9),   p(12), p(4));
  px(ctx, BG,  p(1),  p(10),  p(3),  p(1));
  px(ctx, BG,  p(3),  p(6),   p(2), p(2));
  px(ctx, INK, p(3),  p(6),   p(1), p(1));
  px(ctx, BG,  p(7),  p(6),   p(2), p(2));
  px(ctx, INK, p(7),  p(6),   p(1), p(1));
  px(ctx, INK, p(3),  p(9),   p(1), p(1));
  px(ctx, INK, p(8),  p(9),   p(1), p(1));
  px(ctx, INK, p(4),  p(10),  p(4), p(1));
  return c;
}

const BIRD_W = p(15), BIRD_H = p(8);

function buildBirdSprite(wing: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = BIRD_W; c.height = BIRD_H;
  const ctx = c.getContext('2d')!;
  px(ctx, INK, p(2),  p(3), p(9), p(4));
  px(ctx, INK, p(8),  p(1), p(5), p(5));
  px(ctx, INK, p(13), p(3), p(3), p(1));
  px(ctx, BG,  p(10), p(2), p(2), p(2));
  px(ctx, INK, p(11), p(2), p(1), p(1));
  px(ctx, INK, 0,     p(4), p(3), p(2));
  if (wing === 0) px(ctx, INK, p(3), 0,    p(6), p(3));
  else            px(ctx, INK, p(3), p(6), p(6), p(3));
  return c;
}

const LIFE_W = p(5), LIFE_H = p(5);

function buildLifeSprite(filled: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = LIFE_W; c.height = LIFE_H;
  const ctx = c.getContext('2d')!;
  const cl = filled ? INK : LITE;
  px(ctx, cl, p(1), 0,    p(1), p(1));
  px(ctx, cl, p(3), 0,    p(1), p(1));
  px(ctx, cl, 0,    p(1), p(5), p(2));
  px(ctx, cl, p(1), p(3), p(3), p(1));
  px(ctx, cl, p(2), p(4), p(1), p(1));
  return c;
}

function drawGround(ctx: CanvasRenderingContext2D, offset: number) {
  ctx.fillStyle = INK;
  ctx.fillRect(0, GROUND, CW, 2);
  for (let x = ((-offset) % 60 + 60) % 60; x < CW; x += 60)
    ctx.fillRect(Math.round(x), GROUND + 4, 20, 1);
  ctx.fillStyle = HI;
  for (let x = ((-offset + 32) % 60 + 60) % 60; x < CW; x += 60)
    ctx.fillRect(Math.round(x), GROUND + 8, 7, 1);
}

function drawClouds(ctx: CanvasRenderingContext2D, clouds: { x: number; y: number }[]) {
  ctx.fillStyle = '#efefef';
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

function fresh(best = 0): S {
  return {
    running: false, dead: false, score: 0, best, speed: SPEED0,
    dogY: GROUND - DOG_H, dogVY: 0, onGround: true, jumpsLeft: 2,
    legFrame: 0, legTimer: 0, invincible: 0, obstacles: [],
    clouds: [{ x: 130, y: 55 }, { x: 390, y: 72 }, { x: 630, y: 42 }],
    nextObs: 90, groundOff: 0, t: 0, lives: 3,
  };
}

function updateState(s: S) {
  s.t++;
  s.speed = Math.min(SPEED_MAX, SPEED0 + s.score / 400);
  if (s.t % 6 === 0) s.score++;
  s.groundOff += s.speed;
  for (const c of s.clouds) { c.x -= s.speed * 0.22; if (c.x < -70) c.x = CW + 20; }
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
        s.obstacles.push({ x: CW + i * (POOP_W + p(4)), y: GROUND - POOP_H, type: 'poop', w: POOP_W, h: POOP_H });
    } else {
      const yOpts = [GROUND - DOG_H - p(1) - BIRD_H, GROUND - DOG_H - p(6) - BIRD_H, GROUND - DOG_H - p(14) - BIRD_H];
      s.obstacles.push({ x: CW, y: yOpts[Math.floor(Math.random() * 3)], type: 'bird', w: BIRD_W, h: BIRD_H });
    }
    s.nextObs = Math.max(40, Math.round(70 + Math.random() * 80 - s.speed * 3));
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

export default function LuckyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gsRef = useRef<S>(fresh());
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false })!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = CW * dpr;
    canvas.height = CH * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    const dogSprites = [buildDogSprite(0, false), buildDogSprite(1, false), buildDogSprite(0, true)];
    const poopSprite  = buildPoopSprite();
    const birdSprites = [buildBirdSprite(0), buildBirdSprite(1)];
    const lifeSprites = [buildLifeSprite(false), buildLifeSprite(true)];

    let active = true;
    let lastTime = 0;
    let accum = 0;

    function doJump() {
      const s = gsRef.current;
      if (!s.running && !s.dead) { s.running = true; accum = 0; return; }
      if (s.dead) {
        gsRef.current = fresh(Math.max(s.best, s.score));
        gsRef.current.running = true;
        accum = 0;
        return;
      }
      if (s.jumpsLeft > 0) {
        s.dogVY   = s.onGround ? JUMP_V : JUMP_V2;
        s.onGround = false;
        s.jumpsLeft--;
      }
    }

    const held = { on: false };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!held.on) { held.on = true; doJump(); }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') held.on = false;
    };
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
        while (accum >= STEP) { updateState(s); accum -= STEP; }
      }
      lastTime = now;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, CW, CH);

      drawClouds(ctx, s.clouds);
      drawGround(ctx, s.running ? s.groundOff : 0);

      if (!s.running) {
        ctx.drawImage(dogSprites[0], DOG_X, GROUND - DOG_H - p(2));
        ctx.font = '700 13px Inter, sans-serif';
        ctx.fillStyle = INK;
        ctx.textAlign = 'center';
        ctx.fillText('PRESS SPACE / TAP TO START', CW / 2, CH / 2);
        ctx.textAlign = 'left';
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const flash = s.invincible > 0 && Math.floor(s.t / 5) % 2 === 1;
      const wing  = Math.floor(s.t / 12) % 2;

      for (const o of s.obstacles) {
        if (o.type === 'poop') ctx.drawImage(poopSprite, o.x, o.y);
        else                   ctx.drawImage(birdSprites[wing], o.x, o.y);
      }

      if (!flash) {
        const spr = s.dead ? dogSprites[2] : dogSprites[s.onGround ? s.legFrame : 0];
        ctx.drawImage(spr, DOG_X, s.dogY - p(2));
      }

      ctx.font = '700 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = HI;
      ctx.fillText(`HI ${String(s.best).padStart(5, '0')}`, CW - 20, 24);
      ctx.fillStyle = INK;
      ctx.fillText(String(s.score).padStart(5, '0'), CW - 20, 40);
      ctx.textAlign = 'left';

      for (let i = 0; i < 3; i++) ctx.drawImage(lifeSprites[i < s.lives ? 1 : 0], 16 + i * 18, 16);

      if (s.dead) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(0, 0, CW, CH);
        ctx.textAlign = 'center';
        ctx.font = '700 18px Inter, sans-serif';
        ctx.fillStyle = INK;
        ctx.fillText('GAME OVER', CW / 2, CH / 2 - 14);
        ctx.font = '700 12px Inter, sans-serif';
        ctx.fillStyle = HI;
        ctx.fillText(`SCORE  ${s.score}`, CW / 2, CH / 2 + 8);
        ctx.fillStyle = INK;
        ctx.fillText('PRESS SPACE / TAP', CW / 2, CH / 2 + 28);
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '14px' }}>
      <div style={{ width: '100%', maxWidth: `${CW}px`, aspectRatio: `${CW} / ${CH}`, overflow: 'hidden', lineHeight: 0 }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
        />
      </div>
      <Link href="/" style={{ fontSize: '12px', color: '#aaa', textDecoration: 'none' }}>← главная</Link>
    </div>
  );
}
