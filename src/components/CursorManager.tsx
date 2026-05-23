'use client';
import { useEffect, useRef } from 'react';

const CURSORS = {
  default:  { src: '/cursors/default_arrow.cur', ox: 0, oy: 0 },
  pointer:  { src: '/cursors/default_link.cur',  ox: 6, oy: 0 },
  text:     { src: '/cursors/default_beam.cur',  ox: 4, oy: 8 },
  wait:     { src: '/cursors/default_busy.cur',  ox: 8, oy: 8 },
  no:       { src: '/cursors/default_no.cur',    ox: 8, oy: 8 },
  move:     { src: '/cursors/default_move.cur',  ox: 8, oy: 8 },
  cross:    { src: '/cursors/default_cross.cur', ox: 8, oy: 8 },
} as const;

type CursorType = keyof typeof CURSORS;

function detect(el: EventTarget | null): CursorType {
  let node = el instanceof Element ? el : null;
  while (node) {
    if (node instanceof HTMLElement) {
      if ((node as HTMLButtonElement).disabled) return 'no';
      const tag = node.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || node.isContentEditable) return 'text';
      if (tag === 'a' || tag === 'button' || tag === 'select') return 'pointer';
      if (node.getAttribute('role') === 'button') return 'pointer';
      // computed style — ловим cursor: pointer из CSS-классов
      const cur = getComputedStyle(node).cursor;
      if (cur === 'pointer') return 'pointer';
      if (cur === 'text') return 'text';
      if (cur === 'wait' || cur === 'progress') return 'wait';
      if (cur === 'not-allowed') return 'no';
      if (cur === 'move') return 'move';
      if (cur === 'crosshair') return 'cross';
      // inline style (React style prop)
      const s = node.style.cursor;
      if (s === 'pointer') return 'pointer';
    }
    node = node.parentElement;
  }
  return 'default';
}

export default function CursorManager() {
  const divRef = useRef<HTMLDivElement>(null);
  const cur = useRef<CursorType>('default');

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    // Предзагрузка — чтобы переключение было мгновенным
    Object.values(CURSORS).forEach(({ src }) => {
      const img = new Image(); img.src = src;
    });

    const onMove = (e: MouseEvent) => {
      const type = detect(e.target);
      const { ox, oy } = CURSORS[type];
      div.style.transform = `translate(${e.clientX - ox}px,${e.clientY - oy}px)`;
      if (type !== cur.current) {
        cur.current = type;
        (div.firstElementChild as HTMLImageElement).src = CURSORS[type].src;
      }
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div ref={divRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 999999, willChange: 'transform' }}>
      <img src={CURSORS.default.src} alt="" width={32} height={32} style={{ display: 'block', imageRendering: 'pixelated' }} />
    </div>
  );
}
