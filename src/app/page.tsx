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
      <nav className="home-nav" style={{
        display: 'flex',
        gap: '20px',
        fontWeight: 700,
        fontSize: '14px',
        alignItems: 'center',
        textTransform: 'uppercase',
        position: 'relative',
        zIndex: 50
      }}>
        <Link href="/products" style={{ textDecoration: 'none', color: '#000' }}>📦 П₽ОДУКТЫ</Link>
        <span className="nav-sep">/</span>
        <Link href="/portfolio" style={{ textDecoration: 'none', color: '#000' }}>📁 ПО₽ТФОЛИО</Link>
        <span className="nav-sep">/</span>
        <Link href="/links" style={{ textDecoration: 'none', color: '#000' }}>🔗 ССЫЛКИ</Link>
      </nav>

    </div>
  );
}
