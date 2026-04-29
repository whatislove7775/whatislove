import './globals.css';
import Cart from '@/components/Cart'; // Импортируем нашу корзину

export const metadata = {
  title: 'whatislove | design studio',
  description: 'Digital platform and product store',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Cart /> {/* Добавили корзину сюда */}
        
        <header style={{ textAlign: 'center', padding: '20px', fontSize: '14px' }}>
          whatislove ©
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </main>

        <footer style={{ textAlign: 'center', padding: '40px 20px', fontSize: '12px', lineHeight: '1.5' }}>
          <a href="https://t.me/whatislove_r" style={{ color: '#0088cc', fontWeight: 'bold' }}>
            <span style={{ fontSize: '16px' }}>💬</span> t.me/whatislove_r
          </a>
          <br /><br />
          ДАННЫЙ САЙТ НИЧЕГО НЕ НАВЯЗЫВАЕТ И НЕ ПРОПАГАНДИРУЕТ.<br />
          ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И НЕ ИМЕЕТ<br />
          СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ<br />
          COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ УЛУЧШЕНИЯ СЕРВИСА &lt;333*
        </footer>
      </body>
    </html>
  );
}
