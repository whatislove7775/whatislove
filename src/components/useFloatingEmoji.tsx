'use client';
import { useState, useCallback } from 'react';

let _emojiId = 0;

/**
 * Floating-emoji reaction (Instagram-story style): each call to `spawn`
 * launches one emoji that rises and fades. Returns the live list + spawner.
 */
export default function useFloatingEmoji(ttl = 1000) {
  const [items, setItems] = useState<{ id: number; x: number }[]>([]);

  const spawn = useCallback(() => {
    const id = _emojiId++;
    const x = (Math.random() - 0.5) * 36;
    setItems(list => [...list, { id, x }]);
    setTimeout(() => setItems(list => list.filter(i => i.id !== id)), ttl);
  }, [ttl]);

  return { items, spawn };
}
