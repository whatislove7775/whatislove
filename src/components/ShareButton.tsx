'use client';
import { useState } from 'react';

interface Props {
  name: string;
  slug: string;
  iconMode?: boolean;
}

export default function ShareButton({ name, slug, iconMode }: Props) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/products/${slug}`
      : `https://wh4tislove.ru/products/${slug}`;
    const title = `${name} — whatislove`;

    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try { await (navigator as any).share({ title, url }); return; } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.open(`https://telegram.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
    }
  };

  if (iconMode) {
    return (
      <button
        onClick={share}
        className="share-overlay-btn"
        title="поделиться"
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: copied ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.45)',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          zIndex: 10,
          transition: 'background 0.15s',
        }}
      >
        {copied ? (
          /* Галочка подтверждения */
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <polyline points="3,8 7,12 13,4" stroke="#fff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
          </svg>
        ) : (
          /* Share / external-link icon (как в скриншоте) */
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <polyline points="9,2 14,2 14,7" stroke="#fff" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter"/>
            <line x1="14" y1="2" x2="7" y2="9" stroke="#fff" strokeWidth="1.6" strokeLinecap="square"/>
            <path d="M7 4H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9" stroke="#fff" strokeWidth="1.6" strokeLinecap="square"/>
          </svg>
        )}
      </button>
    );
  }

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
