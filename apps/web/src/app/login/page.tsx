import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Войти — анонимный вход в аккаунт",
  description:
    "Войдите в aprosop анонимно. Только хэш email — никаких имён и паролей в открытом виде.",
  robots: { index: false, follow: false },
  alternates: { canonical: "https://aprosop.ru/login" },
};

export default function LoginPage() {
  return <LoginClient />;
}
