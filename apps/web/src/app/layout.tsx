import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "aprosop — Говори свободно. Скрыли остальное.",
  description:
    "Анонимная платформа видео-консультаций. AI-маска лица, P2P видео, Zero-Knowledge архитектура. Психолог видит ваши эмоции — не лицо.",
  keywords: "психолог онлайн, анонимная консультация, психологическая помощь, конфиденциально",
  openGraph: {
    title: "aprosop — Анонимная видео-консультация",
    description: "Zero-Knowledge архитектура. Специалист никогда не узнает ваше имя или лицо.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0F1A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
