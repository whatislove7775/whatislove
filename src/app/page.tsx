'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', /* Центрирует строго посередине экрана */
      width: '100%',
      marginTop: '-60px' /* Небольшой сдвиг вверх, чтобы визуально казалось ровнее из-за футера */
    }}>
      
      {/* SVG Логотип */}
      <img src="/logo-main.svg" alt="whatislove" style={{ width: '100%', maxWidth: '650px', marginBottom: '40px' }} />

      {/* Навигация (3 кнопки) */}
      <nav style={{ display: 'flex', gap: '20px', fontWeight: 700, fontSize: '15px', alignItems: 'center', textTransform: 'uppercase' }}>
        <Link href="/products">📦 PRODUCT$</Link>
        <span>/</span>
        <Link href="/portfolio">📁 PORTFOL1O</Link>
        <span>/</span>
        <Link href="/links">🔗 LINK^S</Link>
      </nav>

    </div>
  );
}
