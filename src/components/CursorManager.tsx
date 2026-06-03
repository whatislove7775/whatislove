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
const CURSOR_TYPES = Object.keys(CURSORS) as CursorType[];

// null = "checked, no cursor signal on this element"
const typeCache = new WeakMap<Element, CursorType | null>();

function detect(el: EventTarget | null): CursorType {
  let node = el instanceof Element ? el : null;
  while (node && node !== document.documentElement) {
    const cached = typeCache.get(node);
    if (cached !== undefined) {
      if (cached !== null) return cached;
      node = node.parentElement;
      continue;
    }

    if (node instanceof HTMLElement) {
      const v = getComputedStyle(node).getPropertyValue('--cur').trim() as CursorType;
      if (v in CURSORS) { typeCache.set(node, v); return v; }

      // Inline style fallback for React elements that set cursor directly
      const s = node.style.cursor;
      if (s === 'pointer')                  { typeCache.set(node, 'pointer'); return 'pointer'; }
      if (s === 'text')                     { typeCache.set(node, 'text');    return 'text'; }
      if (s === 'not-allowed')              { typeCache.set(node, 'no');      return 'no'; }
      if (s === 'move')                     { typeCache.set(node, 'move');    return 'move'; }
      if (s === 'crosshair')                { typeCache.set(node, 'cross');   return 'cross'; }
      if (s === 'wait' || s === 'progress') { typeCache.set(node, 'wait');    return 'wait'; }
    }

    typeCache.set(node, null);
    node = node.parentElement;
  }
  return 'default';
}

export default function CursorManager() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<Partial<Record<CursorType, HTMLImageElement>>>({});
  const curRef  = useRef<CursorType>('default');

  // Always-on: kill native element drag (ghost + OS drag cursor that bypasses
  // cursor:none). Preventing dragstart fully cancels the drag, so the native
  // cursor can never appear alongside the custom one. Runs on every device,
  // independent of the pointer-type guard below.
  // Note: only dragstart — leaving dragover/drop untouched so the admin/collab
  // file-drop upload zones keep working.
  useEffect(() => {
    const cancel = (e: Event) => e.preventDefault();
    document.addEventListener('dragstart', cancel);
    return () => document.removeEventListener('dragstart', cancel);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    CURSOR_TYPES.forEach(type => {
      const img = wrap.querySelector<HTMLImageElement>(`[data-cur="${type}"]`);
      if (img) imgRefs.current[type] = img;
    });

    let shown = false;
    let rafId = 0;
    let pendingX = 0, pendingY = 0;
    let pendingTarget: EventTarget | null = null;

    const applyType = (type: CursorType, x: number, y: number) => {
      if (type === curRef.current) return;
      // Toggle pre-loaded images — no src swap, no load event, no flash
      const prev = imgRefs.current[curRef.current];
      const next = imgRefs.current[type];
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'block';
      curRef.current = type;
      const { ox, oy } = CURSORS[type];
      wrap.style.transform = `translate3d(${x - ox}px,${y - oy}px,0)`;
    };

    const show = (e: MouseEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      pendingTarget = e.target;

      const { ox, oy } = CURSORS[curRef.current];
      wrap.style.transform = `translate3d(${e.clientX - ox}px,${e.clientY - oy}px,0)`;
      if (!shown) { shown = true; wrap.style.visibility = 'visible'; }

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          applyType(detect(pendingTarget), pendingX, pendingY);
        });
      }
    };

    const hide = () => { shown = false; wrap.style.visibility = 'hidden'; };

    document.addEventListener('mousemove',  show, { passive: true });
    document.addEventListener('mouseleave', hide);
    return () => {
      document.removeEventListener('mousemove',  show);
      document.removeEventListener('mouseleave', hide);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        visibility: 'hidden',
        position: 'fixed',
        top: 0, left: 0,
        pointerEvents: 'none',
        zIndex: 999999,
        willChange: 'transform',
      }}
    >
      {CURSOR_TYPES.map(type => (
        <img
          key={type}
          data-cur={type}
          src={CURSORS[type].src}
          alt=""
          width={32}
          height={32}
          style={{
            display: type === 'default' ? 'block' : 'none',
            position: 'absolute',
            top: 0, left: 0,
            imageRendering: 'pixelated',
          }}
        />
      ))}
    </div>
  );
}
