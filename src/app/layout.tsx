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

<footer style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '40px 20px', fontSize: '12px', lineHeight: '1.5', borderTop: '1px dashed #000', marginTop: '40px' }}>
          
          {/* Левый блок футера (Навигация) */}
          <div style={{ fontWeight: 'bold', display: 'flex', flexDirection: 'column' }}>
            <Link href="/info">ОФЕРТА / ПОЛИТИКА</Link>
            <Link href="/info">КОНФИДЕНЦИАЛЬНОСТИ</Link>
            <Link href="/info">/ КОНТАКТЫ / FAQ</Link>
          </div>

          {/* Центральный блок футера (Дисклеймер) */}
          <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
            ДАННЫЙ САЙТ НИЧЕГО НЕ НАВЯЗЫВАЕТ И НЕ ПРОПАГАНДИРУЕТ.<br />
            ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И НЕ ИМЕЕТ<br />
            СМЫСЛА. ЛЮБЫЕ СОВПАДЕНИЯ СЛУЧАЙНЫ. ВСЕ ФАЙЛЫ<br />
            COOKIES ИСПОЛЬЗУЮТСЯ ДЛЯ УЛУЧШЕНИЯ СЕРВИСА &lt;3333333*
          </div>

          {/* Правый блок футера (ASCII кот) */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <pre className="ascii-art" style={{ fontSize: '12px', fontWeight: 'bold' }}>
{`
 A___A
 | •_• |
  >   <
`}
            </pre>
          </div>
        </footer>
      </body>
    </html>
  );
}
