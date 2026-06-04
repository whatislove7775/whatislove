'use client';
import { useEffect, useState } from 'react';

interface Drop { id: number; left: number; delay: number; dur: number; size: number; rot: number; }

export default function DuckRain({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [drops, setDrops] = useState<Drop[]>([]);

  useEffect(() => {
    if (!active) { setDrops([]); return; }

    // Spawn a flock of falling ducks
    const N = 40;
    const list: Drop[] = Array.from({ length: N }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.2,
      dur: 2.6 + Math.random() * 2.4,
      size: 22 + Math.random() * 30,
      rot: Math.random() * 720 - 360,
    }));
    setDrops(list);

    // A few celebratory quacks
    let quacks = 0;
    const quackTimer = setInterval(() => {
      try { const a = new Audio('/sounds/quack.mp3'); a.volume = 0.7; a.play().catch(() => {}); } catch {}
      if (++quacks >= 4) clearInterval(quackTimer);
    }, 380);

    const end = setTimeout(onDone, 5600);
    return () => { clearTimeout(end); clearInterval(quackTimer); };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99998, overflow: 'hidden' }}>
      <style>{`@keyframes duckfall { 0% { transform: translateY(-12vh) rotate(0deg); opacity: 0; } 8% { opacity: 1; } 100% { transform: translateY(112vh) rotate(var(--r)); opacity: 1; } }`}</style>
      {drops.map((d) => (
        <span
          key={d.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${d.left}%`,
            fontSize: `${d.size}px`,
            lineHeight: 1,
            ['--r' as any]: `${d.rot}deg`,
            animation: `duckfall ${d.dur}s linear ${d.delay}s forwards`,
            willChange: 'transform, opacity',
          }}
        >
          🦆
        </span>
      ))}
    </div>
  );
}
