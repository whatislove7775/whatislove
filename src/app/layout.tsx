'use client';
import './globals.css';
import { usePathname } from 'next/navigation'; // Добавь этот импорт
import Cart from '@/components/Cart';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/'; // Проверяем, главная ли это страница

  return (
    <html lang="ru">
      <body>
        <Cart />
        
        {/* Шапка не меняется */}
        <header style={{ textAlign: 'center', padding: '20px 0', fontSize: '14px', fontWeight: 500 }}>
          whatislove ©
        </header>

        {/* Контент */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {children}
        </main>

        {/* Футер */}
        <footer style={{ textAlign: 'center', padding: '50px 20px', fontSize: '13px', lineHeight: '1.5' }}>
          
          {/* SVG Котик-разделитель: показываем ТОЛЬКО если это НЕ главная */}
          {!isHomePage && (
            <div style={{ marginBottom: '30px' }}>
              <img src="/footer-cat.svg" alt="separator" style={{ width: '100%', maxWidth: '300px', height: 'auto', margin: '0 auto' }} />
            </div>
          )}

          <a href="https://t.me/whatislove_r" target="_blank" rel="noopener noreferrer" style={{ color: '#0088cc', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '20px' }}>
             {/* ... SVG иконка телеграма ... */}
             t.me/whatislove_r
          </a>
          
          <div style={{ textTransform: 'uppercase', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}>
            ДАННЫЙ САЙТ НИЧЕГО НЕ НАВЯЗЫВАЕТ И НЕ ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И НЕ ИМЕЕТ СМЫСЛА...
          </div>
        </footer>
      </body>
    </html>
  );
}
