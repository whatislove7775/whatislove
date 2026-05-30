import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Регистрация — создайте анонимный профиль за 30 секунд",
  description:
    "Зарегистрируйтесь анонимно. Только хэш email — никаких имён, адресов, телефонов. Первая консультация бесплатно.",
  openGraph: {
    title: "Регистрация в aprosop — анонимно, за 30 секунд",
    description: "Создайте профиль без личных данных. SHA-256 хэш email. Никакой идентификации.",
    url: "https://aprosop.ru/register",
  },
  alternates: { canonical: "https://aprosop.ru/register" },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
