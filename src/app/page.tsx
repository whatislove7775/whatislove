'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      width: '100%',
      marginTop: '-60px' 
    }}>
      
      {/* SVG Логотип */}
      <img 
        src="/logo-main.svg" 
        alt="whatislove" 
        style={{ width: '100%', maxWidth: '650px', marginBottom: '40px', position: 'relative', zIndex: 10 }} 
      />

      {/* Навигация (3 кнопки) */}
      <nav style={{ 
        display: 'flex', 
        gap: '20px', 
        fontWeight: 700, 
        fontSize: '14px', 
        alignItems: 'center', 
        textTransform: 'uppercase',
        position: 'relative', // Вытаскиваем на передний план
        zIndex: 50          // Защита от перекрытия
      }}>
        <Link href="/products" style={{ textDecoration: 'none', color: '#000' }}>📦 PRODUCT$</Link>
        <span>/</span>
        <Link href="/portfolio" style={{ textDecoration: 'none', color: '#000' }}>📁 PORTFOL1O</Link>
        <span>/</span>
        <Link href="/links" style={{ textDecoration: 'none', color: '#000' }}>🔗 LINK^S</Link>
      </nav>

    </div>
  );
}
