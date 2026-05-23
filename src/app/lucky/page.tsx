'use client';
import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// ── Canvas constants ──────────────────────────────────────────────────────────
const CW = 800;
const CH = 300;
const GROUND = 248;   // y of ground line
const PIXEL = 3;      // 1 pixel unit in canvas pixels
const DOG_X = 85;     // horizontal position of dog (fixed)
const GRAVITY = 0.58;
const JUMP_V = -13.5;
const JUMP_V2 = -11;  // double-jump
const SPEED0 = 5;
const SPEED_MAX = 14;

function p(n: number) { return n * PIXEL; }

// ── Draw helpers ──────────────────────────────────────────────────────────────
function px(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

// ── Dog (16×14 pixel units) ───────────────────────────────────────────────────
const DOG_PW = 16; // pixel-width
const DOG_PH = 14; // pixel-height
const DOG_W = p(DOG_PW);
const DOG_H = p(DOG_PH);

function drawDog(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  leg: number,   // 0 or 1
  dead: boolean,
  flash: boolean,
) {
  if (flash) return;

  // tail
  px(ctx, '#6b3f1e', x,        y + p(3), p(2), p(1));
  px(ctx, '#6b3f1e', x + p(1), y + p(2), p(1), p(1));
  px(ctx, '#6b3f1e', x,        y + p(1), p(1), p(2));

  // body
  px(ctx, '#6b3f1e', x + p(2), y + p(3), p(9), p(6));

  // belly
  px(ctx, '#c4856a', x + p(3), y + p(5), p(7), p(3));

  // head
  px(ctx, '#6b3f1e', x + p(8), y,        p(8), p(7));

  // ear
  px(ctx, '#6b3f1e', x + p(8), y - p(2), p(3), p(3));
  px(ctx, '#c4856a', x + p(9), y - p(1), p(1), p(2));

  // snout
  px(ctx, '#c4856a', x + p(13), y + p(3), p(3), p(3));
  // nose
  px(ctx, '#1a0a00', x + p(15), y + p(3), p(1), p(1));

  // eye
  if (dead) {
    px(ctx, '#1a0a00', x + p(11), y + p(1), p(1), p(1));
    px(ctx, '#1a0a00', x + p(13), y + p(1), p(1), p(1));
    px(ctx, '#1a0a00', x + p(12), y + p(2), p(1), p(1));
    px(ctx, '#1a0a00', x + p(11), y + p(3), p(1), p(1));
    px(ctx, '#1a0a00', x + p(13), y + p(3), p(1), p(1));
  } else {
    px(ctx, '#ffffff', x + p(11), y + p(1), p(2), p(2));
    px(ctx, '#1a0a00', x + p(12), y + p(1), p(1), p(1));
  }

  // pink collar
  px(ctx, '#ff4488', x + p(9), y + p(7), p(5), p(1));

  // legs (2 frames)
  const lc = '#6b3f1e';
  if (leg === 0) {
    // back leg straight down, front leg kicked forward
    px(ctx, lc, x + p(4), y + p(9),  p(2), p(5));
    px(ctx, lc, x + p(4), y + p(13), p(3), p(1));
    px(ctx, lc, x + p(9), y + p(8),  p(2), p(3));
    px(ctx, lc, x + p(8), y + p(11), p(2), p(3));
    px(ctx, lc, x + p(8), y + p(13), p(3), p(1));
  } else {
    // back leg kicked back, front leg straight down
    px(ctx, lc, x + p(4), y + p(8),  p(2), p(3));
    px(ctx, lc, x + p(5), y + p(11), p(2), p(3));
    px(ctx, lc, x + p(5), y + p(13), p(3), p(1));
    px(ctx, lc, x + p(9), y + p(9),  p(2), p(5));
    px(ctx, lc, x + p(9), y + p(13), p(3), p(1));
  }
}

// ── Hydrant (9×13 pixel units) ────────────────────────────────────────────────
const HYDRANT_PW = 11;
const HYDRANT_PH = 13;
const HYDRANT_W = p(HYDRANT_PW);
const HYDRANT_H = p(HYDRANT_PH);

function drawHydrant(ctx: CanvasRenderingContext2D, x: number, yBottom: number) {
  const y = yBottom - HYDRANT_H;
  // base
  px(ctx, '#aa1800', x,        y + p(12), p(11), p(1));
  px(ctx, '#cc2200', x,        y + p(9),  p(11), p(3));
  // body
  px(ctx, '#cc2200', x + p(1), y + p(3),  p(9),  p(7));
  // highlight on body
  px(ctx, '#ff3a1a', x + p(2), y + p(4),  p(3),  p(5));
  // side nozzles
  px(ctx, '#cc2200', x - p(1), y + p(5),  p(2),  p(3));
  px(ctx, '#cc2200', x + p(10),y + p(5),  p(2),  p(3));
  px(ctx, '#aa1800', x - p(1), y + p(7),  p(2),  p(1));
  px(ctx, '#aa1800', x + p(10),y + p(7),  p(2),  p(1));
  // top ring
  px(ctx, '#dd9900', x + p(1), y + p(2),  p(9),  p(2));
  // cap
  px(ctx, '#ffbb00', x + p(2), y + p(1),  p(7),  p(2));
  px(ctx, '#ffcc44', x + p(3), y,          p(5),  p(2));
}

// ── Bird (15×8 pixel units) ───────────────────────────────────────────────────
const BIRD_PW = 15;
const BIRD_PH = 8;
const BIRD_W = p(BIRD_PW);
const BIRD_H = p(BIRD_PH);

function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, wing: number) {
  // body
  px(ctx, '#333', x + p(2), y + p(3), p(9), p(4));
  // head
  px(ctx, '#333', x + p(8), y + p(1), p(5), p(5));
  // beak
  px(ctx, '#aaa', x + p(13), y + p(3), p(3), p(1));
  // eye
  px(ctx, '#fff', x + p(10), y + p(2), p(2), p(2));
  px(ctx, '#000', x + p(11), y + p(2), p(1), p(1));
  // tail
  px(ctx, '#444', x,         y + p(4), p(3), p(2));
  // wings
  if (wing === 0) {
    px(ctx, '#333', x + p(3), y,          p(6), p(3)); // up
    px(ctx, '#555', x + p(4), y,          p(3), p(1));
  } else {
    px(ctx, '#333', x + p(3), y + p(6),   p(6), p(3)); // down
    px(ctx, '#555', x + p(4), y + p(7),   p(3), p(1));
  }
}

// ── Heart collectible (5×5 pixel units) ───────────────────────────────────────
const HEART_W = p(5);
const HEART_H = p(5);

function drawHeartItem(ctx: CanvasRenderingContext2D, x: number, y: number) {
  px(ctx, '#ff4488', x + p(1), y,         p(1), p(1));
  px(ctx, '#ff4488', x + p(3), y,         p(1), p(1));
  px(ctx, '#ff1166', x,        y + p(1),  p(5), p(2));
  px(ctx, '#ff1166', x + p(1), y + p(3),  p(3), p(1));
  px(ctx, '#ff4488', x + p(2), y + p(4),  p(1), p(1));
}

// Heart UI (life indicator, 5×5)
function drawHeartUI(ctx: CanvasRenderingContext2D, x: number, y: number, filled: boolean) {
  const c1 = filled ? '#ff4488' : '#ccc';
  const c2 = filled ? '#cc1155' : '#aaa';
  px(ctx, c1, x + p(1), y,        p(1), p(1));
  px(ctx, c1, x + p(3), y,        p(1), p(1));
  px(ctx, c2, x,        y + p(1), p(5), p(2));
  px(ctx, c2, x + p(1), y + p(3), p(3), p(1));
  px(ctx, c1, x + p(2), y + p(4), p(1), p(1));
}

// ── Ground decoration ─────────────────────────────────────────────────────────
function drawGround(ctx: CanvasRenderingContext2D, offset: number) {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, GROUND, CW, 2);
  ctx.fillStyle = '#bbb';
  for (let x = ((-offset) % 55 + 55) % 55; x < CW; x += 55) {
    ctx.fillRect(Math.round(x), GROUND + 5, 22, 1);
  }
  ctx.fillStyle = '#ddd';
  for (let x = ((-offset + 28) % 55 + 55) % 55; x < CW; x += 55) {
    ctx.fillRect(Math.round(x), GROUND + 9, 8, 1);
  }
}

// ── Clouds ────────────────────────────────────────────────────────────────────
function drawClouds(ctx: CanvasRenderingContext2D, clouds: { x: number; y: number }[]) {
  ctx.fillStyle = '#efefef';
  for (const c of clouds) {
    ctx.fillRect(c.x,      c.y + 6, 44, 10);
    ctx.fillRect(c.x + 8,  c.y,     30, 16);
    ctx.fillRect(c.x + 4,  c.y + 3, 38, 14);
  }
}

// ── Score display ─────────────────────────────────────────────────────────────
function drawScore(ctx: CanvasRenderingContext2D, score: number, best: number) {
  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillStyle = '#555';
  ctx.textAlign = 'right';
  ctx.fillText(`HI ${String(best).padStart(5, '0')}`, CW - 20, 28);
  ctx.fillStyle = '#000';
  ctx.fillText(String(score).padStart(5, '0'), CW - 20, 48);
  ctx.textAlign = 'left';
}

// ── Game state ────────────────────────────────────────────────────────────────
interface Obstacle {
  x: number; y: number; type: 'hydrant' | 'bird'; w: number; h: number;
}
interface HeartItem { x: number; y: number; }
interface Cloud { x: number; y: number; }

interface State {
  running: boolean;
  dead: boolean;
  score: number;
  best: number;
  speed: number;
  // dog
  dogY: number;
  dogVY: number;
  onGround: boolean;
  jumpsLeft: number;
  legFrame: number;
  legTimer: number;
  invincible: number;
  // scene
  obstacles: Obstacle[];
  hearts: HeartItem[];
  clouds: Cloud[];
  nextObstacle: number;
  nextHeart: number;
  groundOffset: number;
  t: number;
  lives: number;
}

function newState(best = 0): State {
  return {
    running: false, dead: false,
    score: 0, best, speed: SPEED0,
    dogY: GROUND - DOG_H, dogVY: 0, onGround: true, jumpsLeft: 2,
    legFrame: 0, legTimer: 0, invincible: 0,
    obstacles: [], hearts: [],
    clouds: [{ x: 120, y: 55 }, { x: 380, y: 75 }, { x: 620, y: 45 }],
    nextObstacle: 90, nextHeart: 350,
    groundOffset: 0, t: 0, lives: 3,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function LuckyPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<State>(newState());
  const rafRef   = useRef(0);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s.running && !s.dead) { s.running = true; return; }
    if (s.dead) { stateRef.current = newState(Math.max(s.best, s.score)); stateRef.current.running = true; return; }
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

    // Input
    const held = { space: false };
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (!held.space) { held.space = true; jump(); }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') held.space = false;
    };
    const onTouch = (e: TouchEvent) => { e.preventDefault(); jump(); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    canvas.addEventListener('click', jump);

    // ── Game loop ──
    function tick() {
      const s = stateRef.current;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, CW, CH);

      // Start screen
      if (!s.running) {
        drawClouds(ctx, s.clouds);
        drawGround(ctx, 0);
        drawDog(ctx, DOG_X, GROUND - DOG_H, 0, false, false);
        // hearts preview
        for (let i = 0; i < 3; i++) drawHeartUI(ctx, CW / 2 - 40 + i * 22, CH / 2 - 55, true);
        ctx.font = 'bold 18px "Courier New", monospace';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText('пробел / тап чтобы начать', CW / 2, CH / 2 + 5);
        ctx.font = '13px "Courier New", monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('двойной прыжок поддерживается · собирай ♥ для жизней', CW / 2, CH / 2 + 30);
        ctx.textAlign = 'left';
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      s.t++;
      s.speed = Math.min(SPEED_MAX, SPEED0 + s.score / 400);
      if (s.t % 6 === 0) s.score++;
      s.groundOffset += s.speed;

      // Clouds scroll slowly
      for (const c of s.clouds) {
        c.x -= s.speed * 0.25;
        if (c.x < -60) c.x = CW + 20;
      }

      // Dog physics
      if (!s.onGround) {
        s.dogVY += GRAVITY;
        s.dogY  += s.dogVY;
        if (s.dogY >= GROUND - DOG_H) {
          s.dogY = GROUND - DOG_H;
          s.dogVY = 0;
          s.onGround = true;
          s.jumpsLeft = 2;
        }
      }

      // Leg animation (only when on ground)
      if (s.onGround) {
        s.legTimer++;
        if (s.legTimer >= 8) { s.legTimer = 0; s.legFrame ^= 1; }
      }

      // Invincibility frames
      if (s.invincible > 0) s.invincible--;
      const flash = s.invincible > 0 && Math.floor(s.t / 5) % 2 === 1;

      // Spawn obstacles
      s.nextObstacle--;
      if (s.nextObstacle <= 0) {
        const roll = Math.random();
        if (roll < 0.55) {
          // hydrant(s)
          const count = Math.random() < 0.28 ? 2 : 1;
          for (let i = 0; i < count; i++) {
            s.obstacles.push({
              x: CW + i * (HYDRANT_W + p(3)),
              y: GROUND - HYDRANT_H,
              type: 'hydrant',
              w: HYDRANT_W, h: HYDRANT_H,
            });
          }
        } else {
          // bird — 3 possible heights
          const yOpts = [
            GROUND - DOG_H - p(2) - BIRD_H,  // low (duck under)
            GROUND - DOG_H - p(6) - BIRD_H,  // mid (jump over or duck)
            GROUND - DOG_H - p(14) - BIRD_H, // high (pass under)
          ];
          s.obstacles.push({
            x: CW,
            y: yOpts[Math.floor(Math.random() * yOpts.length)],
            type: 'bird', w: BIRD_W, h: BIRD_H,
          });
        }
        const gap = Math.max(38, Math.round(65 + Math.random() * 75 - s.speed * 3));
        s.nextObstacle = gap;
      }

      // Spawn hearts (only when < 5 lives)
      s.nextHeart--;
      if (s.nextHeart <= 0 && s.lives < 5) {
        s.hearts.push({ x: CW, y: GROUND - DOG_H - p(9) });
        s.nextHeart = 380 + Math.random() * 280;
      }

      // Move everything
      for (const o of s.obstacles) o.x -= s.speed;
      for (const h of s.hearts)    h.x -= s.speed;
      s.obstacles = s.obstacles.filter(o => o.x > -120);
      s.hearts    = s.hearts.filter(h => h.x > -40);

      // Collision (inset hitboxes for fairness)
      const dl = DOG_X    + p(3);
      const dr = DOG_X    + DOG_W - p(3);
      const dt = s.dogY   + p(2);
      const db = s.dogY   + DOG_H - p(1);

      if (s.invincible === 0 && !s.dead) {
        for (const o of s.obstacles) {
          const ol = o.x + p(2), or_ = o.x + o.w - p(2);
          const ot = o.y + p(2), ob  = o.y + o.h - p(1);
          if (dr > ol && dl < or_ && db > ot && dt < ob) {
            s.lives--;
            if (s.lives <= 0) {
              s.dead = true;
              s.best = Math.max(s.best, s.score);
            } else {
              s.invincible = 100;
            }
            break;
          }
        }
      }

      // Heart collection
      s.hearts = s.hearts.filter(h => {
        const hl = h.x, hr = h.x + HEART_W;
        const ht = h.y, hb = h.y + HEART_H;
        if (dr > hl && dl < hr && db > ht && dt < hb) {
          s.lives = Math.min(5, s.lives + 1);
          return false;
        }
        return true;
      });

      // ── Draw ──
      drawClouds(ctx, s.clouds);
      drawGround(ctx, s.groundOffset);

      for (const h of s.hearts) drawHeartItem(ctx, h.x, h.y);

      for (const o of s.obstacles) {
        if (o.type === 'hydrant') {
          drawHydrant(ctx, o.x, o.y + o.h);
        } else {
          drawBird(ctx, o.x, o.y, Math.floor(s.t / 12) % 2);
        }
      }

      drawDog(ctx, DOG_X, s.dogY, s.onGround ? s.legFrame : 0, s.dead, flash);

      // HUD
      drawScore(ctx, s.score, s.best);
      for (let i = 0; i < 5; i++) {
        drawHeartUI(ctx, 18 + i * (p(5) + 5), 18, i < s.lives);
      }

      // Game over overlay
      if (s.dead) {
        ctx.fillStyle = 'rgba(255,255,255,0.82)';
        ctx.fillRect(0, 0, CW, CH);
        ctx.font = 'bold 26px "Courier New", monospace';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', CW / 2, CH / 2 - 18);
        ctx.font = '15px "Courier New", monospace';
        ctx.fillStyle = '#555';
        ctx.fillText(`счёт: ${s.score}`, CW / 2, CH / 2 + 14);
        ctx.fillText('пробел / тап — рестарт', CW / 2, CH / 2 + 40);
        ctx.textAlign = 'left';
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('click', jump);
    };
  }, [jump]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '24px 16px',
        background: '#fff',
        boxSizing: 'border-box',
      }}
    >
      <h1
        style={{
          fontFamily: '"Courier New", monospace',
          fontWeight: 800,
          fontSize: 'clamp(14px, 3vw, 22px)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          margin: '0 0 24px',
          textAlign: 'center',
          color: '#000',
        }}
      >
        тебе повезёт!&nbsp;<span style={{ color: '#aaa' }}>(когда нибудь)</span>
      </h1>

      <div
        style={{
          border: '2px solid #000',
          overflow: 'hidden',
          width: '100%',
          maxWidth: `${CW}px`,
          aspectRatio: `${CW} / ${CH}`,
          lineHeight: 0,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            touchAction: 'none',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      <p
        style={{
          marginTop: '14px',
          fontFamily: '"Courier New", monospace',
          fontSize: '11px',
          color: '#999',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        пробел / ↑ / тап — прыжок&nbsp;·&nbsp;двойной прыжок&nbsp;·&nbsp;♥ = +1 жизнь
      </p>

      <Link
        href="/"
        style={{
          marginTop: '16px',
          fontFamily: '"Courier New", monospace',
          fontSize: '12px',
          color: '#000',
          textDecoration: 'underline',
        }}
      >
        ← главная
      </Link>
    </div>
  );
}
