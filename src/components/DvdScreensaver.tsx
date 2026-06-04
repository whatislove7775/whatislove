'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const DISABLED_PATHS = ['/checkout', '/info', '/privacy', '/oferta', '/lucky'];

interface Burst { id: number; x: number; y: number; }

export default function DvdScreensaver() {
  const pathname = usePathname();
  const elRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 120, y: 80 });
  const vel = useRef({ x: 1.5, y: 1.1 });
  const raf = useRef<number>(0);
  const lastT = useRef(0);
  const burstId = useRef(0);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const disabled = DISABLED_PATHS.some((p) => pathname === p);

  useEffect(() => {
    if (disabled) return;
    const el = elRef.current;
    if (!el) return;

    const tick = (now: number) => {
      // dt normalized to 1.0 at 60 fps — keeps speed consistent at any refresh rate
      const dt = lastT.current > 0 ? Math.min((now - lastT.current) / (1000 / 60), 3) : 1;
      lastT.current = now;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = el.offsetWidth;
      const h = el.offsetHeight;

      pos.current.x += vel.current.x * dt;
      pos.current.y += vel.current.y * dt;

      let bounceX = false, bounceY = false;
      if (pos.current.x <= 0) { vel.current.x = Math.abs(vel.current.x); pos.current.x = 0; bounceX = true; }
      if (pos.current.x + w >= vw) { vel.current.x = -Math.abs(vel.current.x); pos.current.x = vw - w; bounceX = true; }
      if (pos.current.y <= 0) { vel.current.y = Math.abs(vel.current.y); pos.current.y = 0; bounceY = true; }
      if (pos.current.y + h >= vh) { vel.current.y = -Math.abs(vel.current.y); pos.current.y = vh - h; bounceY = true; }

      // Legendary "hit the corner" — both axes bounce on the same frame → confetti
      if (bounceX && bounceY) {
        const cx = pos.current.x + w / 2;
        const cy = pos.current.y + h / 2;
        const id = ++burstId.current;
        setBursts((b) => [...b, { id, x: cx, y: cy }]);
        setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1600);
      }

      el.style.transform = `translate3d(${pos.current.x}px,${pos.current.y}px,0)`;
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf.current); lastT.current = 0; };
  }, [disabled]);

  if (disabled) return null;

  const COLORS = ['#e8841a', '#cc2200', '#0088cc', '#000000', '#9e9e9e', '#ff5533'];

  return (
    <>
      <div
        ref={elRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 8000,
          mixBlendMode: 'difference',
          color: 'white',
          fontFamily: 'inherit',
          fontWeight: 800,
          fontSize: '22px',
          lineHeight: 1,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          letterSpacing: '1px',
          willChange: 'transform',
        }}
      >
        &lt;3
      </div>

      {/* Конфетти при попадании <3 точно в угол */}
      {bursts.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 8500, overflow: 'hidden' }}>
          <style>{`@keyframes confettiPop { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; } }`}</style>
          {bursts.map((b) =>
            Array.from({ length: 28 }).map((_, i) => {
              const ang = (Math.PI * 2 * i) / 28 + Math.random() * 0.4;
              const dist = 80 + Math.random() * 140;
              return (
                <span
                  key={`${b.id}-${i}`}
                  style={{
                    position: 'absolute',
                    left: b.x,
                    top: b.y,
                    width: 8,
                    height: 8,
                    background: COLORS[i % COLORS.length],
                    ['--dx' as any]: `${Math.cos(ang) * dist}px`,
                    ['--dy' as any]: `${Math.sin(ang) * dist + 60}px`,
                    ['--rot' as any]: `${Math.random() * 720 - 360}deg`,
                    animation: `confettiPop ${0.9 + Math.random() * 0.6}s ease-out forwards`,
                    willChange: 'transform, opacity',
                  }}
                />
              );
            })
          )}
        </div>
      )}
    </>
  );
}
