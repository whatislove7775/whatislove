'use client';
import Keycap from './Keycap';
import useFloatingEmoji from './useFloatingEmoji';

const NICE_AR = 964 / 443;
const TRY_AR = 737 / 508;

// Две клавиши «nice» / «try.» каскадом по диагонали (как на референсе 404)
export default function NiceTryKeys() {
  const { items, spawn } = useFloatingEmoji();

  return (
    <div className="nicetry">
      {items.map(({ id, x }) => (
        <span key={id} className="floating-emoji" style={{ '--hx': `${x}px` } as React.CSSProperties}>🤡</span>
      ))}
      <div className="nt-nice">
        <Keycap id="nice" tw={196} th={112} onClick={spawn}
                img={{ src: '/keys/nice_src.png', ar: NICE_AR, h: 50 }} />
      </div>
      <div className="nt-try">
        <Keycap id="trydot" tw={150} th={112} onClick={spawn}
                img={{ src: '/keys/try_src.png', ar: TRY_AR, h: 60 }} />
      </div>
    </div>
  );
}
