'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SmartImage from '@/components/SmartImage';

interface Seen { slug: string; name: string; image: string | null; price: number; }

const KEY = 'recentlyViewed';
const MAX = 8;

export default function RecentlyViewed({ current }: { current?: Seen }) {
  const [items, setItems] = useState<Seen[]>([]);

  useEffect(() => {
    let list: Seen[] = [];
    try { list = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch {}

    // Record the current product at the front (dedup by slug)
    if (current?.slug) {
      list = [current, ...list.filter((p) => p.slug !== current.slug)].slice(0, MAX);
      try { localStorage.setItem(KEY, JSON.stringify(list)); } catch {}
    }

    // Show everything except the product we're currently on
    setItems(list.filter((p) => p.slug !== current?.slug));
  }, [current?.slug]);

  if (items.length === 0) return null;

  return (
    <div style={{ width: '100%', marginTop: '48px' }}>
      <div style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '0.08em', color: '#888', marginBottom: '14px', textTransform: 'uppercase' }}>
        недавно смотрели
      </div>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/products/${p.slug}`}
            style={{ flexShrink: 0, width: '120px', textDecoration: 'none', color: '#000' }}
          >
            <div style={{ position: 'relative', width: '120px', height: '120px', background: '#e5e5e5', overflow: 'hidden' }}>
              {p.image && <SmartImage src={p.image} alt={p.name} fill sizes="120px" style={{ objectFit: 'cover' }} />}
            </div>
            <div style={{ fontWeight: 800, fontSize: '12px', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {p.name.toLowerCase()}
            </div>
            <div style={{ fontWeight: 800, fontSize: '12px', color: '#d32f2f' }}>{p.price} руб</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
