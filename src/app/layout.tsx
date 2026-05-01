import './globals.css';
import ClientLayout from '@/components/ClientLayout';

// Вот она — метадата с твоим фавиконом
export const metadata = {
  title: 'whatislove',
  description: 'Digital platform and product store',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', margin: 0 }}>
        {/* Оборачиваем всё в наш клиентский компонент из Шага 1 */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
