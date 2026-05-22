'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '../store/cartStore';
import DvdScreensaver from './DvdScreensaver';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [showCookiePopup, setShowCookiePopup] = useState(false);
  
  const syncCart = useCartStore((state: any) => state.syncWithStorage);

  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('page-loading');
    } else {
      document.body.classList.remove('page-loading');
    }
  }, [isLoading]);

  // Эффект проверки согласия
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    
    if (consent !== 'accepted') {
      const popupTimer = setTimeout(() => {
        setShowCookiePopup(true);
      }, 3000);
      return () => clearTimeout(popupTimer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    if (syncCart) syncCart(); 
    setShowCookiePopup(false);
  };

  const handleDeclineCookies = () => {
    setShowCookiePopup(false);
  };

  return (
    <>
      <DvdScreensaver />
      {/* ЗАГРУЗКА */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#fff',
        zIndex: 99999,
        display: isLoading ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontWeight: 800, fontSize: '20px', textTransform: 'lowercase', letterSpacing: '2px' }}>
          загрузка...
        </div>
      </div>

      {/* ПЛАШКА COOKIES */}
      {showCookiePopup && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          border: '1px solid #d9d9d9',
          width: '90%',
          maxWidth: '400px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'inherit',
          color: '#000',
          boxShadow: '0px 10px 40px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 15px',
            borderBottom: '1px solid #d9d9d9',
            fontWeight: 800,
            fontSize: '13px',
          }}>
            <div>▲ ВНИМАНИЕ!</div>
            <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
              <span onClick={handleDeclineCookies}>[ _ ]</span>
              <span onClick={handleDeclineCookies}>[ &times; ]</span>
            </div>
          </div>

          <div style={{
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '25px'
          }}>
            <div style={{ fontWeight: 800, fontSize: '14px', lineHeight: 1.4, textTransform: 'uppercase' }}>
              НА САЙТЕ ИСПОЛЬЗУЮТСЯ COOKIES<br />
              И АНАЛИТИКА. <Link href="/privacy" className="link-underline" style={{ color: '#000' }}>ПОДРОБНЕЕ</Link>
            </div>
            
            <button
              onClick={handleAcceptCookies}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #000',
                padding: '8px 24px',
                fontWeight: 800,
                fontSize: '14px',
                fontFamily: 'inherit',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: '#000'
              }}
            >
              ПРИНЯТЬ
            </button>
          </div>
        </div>
      )}

      {/* КОНТЕНТ (Header, Main, Footer) */}
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '14px',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        height: pathname === '/' ? '100dvh' : undefined,
        overflow: pathname === '/' ? 'hidden' : undefined,
        width: '100%',
        margin: 0,
        padding: 0,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}>
        <header style={{ textAlign: 'center', padding: '20px 0', fontWeight: 500, flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span>whatislove</span>
            <span style={{ fontSize: '0.72em', lineHeight: 1, marginTop: '0.1em' }}>©</span>
          </Link>
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px', boxSizing: 'border-box' }}>
          {children}
        </main>

        {/* УСЛОВИЕ ДЛЯ ФУТЕРА: Если главная страница - центрированный, иначе - сетка */}
        {pathname === '/' ? (
          <footer className="home-footer">
            <a
              href="https://t.me/whatislove_r"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#000',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginBottom: '10px',
                textDecoration: 'none',
                textTransform: 'lowercase'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
              t.me/whatislove_r
            </a>
            <div className="home-disclaimer">
              ДАННЫЙ САЙТ НИЧЕГО НЕ&nbsp;НАВЯЗЫВАЕТ И&nbsp;НЕ&nbsp;ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И&nbsp;НЕ&nbsp;ИМЕЕТ СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ&nbsp;УЛУЧШЕНИЯ СЕРВИСА &lt;333*
            </div>
          </footer>
        ) : (
          <footer style={{ flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
            <div className="footer-grid">
              <div style={{ fontWeight: 800, paddingBottom: '15px' }}>
                <a href="https://t.me/whatislove_r" target="_blank" rel="noopener noreferrer" style={{ color: '#000', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', textTransform: 'lowercase' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
                  t.me/whatislove_r
                </a>
              </div>
              <div></div>
              <div className="footer-grid-divider"></div>
              <div className="footer-links">
                <Link href="/oferta" style={{ color: '#000', textDecoration: 'none' }}>оферта /</Link>
                <Link href="/privacy" style={{ color: '#000', textDecoration: 'none' }}>политика конфиденциальности /</Link>
                <Link href="/info" style={{ color: '#000', textDecoration: 'none' }}>инфо</Link>
              </div>
              <div className="footer-disclaimer">
                данный сайт ничего не&nbsp;навязывает и&nbsp;не&nbsp;пропагандирует. весь контент является выдумкой автора и&nbsp;не&nbsp;имеет смысла. любые совпадения случайны. все файлы cookies используются для&nbsp;улучшения сервиса &lt;333* инн&nbsp;231222682431
              </div>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}
