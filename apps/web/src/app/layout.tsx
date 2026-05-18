import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANON PSY — Анонимное консультирование",
  description:
    "Информационно-консультационные услуги в сфере психологии. " +
    "Полная анонимность клиента, верифицированные специалисты.",
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  themeColor: "#050810",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
