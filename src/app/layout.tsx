import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin', 'cyrillic', 'cyrillic-ext'], weight: ['500', '700', '800'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wh4tislove.ru';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Дизайн-студия "WH4T!SLOV3" — Бескомпромиссно. Функционально. Эстетично.',
    template: '%s | WH4T!SLOV3',
  },
  description: 'студия whatislove делает хороший дизайн, собственные продукты и просто развлекает народ. поисковая выдача не врёт.',
  openGraph: {
    siteName: 'WH4T!SLOV3',
    locale: 'ru_RU',
    type: 'website',
    url: siteUrl,
    title: 'Дизайн-студия "WH4T!SLOV3" — Бескомпромиссно. Функционально. Эстетично.',
    description: 'студия whatislove делает хороший дизайн, собственные продукты и просто развлекает народ.',
    images: [{ url: '/og-v2.png', width: 1200, height: 630, alt: 'WH4T!SLOV3' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Дизайн-студия "WH4T!SLOV3" — Бескомпромиссно. Функционально. Эстетично.',
    description: 'студия whatislove делает хороший дизайн, собственные продукты и просто развлекает народ.',
    images: ['/og-v2.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
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
