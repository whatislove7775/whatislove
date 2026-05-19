'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const DISABLED_PATHS = ['/checkout', '/info', '/privacy', '/oferta'];

export default function DvdScreensaver() {
  const pathname = usePathname();
  const elRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 120, y: 80 });
  const vel = useRef({ x: 1.3, y: 1.0 });
  const raf = useRef<number>(0);

  const disabled = DISABLED_PATHS.some((p) => pathname === p);

  useEffect(() => {
    if (disabled) return;
    const el = elRef.current;
    if (!el) return;

    const tick = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const w = el.offsetWidth;
      const h = el.offsetHeight;

      pos.current.x += vel.current.x;
      pos.current.y += vel.current.y;

      if (pos.current.x <= 0) { vel.current.x = Math.abs(vel.current.x); pos.current.x = 0; }
      if (pos.current.x + w >= vw) { vel.current.x = -Math.abs(vel.current.x); pos.current.x = vw - w; }
      if (pos.current.y <= 0) { vel.current.y = Math.abs(vel.current.y); pos.current.y = 0; }
      if (pos.current.y + h >= vh) { vel.current.y = -Math.abs(vel.current.y); pos.current.y = vh - h; }

      el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [disabled]);

  if (disabled) return null;

  return (
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
      }}
    >
      &lt;3
    </div>
  );
}
