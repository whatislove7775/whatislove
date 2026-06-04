'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="home-main" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      marginTop: '-60px'
    }}>
      
      {/* SVG Логотип — десктоп */}
      <img
        src="/logo-main.svg"
        alt="whatislove"
        className="desktop-only"
        style={{ width: '100%', maxWidth: '650px', marginBottom: '40px', position: 'relative', zIndex: 10 }}
      />
      {/* SVG Логотип — мобильный */}
      <img
        src="/logo-mobile.svg"
        alt="whatislove"
        className="mobile-only home-logo-mobile"
        style={{ width: '100%', marginBottom: '24px', position: 'relative', zIndex: 10 }}
      />

      {/* Навигация */}
      <nav className="home-nav" style={{
        display: 'flex',
        gap: '20px',
        fontWeight: 700,
        fontSize: '14px',
        alignItems: 'center',
        textTransform: 'uppercase',
        position: 'relative',
        zIndex: 50,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <Link href="/products" style={{ textDecoration: 'none', color: '#000' }}>📦 ПРОДУКТЫ</Link>
        <span className="nav-sep">/</span>
        <Link href="/portfolio" style={{ textDecoration: 'none', color: '#000' }}>📁 ПОРТФОЛИО</Link>
        <span className="nav-sep">/</span>
        <Link href="/links" style={{ textDecoration: 'none', color: '#000' }}>🔗 ССЫЛКИ</Link>
      </nav>

      <Link
        href="/lucky"
        style={{
          marginTop: '24px',
          fontWeight: 500,
          fontSize: '13px',
          color: '#aaa',
          textDecoration: 'none',
          letterSpacing: '0.5px',
          position: 'relative',
          zIndex: 50,
        }}
      >
        мне не везёт!
      </Link>

    </div>
  );
}
