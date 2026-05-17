import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin', 'cyrillic', 'cyrillic-ext'], weight: ['500', '700', '800'] });

export const metadata = {
  title: 'WH4T!SLOV3',
  description: 'Дизай-студия/производство от whatislove^a',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={inter.className} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', margin: 0 }}>
        {/* Оборачиваем всё в наш клиентский компонент */}
        <ClientLayout>
          {children}
        </ClientLayout>

        {/* Yandex.Metrika counter */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=109132749', 'ym');

            ym(109132749, 'init', {
                ssr: true, 
                webvisor: true, 
                clickmap: true, 
                ecommerce: "dataLayer", 
                accurateTrackBounce: true, 
                trackLinks: true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img 
              src="https://mc.yandex.ru/watch/109132749" 
              style={{ position: 'absolute', left: '-9999px' }} 
              alt="" 
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
