'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px', width: '100%', textTransform: 'uppercase' }}>
      
      {/* SVG Логотип вместо текста */}
      <div style={{ marginTop: '20px' }}>
        <img src="/logo-main.svg" alt="whatislove" style={{ width: '100%', maxWidth: '600px', height: 'auto' }} />
      </div>

      {/* Навигация строго по Inter Medium/Bold */}
      <nav style={{ display: 'flex', gap: '15px', fontWeight: 700, fontSize: '15px', alignItems: 'center', letterSpacing: '1px' }}>
        <Link href="/products">📦 PRODUCT$</Link>
        <span>/</span>
        <Link href="/portfolio">📁 PORTFOL1O</Link>
        <span>/</span>
        <Link href="/links">🔗 LINK^S</Link>
      </nav>

    </div>
  );
}
