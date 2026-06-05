'use client';
import Keycap from './Keycap';
import useFloatingEmoji from './useFloatingEmoji';

const MAIN_AR = 1627 / 222;
const HEART_AR = 311 / 216;

export default function KeyboardLogo() {
  const { items, spawn } = useFloatingEmoji();

  return (
    <div className="kb-logo" aria-label="wh4tislove">
      <Keycap id="main" tw={470} th={112} className="keycap-main"
              img={{ src: '/keys/wh4tislove_src.png', ar: MAIN_AR, h: 50 }} />
      <div style={{ position: 'relative' }}>
        {items.map(({ id, x }) => (
          <span key={id} className="floating-emoji" style={{ '--hx': `${x}px` } as React.CSSProperties}>❤️</span>
        ))}
        <Keycap id="heart" tw={128} th={112} className="keycap-heart"
                img={{ src: '/keys/heart_src.png', ar: HEART_AR, h: 58 }}
                onClick={spawn} />
      </div>
    </div>
  );
}
