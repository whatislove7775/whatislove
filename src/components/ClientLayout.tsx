'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Cart from '@/components/Cart';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Корзина видна в товарах и инфо
  const showCart = pathname.startsWith('/products') || pathname === '/info';
  
  // Страницы с жесткой блокировкой скролла
  const noScrollPages = ['/', '/links', '/info', '/oferta', '/privacy'];
  const isNoScrollPage = noScrollPages.includes(pathname);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* ПРЕЛОАДЕР */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#fff',
        zIndex: 99999,
        display: isLoading ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontWeight: 800, fontSize: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          загрузка...
        </div>
      </div>

      {/* АКСИОМА: ЖЕСТКИЙ КАРКАС */}
      <div style={{ 
        fontFamily: 'Inter, sans-serif', 
        fontSize: '14px', 
        color: '#000', 
        display: 'flex', 
        flexDirection: 'column', 
        height: isNoScrollPage ? '100vh' : 'auto', 
        minHeight: '100vh',
        overflow: isNoScrollPage ? 'hidden' : 'auto',
        overflowX: 'hidden', // СМЕРТЬ ГОРИЗОНТАЛЬНОМУ СКРОЛЛУ
        width: '100vw', // Строго ширина окна
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
          justifyContent: isNoScrollPage ? 'center' : 'flex-start',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative', // Корзина теперь fixed, отступы справа не нужны
          padding: '20px', 
          boxSizing: 'border-box'
        }}>
          {/* Корзина теперь рендерится поверх всего и не двигает контент */}
          {showCart && (
            <div style={{ position: 'fixed', top: '20px', right: '40px', zIndex: 1000 }}>
              <Cart />
            </div>
          )}
          
          {children}
        </main>

        {/* АКСИОМА: ФУТЕР */}
        {pathname === '/' ? (
          <footer style={{ textAlign: 'center', padding: '20px', lineHeight: '1.5', flexShrink: 0, boxSizing: 'border-box', width: '100%' }}>
            <a href="https://t.me/whatislove_r" target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '15px', textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
              t.me/whatislove_r
            </a>
            <div style={{ textTransform: 'uppercase', fontWeight: 500, maxWidth: '800px', margin: '0 auto' }}>
              ДАННЫЙ САЙТ НИЧЕГО НЕ НАВЯЗЫВАЕТ И НЕ ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И НЕ ИМЕЕТ СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ УЛУЧШЕНИЯ СЕРВИСА &lt;333*
            </div>
          </footer>
        ) : (
          <footer style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto 1fr', // ИДЕАЛЬНАЯ ЦЕНТРОВКА (3 КОЛОНКИ)
            alignItems: 'end', 
            padding: '20px 40px', // Отступы по краям
            borderTop: '1px dashed #ccc',
            flexShrink: 0,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {/* Левая колонка */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 800, textTransform: 'uppercase' }}>
              <a href="https://t.me/whatislove_r" target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '10px', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
                t.me/whatislove_r
              </a>
              <Link href="/oferta" style={{ color: '#000', textDecoration: 'none' }}>ОФЕРТА / ПОЛИТИКА</Link>
              <Link href="/privacy" style={{ color: '#000', textDecoration: 'none' }}>КОНФИДЕНЦИАЛЬНОСТИ</Link>
              <Link href="/info" style={{ color: '#000', textDecoration: 'none' }}>/ ИНФО / FAQ</Link>
            </div>

            {/* Центральная колонка */}
            <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
              <pre style={{ margin: '0 auto 10px auto', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1 }}>
                 000<br/>
              =  .  .  =<br/>
              ...O.......O...
              </pre>
              <div style={{ textTransform: 'uppercase', fontWeight: 500, fontSize: '12px' }}>
                ДАННЫЙ САЙТ НИЧЕГО НЕ НАВЯЗЫВАЕТ И НЕ ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И НЕ ИМЕЕТ СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ УЛУЧШЕНИЯ СЕРВИСА &lt;333*
              </div>
            </div>

            {/* Правая колонка */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.2 }}>
                {` A___A `}<br/>
                {`( • . • )`}<br/>
                {` >  C `}
              </pre>
            </div>
          </footer>
        )}
      </div>
    </>
  );
}
