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

// Cache getComputedStyle --cur results per element — avoids repeated style
// recalculations when the mouse re-enters the same node.
const typeCache = new WeakMap<HTMLElement, CursorType | ''>();

function detect(el: EventTarget | null): CursorType {
  let node = el instanceof Element ? el : null;
  while (node && node !== document.body) {
    if (node instanceof HTMLElement) {
      if (typeCache.has(node)) {
        const cached = typeCache.get(node)!;
        if (cached) return cached as CursorType;
      } else {
        const v = getComputedStyle(node).getPropertyValue('--cur').trim() as CursorType;
        if (v in CURSORS) { typeCache.set(node, v); return v; }
        typeCache.set(node, '');
      }
      // Fallback: React inline style (not affected by cursor:none !important)
      const s = node.style.cursor;
      if (s === 'pointer')                  return 'pointer';
      if (s === 'text')                     return 'text';
      if (s === 'not-allowed')              return 'no';
      if (s === 'move')                     return 'move';
      if (s === 'crosshair')                return 'cross';
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

    // Preload all cursor images so type switches are instant
    Object.values(CURSORS).forEach(({ src }) => { new Image().src = src; });

    let shown = false;
    let rafId = 0;
    let pendingX = 0, pendingY = 0;
    let pendingTarget: EventTarget | null = null;

    const show = (e: MouseEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      pendingTarget = e.target;

      // Position: update immediately on every event — zero perceived lag
      const { ox, oy } = CURSORS[curRef.current];
      div.style.transform = `translate3d(${e.clientX - ox}px,${e.clientY - oy}px,0)`;
      if (!shown) { shown = true; div.style.display = 'block'; }

      // Type detection: throttled to one rAF per frame — eliminates flicker
      // caused by getComputedStyle calls on intermediate DOM nodes during movement
      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          const type = detect(pendingTarget);
          if (type !== curRef.current) {
            const { ox: nx, oy: ny } = CURSORS[type];
            div.style.transform = `translate3d(${pendingX - nx}px,${pendingY - ny}px,0)`;
            curRef.current = type;
            (div.firstElementChild as HTMLImageElement).src = CURSORS[type].src;
          }
        });
      }
    };

    // Hide when mouse leaves the browser window
    const hide = () => { shown = false; div.style.display = 'none'; };

    document.addEventListener('mousemove',  show,  { passive: true });
    document.addEventListener('mouseleave', hide);
    return () => {
      document.removeEventListener('mousemove',  show);
      document.removeEventListener('mouseleave', hide);
      if (rafId) cancelAnimationFrame(rafId);
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
