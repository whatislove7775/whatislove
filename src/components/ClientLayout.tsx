'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noScrollPages = ['/', '/links', '/info', '/oferta', '/privacy'];
  const isNoScrollPage = noScrollPages.includes(pathname);

  // Состояния для загрузки и куки-плашки
  const [isLoading, setIsLoading] = useState(true);
  const [showCookiePopup, setShowCookiePopup] = useState(false);

  // Эффект загрузки страницы
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Эффект появления плашки Cookies через 3 секунды
  useEffect(() => {
    // Проверяем, соглашался ли уже пользователь
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    
    if (!cookiesAccepted) {
      const popupTimer = setTimeout(() => {
        setShowCookiePopup(true);
      }, 3000);
      return () => clearTimeout(popupTimer);
    }
  }, []);

  // Функция принятия куки
  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookiePopup(false);
  };

  // Функция простого закрытия (без сохранения согласия)
  const handleClosePopup = () => {
    setShowCookiePopup(false);
  };

  return (
    <>
      {/* ЭКРАН ЗАГРУЗКИ */}
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
          border: '1px solid #d9d9d9', // Тонкая серая рамка
          width: '100%',
          maxWidth: '400px',
          zIndex: 9999, // Поверх всего, но под загрузкой
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'inherit',
          color: '#000',
          boxShadow: '0px 10px 40px rgba(0,0,0,0.08)' // Легкая тень, чтобы окно выделялось на белом фоне
        }}>
          {/* Шапка окна */}
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
              <span onClick={handleClosePopup}>[ _ ]</span>
              <span onClick={handleClosePopup}>[ &times; ]</span>
            </div>
          </div>

          {/* Тело окна */}
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
              И АНАЛИТИКА. <Link href="/privacy" style={{ color: '#000', textDecoration: 'underline' }}>ПОДРОБНЕЕ</Link>
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

      {/* ОСНОВНОЙ КОНТЕНТ САЙТА */}
      <div style={{ 
        fontFamily: 'Inter, sans-serif', 
        fontSize: '14px', 
        color: '#000', 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh', 
        width: '100%',
        margin: 0,
        padding: 0
      }}>
        <header style={{ textAlign: 'center', padding: '20px 0', fontWeight: 500, flexShrink: 0 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>whatislove ©</Link>
        </header>

        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px', 
          boxSizing: 'border-box'
        }}>
          {children}
        </main>

        {pathname === '/' ? (
          <footer style={{ textAlign: 'center', padding: '20px', lineHeight: '1.5', flexShrink: 0, boxSizing: 'border-box', width: '100%' }}>
            <a 
              href="https://t.me/whatislove_r" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                color: '#0088cc', 
                fontWeight: 700, 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px', 
                marginBottom: '15px', 
                textDecoration: 'none',
                textTransform: 'lowercase'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
              t.me/whatislove_r
            </a>
            <div style={{ 
              fontWeight: 500, 
              fontSize: '14px', 
              textTransform: 'uppercase', 
              lineHeight: 1.4, 
              maxWidth: '800px', 
              margin: '0 auto',
              textAlign: 'center' 
            }}>
              ДАННЫЙ САЙТ НИЧЕГО НЕ&nbsp;НАВЯЗЫВАЕТ И&nbsp;НЕ&nbsp;ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И&nbsp;НЕ&nbsp;ИМЕЕТ СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ&nbsp;УЛУЧШЕНИЯ СЕРВИСА &lt;333*
            </div>
          </footer>
        ) : (
          <footer style={{ 
            flexShrink: 0,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              display: 'grid', 
              gridTemplateColumns: '260px 1fr',
              columnGap: '40px',
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '20px',
              boxSizing: 'border-box'
            }}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', paddingBottom: '15px' }}>
                <a href="https://t.me/whatislove_r" target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
                  t.me/whatislove_r
                </a>
              </div>

              <div></div>

              <div style={{ 
                gridColumn: '1 / 3', 
                borderTop: '2px dotted rgba(0, 0, 0, 0.2)', 
                width: '100%', 
                marginBottom: '15px' 
              }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 800, textTransform: 'uppercase' }}>
                <Link href="/oferta" style={{ color: '#000', textDecoration: 'none' }}>ОФЕРТА / ПОЛИТИКА</Link>
                <Link href="/privacy" style={{ color: '#000', textDecoration: 'none' }}>КОНФИДЕНЦИАЛЬНОСТИ</Link>
                <Link href="/info" style={{ color: '#000', textDecoration: 'none' }}>/ ИНФО</Link>
              </div>

              <div style={{ 
                fontWeight: 500,
                fontSize: '14px', 
                textTransform: 'uppercase', 
                lineHeight: 1.4, 
                maxWidth: '850px',
                textAlign: 'justify' 
              }}>
                ДАННЫЙ САЙТ НИЧЕГО НЕ&nbsp;НАВЯЗЫВАЕТ И&nbsp;НЕ&nbsp;ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И&nbsp;НЕ&nbsp;ИМЕЕТ СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ&nbsp;УЛУЧШЕНИЯ СЕРВИСА &lt;333* ИНН&nbsp;231222682431
              </div>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}
