'use client';
import './globals.css';
import { usePathname } from 'next/navigation';
import Cart from '@/components/Cart';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Корзина рендерится только на страницах товаров
  const showCart = pathname.startsWith('/products'); 

  return (
    <html lang="ru">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', margin: 0 }}>
        
        <header style={{ textAlign: 'center', padding: '20px 0', fontSize: '14px', fontWeight: 500, flexShrink: 0 }}>
          whatislove ©
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1200px', margin: '0 auto', position: 'relative', padding: '20px' }}>
          {showCart && <Cart />}
          {children}
        </main>

        <footer style={{ textAlign: 'center', padding: '20px', fontSize: '12px', lineHeight: '1.5', flexShrink: 0 }}>
          <a href="https://t.me/whatislove_r" target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '15px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#0088cc"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.31-.346-.11l-6.4 4.02-2.76-.86c-.6-.188-.612-.6.126-.89l10.814-4.17c.502-.18.96.115.826.885z"/></svg>
            t.me/whatislove_r
          </a>
          <div style={{ textTransform: 'uppercase', fontWeight: 500, maxWidth: '700px', margin: '0 auto', fontSize: '11px' }}>
            ДАННЫЙ САЙТ НИЧЕГО НЕ НАВЯЗЫВАЕТ И НЕ ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И НЕ ИМЕЕТ СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ УЛУЧШЕНИЯ СЕРВИСА &lt;333*
          </div>
        </footer>
      </body>
    </html>
  );
}
