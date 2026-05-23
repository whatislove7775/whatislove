'use client';
import { useEffect, useRef } from 'react';

const CURSORS = {
  default: { src: '/cursors/default_arrow.cur', ox: 10, oy: 10 },
  pointer: { src: '/cursors/default_link.cur',  ox: 10, oy: 10 },
  text:    { src: '/cursors/default_beam.cur',  ox: 15, oy: 16 },
  wait:    { src: '/cursors/default_busy.cur',  ox: 10, oy: 10 },
  no:      { src: '/cursors/default_no.cur',    ox: 10, oy: 10 },
  move:    { src: '/cursors/default_move.cur',  ox: 10, oy: 10 },
  cross:   { src: '/cursors/default_cross.cur', ox: 15, oy: 16 },
} as const;

type CursorType = keyof typeof CURSORS;

// Detection uses the --cur CSS custom property defined in globals.css.
// Custom properties inherit and cascade normally, unlike `cursor` which is
// overridden everywhere by `cursor: none !important`.
function detect(el: EventTarget | null): CursorType {
  let node = el instanceof Element ? el : null;
  while (node) {
    if (node instanceof HTMLElement) {
      // --cur is inherited, so even child elements of a <button> return 'pointer'
      const v = getComputedStyle(node).getPropertyValue('--cur').trim() as CursorType;
      if (v in CURSORS) return v;

      // Fallback: React inline style prop (not affected by global CSS override)
      const s = node.style.cursor;
      if (s === 'pointer')              return 'pointer';
      if (s === 'text')                 return 'text';
      if (s === 'not-allowed')          return 'no';
      if (s === 'move')                 return 'move';
      if (s === 'crosshair')            return 'cross';
      if (s === 'wait' || s === 'progress') return 'wait';
    }
    node = node.parentElement;
  }
  return 'default';
}

export default function CursorManager() {
  const divRef = useRef<HTMLDivElement>(null);
  const curRef = useRef<CursorType>('default');

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    // Touch-primary devices don't need a cursor overlay
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Preload so cursor-type switches are instant (no flash on first use)
    Object.values(CURSORS).forEach(({ src }) => { new Image().src = src; });

    let shown = false;

    const show = (e: MouseEvent) => {
      if (!shown) { shown = true; div.style.display = 'block'; }
      const type = detect(e.target);
      const { ox, oy } = CURSORS[type];
      div.style.transform = `translate3d(${e.clientX - ox}px,${e.clientY - oy}px,0)`;
      if (type !== curRef.current) {
        curRef.current = type;
        (div.firstElementChild as HTMLImageElement).src = CURSORS[type].src;
      }
    };

    // Hide when mouse leaves the browser window — prevents ghost cursor at edge
    const hide = () => { shown = false; div.style.display = 'none'; };

    document.addEventListener('mousemove',  show,  { passive: true });
    document.addEventListener('mouseleave', hide);
    return () => {
      document.removeEventListener('mousemove',  show);
      document.removeEventListener('mouseleave', hide);
    };
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0,
        pointerEvents: 'none',
        zIndex: 999999,
        willChange: 'transform',
      }}
    >
      <img
        src={CURSORS.default.src}
        alt=""
        width={32}
        height={32}
        style={{ display: 'block', imageRendering: 'pixelated' }}
      />
    </div>
  );
}
