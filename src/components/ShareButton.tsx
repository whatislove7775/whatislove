'use client';
import { useState } from 'react';

export default function ShareButton({ name, slug }: { name: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/products/${slug}`
      : `https://wh4tislove.ru/products/${slug}`;
    const title = `${name} — whatislove`;

    // Native share sheet (mobile / supported browsers)
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try { await (navigator as any).share({ title, url }); return; } catch { /* cancelled */ }
    }
    // Fallback: copy link + offer Telegram share
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    }
  };

  return (
    <button
      onClick={share}
      style={{
        background: 'transparent',
        border: 'none',
        fontFamily: 'inherit',
        fontWeight: 800,
        fontSize: '13px',
        padding: 0,
        cursor: 'pointer',
        color: copied ? '#e8841a' : '#000',
      }}
    >
      {copied ? '[ ссылка скопирована ✓ ]' : '[ поделиться ↗ ]'}
    </button>
  );
}
