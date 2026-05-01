'use client';

import './globals.css';
import Cart from '@/components/Cart';
import { useCartStore } from '@/store/cartStore';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const itemsCount = useCartStore((state) => state.items.length);
  const pathname = usePathname();

  // Корзина видна везде, кроме главной, ИЛИ если в ней есть товары
  const showCart = pathname !== '/' || itemsCount > 0;

  return (
    <html lang="ru">
      <body>
        {showCart && <Cart />}
        
        <header style={{ textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>
          whatislove ©
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: pathname === '/' ? 'center' : 'flex-start' }}>
          {children}
        </main>

        <footer style={{ textAlign: 'center', padding: '40px 20px', fontSize: '13px' }}>
          <a href="https://t.me/whatislove_r" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#0088cc', fontWeight: 'bold' }}>
            <span style={{width: '14px', height: '14px', background: '#0088cc', borderRadius: '50%', display: 'inline-block'}}></span> t.me/whatislove_r
          </a>
          <p style={{ marginTop: '15px', textTransform: 'uppercase' }}>
            ДАННЫЙ САЙТ НИЧЕГО НЕ НАВЯЗЫВАЕТ И НЕ ПРОПАГАНДИРУЕТ. ВЕСЬ КОНТЕНТ ЯВЛЯЕТСЯ ВЫДУМКОЙ АВТОРА И НЕ ИМЕЕТ СМЫСЛА...
          </p>
        </footer>
      </body>
    </html>
  );
}
