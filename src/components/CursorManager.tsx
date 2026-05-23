'use client';
import { useEffect, useRef } from 'react';

const CURSORS = {
  default: { src: '/cursors/default_arrow.cur', ox: 0, oy: 0  },
  pointer: { src: '/cursors/default_link.cur',  ox: 6, oy: 0  },
  text:    { src: '/cursors/default_beam.cur',  ox: 4, oy: 8  },
  wait:    { src: '/cursors/default_busy.cur',  ox: 8, oy: 8  },
  no:      { src: '/cursors/default_no.cur',    ox: 8, oy: 8  },
  move:    { src: '/cursors/default_move.cur',  ox: 8, oy: 8  },
  cross:   { src: '/cursors/default_cross.cur', ox: 8, oy: 8  },
} as const;

type CursorType = keyof typeof CURSORS;

// getComputedStyle().cursor returns 'none' everywhere because of cursor:none !important CSS.
// Use tag names, roles, and raw inline style only.
function detect(el: EventTarget | null): CursorType {
  let node = el instanceof Element ? el : null;
  while (node) {
    if (node instanceof HTMLElement) {
      const tag = node.tagName.toLowerCase();
      const disabled =
        (node as HTMLButtonElement).disabled ||
        node.getAttribute('aria-disabled') === 'true';

      if (tag === 'input' || tag === 'textarea' || node.isContentEditable) {
        return disabled ? 'no' : 'text';
      }
      if (disabled) return 'no';
      if (tag === 'a' || tag === 'button' || tag === 'select' || tag === 'label') return 'pointer';
      const role = node.getAttribute('role');
      if (role === 'button' || role === 'link') return 'pointer';

      // Inline style is reliable — computed style is always 'none' due to global CSS override
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
  const curRef = useRef<CursorType>('default');

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    // Touch-primary devices don't need a cursor overlay
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Preload so cursor-type switches are instant
    Object.values(CURSORS).forEach(({ src }) => { new Image().src = src; });

    let shown = false;

    const onMove = (e: MouseEvent) => {
      // Reveal on first move — avoids flash at (0,0) on page load
      if (!shown) { shown = true; div.style.display = 'block'; }

      const type = detect(e.target);
      const { ox, oy } = CURSORS[type];
      // translate3d forces GPU compositing, minimising perceived lag
      div.style.transform = `translate3d(${e.clientX - ox}px,${e.clientY - oy}px,0)`;

      if (type !== curRef.current) {
        curRef.current = type;
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
