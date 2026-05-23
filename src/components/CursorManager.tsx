'use client';
import { useEffect, useRef } from 'react';

const HOTSPOTS: Record<string, [number, number]> = {
  default:     [0,  0],
  pointer:     [6,  0],
  text:        [8,  8],
  wait:        [8,  8],
  progress:    [0,  0],
  'not-allowed': [8, 8],
  crosshair:   [8,  8],
  move:        [8,  8],
  'ns-resize': [4,  8],
  'ew-resize': [8,  4],
  grab:        [8,  4],
};

function getCursorType(el: Element | null): string {
  while (el) {
    const tag = el.tagName?.toLowerCase();
    const style = el instanceof HTMLElement ? el.style.cursor : '';
    const isDisabled = el instanceof HTMLElement && (el as any).disabled;

    if (isDisabled) return 'not-allowed';

    const isInput = tag === 'input' || tag === 'textarea' || (el as HTMLElement).contentEditable === 'true';
    if (isInput) return 'text';

    const isLink = tag === 'a' || tag === 'button' || tag === 'select'
      || (el as HTMLElement).role === 'button'
      || style === 'pointer' || style === 'cursor: pointer';
    if (isLink) return 'pointer';

    if (style === 'move') return 'move';
    if (style === 'crosshair') return 'crosshair';
    if (style && style.includes('resize')) return 'ns-resize';
    if (style === 'grab' || style === 'grabbing') return 'grab';

    el = el.parentElement;
  }
  return 'default';
}

const CUR: Record<string, string> = {
  default:       '/cursors/default_arrow.cur',
  pointer:       '/cursors/default_link.cur',
  text:          '/cursors/default_beam.cur',
  wait:          '/cursors/default_busy.cur',
  progress:      '/cursors/default_wait.cur',
  'not-allowed': '/cursors/default_no.cur',
  crosshair:     '/cursors/default_cross.cur',
  move:          '/cursors/default_move.cur',
  'ns-resize':   '/cursors/default_size1.cur',
  'ew-resize':   '/cursors/default_size1.cur',
  grab:          '/cursors/default_link.cur',
};

export default function CursorManager() {
  const divRef = useRef<HTMLDivElement>(null);
  const curType = useRef('default');

  useEffect(() => {
    const div = divRef.current;
    if (!div) return;

    const onMove = (e: MouseEvent) => {
      const type = getCursorType(e.target as Element);
      const [hx, hy] = HOTSPOTS[type] ?? [0, 0];
      div.style.transform = `translate(${e.clientX - hx}px, ${e.clientY - hy}px)`;
      if (type !== curType.current) {
        curType.current = type;
        (div.firstChild as HTMLImageElement).src = CUR[type] ?? CUR.default;
      }
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        pointerEvents: 'none',
        zIndex: 999999,
        willChange: 'transform',
      }}
    >
      <img src="/cursors/default_arrow.cur" alt="" style={{ display: 'block', width: '32px', height: '32px' }} />
    </div>
  );
}
