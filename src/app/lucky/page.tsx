'use client';
import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// ── Canvas ────────────────────────────────────────────────────────────────────
const CW = 800;
const CH = 300;
const GROUND = 245;
const P = 2;           // pixel unit — smaller = less pixelated
const DOG_X = 80;
const GRAVITY   = 0.58;
const JUMP_V    = -13.5;
const JUMP_V2   = -11;
const SPEED0    = 5;
const SPEED_MAX = 14;

const INK  = '#535353';
const HI   = '#9e9e9e';
const BG   = '#ffffff';
const LITE = '#d0d0d0';
const FONT = '700 13px Inter, sans-serif';
const FONT_SM = '700 11px Inter, sans-serif';

function p(n: number) { return n * P; }
function px(ctx: CanvasRenderingContext2D, c: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

// ── Dog — 16×14 pixel units ───────────────────────────────────────────────────
const DOG_W = p(16);
const DOG_H = p(14);

function drawDog(ctx: CanvasRenderingContext2D, x: number, y: number, leg: number, dead: boolean, flash: boolean) {
  if (flash) return;
  px(ctx, INK, x,        y + p(3), p(2), p(1));
  px(ctx, INK, x + p(1), y + p(2), p(1), p(1));
  px(ctx, INK, x,        y + p(1), p(1), p(2));
  px(ctx, INK, x + p(2), y + p(3), p(9), p(6));
  px(ctx, BG,  x + p(3), y + p(5), p(6), p(2));
  px(ctx, INK, x + p(8), y, p(8), p(7));
  px(ctx, INK, x + p(8), y - p(2), p(3), p(3));
  px(ctx, BG,  x + p(9), y - p(1), p(1), p(2));
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
}

// ── Poop — conical pile, 12×14 pixel units ───────────────────────────────────
const POOP_W = p(12);
const POOP_H = p(14);

function drawPoop(ctx: CanvasRenderingContext2D, x: number, yBot: number) {
  const y = yBot - POOP_H;
  // swirl tip
  px(ctx, INK, x + p(5),  y,         p(2), p(2));
  px(ctx, INK, x + p(4),  y + p(1),  p(1), p(1));
  px(ctx, INK, x + p(6),  y + p(1),  p(1), p(2));
  px(ctx, INK, x + p(4),  y + p(2),  p(2), p(1));
  // middle tier
  px(ctx, INK, x + p(3),  y + p(3),  p(6), p(3));
  px(ctx, BG,  x + p(4),  y + p(4),  p(1), p(1)); // highlight
  // waist
  px(ctx, INK, x + p(2),  y + p(5),  p(8), p(1));
  // lower tier
  px(ctx, INK, x + p(1),  y + p(6),  p(10), p(3));
  px(ctx, BG,  x + p(2),  y + p(7),  p(2), p(1)); // highlight
  // waist 2
  px(ctx, INK, x + p(1),  y + p(8),  p(10), p(1));
  // base
  px(ctx, INK, x,         y + p(9),  p(12), p(4));
  px(ctx, BG,  x + p(1),  y + p(10), p(3),  p(1)); // shine
  // eyes
  px(ctx, BG, x + p(3),   y + p(6),  p(2), p(2));
  px(ctx, BG, x + p(7),   y + p(6),  p(2), p(2));
  px(ctx, INK, x + p(3),  y + p(6),  p(1), p(1));
  px(ctx, INK, x + p(7),  y + p(6),  p(1), p(1));
  // smile
  px(ctx, INK, x + p(3),  y + p(8),  p(1), p(1));
  px(ctx, INK, x + p(8),  y + p(8),  p(1), p(1));
  px(ctx, INK, x + p(4),  y + p(9),  p(4), p(1));
}

// ── Bird — 15×8 pixel units ───────────────────────────────────────────────────
const BIRD_W = p(15);
const BIRD_H = p(8);

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, wing: number) {
  px(ctx, INK, x + p(2),  y + p(3), p(9), p(4));
  px(ctx, INK, x + p(8),  y + p(1), p(5), p(5));
  px(ctx, INK, x + p(13), y + p(3), p(3), p(1));
  px(ctx, BG,  x + p(10), y + p(2), p(2), p(2));
  px(ctx, INK, x + p(11), y + p(2), p(1), p(1));
  px(ctx, INK, x,         y + p(4), p(3), p(2));
  if (wing === 0) px(ctx, INK, x + p(3), y,        p(6), p(3));
  else            px(ctx, INK, x + p(3), y + p(6), p(6), p(3));
}

// ── Lives HUD ─────────────────────────────────────────────────────────────────
function drawLife(ctx: CanvasRenderingContext2D, x: number, y: number, filled: boolean) {
  const c = filled ? INK : LITE;
  px(ctx, c, x + p(1), y,        p(1), p(1));
  px(ctx, c, x + p(3), y,        p(1), p(1));
  px(ctx, c, x,        y + p(1), p(5), p(2));
  px(ctx, c, x + p(1), y + p(3), p(3), p(1));
  px(ctx, c, x + p(2), y + p(4), p(1), p(1));
}

// ── Ground ────────────────────────────────────────────────────────────────────
function drawGround(ctx: CanvasRenderingContext2D, offset: number) {
  px(ctx, INK, 0, GROUND, CW, 2);
  for (let x = ((-offset) % 60 + 60) % 60; x < CW; x += 60)
    px(ctx, INK, Math.round(x), GROUND + 4, 20, 1);
  for (let x = ((-offset + 32) % 60 + 60) % 60; x < CW; x += 60)
    px(ctx, HI,  Math.round(x), GROUND + 8,  7, 1);
}

// ── Clouds ────────────────────────────────────────────────────────────────────
function drawClouds(ctx: CanvasRenderingContext2D, clouds: { x: number; y: number }[]) {
  ctx.fillStyle = '#efefef';
  for (const c of clouds) {
    ctx.fillRect(c.x,     c.y + 6, 46, 10);
    ctx.fillRect(c.x + 8, c.y,     32, 16);
    ctx.fillRect(c.x + 4, c.y + 3, 40, 14);
  }
}

// ── Score ─────────────────────────────────────────────────────────────────────
function drawScore(ctx: CanvasRenderingContext2D, score: number, best: number) {
  ctx.font = FONT_SM;
  ctx.textAlign = 'right';
  ctx.fillStyle = HI;
  ctx.fillText(`HI ${String(best).padStart(5, '0')}`, CW - 20, 24);
  ctx.fillStyle = INK;
  ctx.fillText(String(score).padStart(5, '0'), CW - 20, 40);
  ctx.textAlign = 'left';
}

// ── State ─────────────────────────────────────────────────────────────────────
interface Obs { x: number; y: number; type: 'poop' | 'bird'; w: number; h: number; }
interface Cloud { x: number; y: number; }
interface S {
  running: boolean; dead: boolean;
  score: number; best: number; speed: number;
  dogY: number; dogVY: number; onGround: boolean; jumpsLeft: number;
  legFrame: number; legTimer: number; invincible: number;
  obstacles: Obs[]; clouds: Cloud[];
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function LuckyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gs  = useRef<S>(fresh());
  const raf = useRef(0);

  const doJump = useCallback(() => {
    const s = gs.current;
    if (!s.running && !s.dead) { s.running = true; return; }
    if (s.dead) {
      gs.current = fresh(Math.max(s.best, s.score));
      gs.current.running = true;
      return;
    }
    if (s.jumpsLeft > 0) {
      s.dogVY = s.onGround ? JUMP_V : JUMP_V2;
      s.onGround = false;
      s.jumpsLeft--;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = CW * dpr;
    canvas.height = CH * dpr;
    ctx.scale(dpr, dpr);

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
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    canvas.addEventListener('click', doJump);

    raf.current = requestAnimationFrame(tick);

    function tick() {
      const s = gs.current;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, CW, CH);

      if (!s.running) {
        drawClouds(ctx, s.clouds);
        drawGround(ctx, 0);
        drawDog(ctx, DOG_X, GROUND - DOG_H, 0, false, false);
        ctx.font = FONT;
        ctx.fillStyle = INK;
        ctx.textAlign = 'center';
        ctx.fillText('PRESS SPACE / TAP TO START', CW / 2, CH / 2);
        ctx.textAlign = 'left';
        raf.current = requestAnimationFrame(tick);
        return;
      }

      s.t++;
      s.speed = Math.min(SPEED_MAX, SPEED0 + s.score / 400);
      if (s.t % 6 === 0) s.score++;
      s.groundOff += s.speed;

      for (const c of s.clouds) {
        c.x -= s.speed * 0.22;
        if (c.x < -70) c.x = CW + 20;
      }

      if (!s.onGround) {
        s.dogVY += GRAVITY;
        s.dogY  += s.dogVY;
        if (s.dogY >= GROUND - DOG_H) {
          s.dogY = GROUND - DOG_H; s.dogVY = 0; s.onGround = true; s.jumpsLeft = 2;
        }
      }
      if (s.onGround && ++s.legTimer >= 8) { s.legTimer = 0; s.legFrame ^= 1; }
      if (s.invincible > 0) s.invincible--;
      const flash = s.invincible > 0 && Math.floor(s.t / 5) % 2 === 1;

      if (--s.nextObs <= 0) {
        if (Math.random() < 0.55) {
          const n = Math.random() < 0.28 ? 2 : 1;
          for (let i = 0; i < n; i++)
            s.obstacles.push({ x: CW + i * (POOP_W + p(4)), y: GROUND - POOP_H, type: 'poop', w: POOP_W, h: POOP_H });
        } else {
          const yOpts = [
            GROUND - DOG_H - p(1)  - BIRD_H,
            GROUND - DOG_H - p(6)  - BIRD_H,
            GROUND - DOG_H - p(14) - BIRD_H,
          ];
          s.obstacles.push({ x: CW, y: yOpts[Math.floor(Math.random() * 3)], type: 'bird', w: BIRD_W, h: BIRD_H });
        }
        s.nextObs = Math.max(38, Math.round(65 + Math.random() * 75 - s.speed * 3));
      }

      for (const o of s.obstacles) o.x -= s.speed;
      s.obstacles = s.obstacles.filter(o => o.x > -120);

      const dl = DOG_X  + p(3), dr = DOG_X  + DOG_W - p(3);
      const dt = s.dogY + p(2), db = s.dogY + DOG_H - p(1);

      if (!s.dead && s.invincible === 0) {
        for (const o of s.obstacles) {
          if (dr > o.x + p(2) && dl < o.x + o.w - p(2) &&
              db > o.y + p(2) && dt < o.y + o.h - p(1)) {
            s.lives--;
            if (s.lives <= 0) { s.dead = true; s.best = Math.max(s.best, s.score); }
            else s.invincible = 100;
            break;
          }
        }
      }

      drawClouds(ctx, s.clouds);
      drawGround(ctx, s.groundOff);

      for (const o of s.obstacles) {
        if (o.type === 'poop') drawPoop(ctx, o.x, o.y + o.h);
        else drawBird(ctx, o.x, o.y, Math.floor(s.t / 12) % 2);
      }

      drawDog(ctx, DOG_X, s.dogY, s.onGround ? s.legFrame : 0, s.dead, flash);
      drawScore(ctx, s.score, s.best);
      for (let i = 0; i < 3; i++) drawLife(ctx, 16 + i * 18, 16, i < s.lives);

      if (s.dead) {
        ctx.fillStyle = 'rgba(255,255,255,0.82)';
        ctx.fillRect(0, 0, CW, CH);
        ctx.font = FONT;
        ctx.fillStyle = INK;
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CW / 2, CH / 2 - 16);
        ctx.font = FONT_SM;
        ctx.fillStyle = HI;
        ctx.fillText(`SCORE  ${s.score}`, CW / 2, CH / 2 + 6);
        ctx.fillStyle = INK;
        ctx.fillText('PRESS SPACE / TAP', CW / 2, CH / 2 + 26);
        ctx.textAlign = 'left';
      }

      raf.current = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf.current);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('click', doJump);
    };
  }, [doJump]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      gap: '14px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: `${CW}px`,
        aspectRatio: `${CW} / ${CH}`,
        overflow: 'hidden',
        lineHeight: 0,
      }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none', imageRendering: 'pixelated' }}
        />
      </div>

      <Link href="/" style={{ fontSize: '12px', color: '#aaa', textDecoration: 'none' }}>
        ← главная
      </Link>
    </div>
  );
}
