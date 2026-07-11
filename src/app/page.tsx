'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import KeyboardLogo from '@/components/KeyboardLogo';

export default function Home() {
  // На мобиле фиксируем главную страницу на один экран — без скролла
  useEffect(() => {
    document.documentElement.classList.add('home-lock');
    return () => document.documentElement.classList.remove('home-lock');
  }, []);

  return (
    <div className="home-main" style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      position: 'relative',
    }}>

      {/* Логотип — нажимаемые клавиши клавиатуры */}
      <div style={{ marginBottom: '40px', position: 'relative', zIndex: 10 }}>
        <KeyboardLogo />
      </div>

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
        <Link href="/products" style={{ textDecoration: 'none', color: '#000' }}>📦 МАГАЗИН</Link>
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
        мне повезёт!
      </Link>

      {/* Кнопка «О студии» */}
      <Link href="/about" className="info-btn" aria-label="О студии" />

    </div>
  );
}
