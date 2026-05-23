import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aprosop — Анонимная психологическая помощь",
  description:
    "Первая платформа Zero Knowledge терапии. AI-маска лица, P2P видео без серверов, полная анонимность. Твои эмоции — не твоё лицо.",
  keywords: "психология, анонимная терапия, онлайн психолог, конфиденциально",
  openGraph: {
    title: "Aprosop — Говори свободно. Мы скрыли всё остальное.",
    description: "Анонимная психологическая помощь с AI-маской и Zero Knowledge архитектурой.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#17212B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
