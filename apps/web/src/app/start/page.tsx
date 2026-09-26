import type { Metadata } from "next";
import { StartForm } from "@/components/auth/StartForm";
import { ogMeta } from "@/lib/og/sections";

export const metadata: Metadata = {
  title: "Начать анонимно",
  description:
    "Анонимная регистрация без\u00a0почты и\u00a0телефона: только пароль. Имя и\u00a0ключ восстановления создаются автоматически.",
  alternates: { canonical: "/start" },
  ...ogMeta("/start", "Начать анонимно", "Без\u00a0почты и\u00a0телефона: только пароль. Имя и\u00a0ключ восстановления создаются сами."),
};

export default function StartPage() {
  return <StartForm />;
}
