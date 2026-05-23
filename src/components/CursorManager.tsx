'use client';
import { useEffect, useRef } from 'react';

const CURSORS = {
  default: { src: '/cursors/default_arrow.cur', ox: 0,  oy: 0  },
  pointer: { src: '/cursors/default_link.cur',  ox: 6,  oy: 0  },
  text:    { src: '/cursors/default_beam.cur',  ox: 4,  oy: 8  },
  wait:    { src: '/cursors/default_busy.cur',  ox: 8,  oy: 8  },
  no:      { src: '/cursors/default_no.cur',    ox: 8,  oy: 8  },
  move:    { src: '/cursors/default_move.cur',  ox: 8,  oy: 8  },
  cross:   { src: '/cursors/default_cross.cur', ox: 8,  oy: 8  },
} as const;

type CursorType = keyof typeof CURSORS;

// Note: getComputedStyle().cursor returns 'none' everywhere due to cursor:none !important in CSS.
// Detection must use tag names, roles, and raw inline style only.
function detect(el: EventTarget | null): CursorType {
  let node = el instanceof Element ? el : null;
  while (node) {
    if (node instanceof HTMLElement) {
      const disabled = (node as HTMLButtonElement).disabled || node.getAttribute('aria-disabled') === 'true';
      const tag = node.tagName.toLowerCase();

      if (tag === 'input' || tag === 'textarea' || node.isContentEditable) {
        return disabled ? 'no' : 'text';
      }
      if (disabled) return 'no';
      if (tag === 'a' || tag === 'button' || tag === 'select' || tag === 'label') return 'pointer';
      if (node.getAttribute('role') === 'button' || node.getAttribute('role') === 'link') return 'pointer';

      // Inline style is the only reliable source now — computed style returns 'none' always
      const s = node.style.cursor;
      if (s === 'pointer')     return 'pointer';
      if (s === 'text')        return 'text';
      if (s === 'not-allowed') return 'no';
      if (s === 'move')        return 'move';
      if (s === 'crosshair')   return 'cross';
      if (s === 'wait' || s === 'progress') return 'wait';
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

    // Touch devices don't need a cursor overlay
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Preload all cursor images so switching is instant
    Object.values(CURSORS).forEach(({ src }) => { new Image().src = src; });

    const onMove = (e: MouseEvent) => {
      // Show on first move (starts hidden to avoid flash at 0,0)
      if (div.style.display === 'none') div.style.display = 'block';

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
    <div
      ref={divRef}
      style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
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
