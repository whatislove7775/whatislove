'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', /* Центрирование по вертикали */
      width: '100%', 
      minHeight: '60vh' /* Занимает почти весь экран между хедером и футером */
    }}>
      
      {/* SVG Логотип */}
      <img 
        src="/logo-main.svg" 
        alt="whatislove" 
        style={{ width: '100%', maxWidth: '650px', marginBottom: '30px' }} 
      />

      {/* Навигация */}
      <nav style={{ 
        display: 'flex', 
        gap: '15px', 
        fontWeight: 700, 
        fontSize: '16px', 
        alignItems: 'center', 
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <Link href="/products">📦 PRODUCT$</Link>
        <span>/</span>
        <Link href="/portfolio">📁 PORTFOL1O</Link>
        <span>/</span>
        <Link href="/links">🔗 LINK^S</Link>
      </nav>

    </div>
  );
}
