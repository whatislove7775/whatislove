'use client';
import { useState, useCallback } from 'react';
import Keycap from './Keycap';

const MAIN_AR = 1627 / 222;
const HEART_AR = 311 / 216;

let _heartId = 0;

export default function KeyboardLogo() {
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  const spawnHeart = useCallback(() => {
    const id = _heartId++;
    const x = (Math.random() - 0.5) * 36;
    setHearts(h => [...h, { id, x }]);
    setTimeout(() => setHearts(h => h.filter(hh => hh.id !== id)), 1000);
  }, []);

  return (
    <div className="kb-logo" aria-label="wh4tislove">
      <Keycap id="main" tw={470} th={112} className="keycap-main"
              img={{ src: '/keys/wh4tislove_src.png', ar: MAIN_AR, h: 50 }} />
      <div style={{ position: 'relative' }}>
        {hearts.map(({ id, x }) => (
          <span key={id} className="floating-heart" style={{ '--hx': `${x}px` } as React.CSSProperties}>❤️</span>
        ))}
        <Keycap id="heart" tw={128} th={112} className="keycap-heart"
                img={{ src: '/keys/heart_src.png', ar: HEART_AR, h: 58 }}
                onClick={spawnHeart} />
      </div>
    </div>
  );
}
