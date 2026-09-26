import type { Metadata } from "next";
import { JoinForm } from "@/components/auth/JoinForm";
import { ogMeta } from "@/lib/og/sections";

export const metadata: Metadata = {
  title: "Для\u00a0психологов",
  description:
    "Анкета психолога для\u00a0Aprosop: анонимные диалоги и\u00a0видеосозвоны с\u00a0клиентами. Профиль появляется в\u00a0каталоге после ручной проверки.",
  alternates: { canonical: "/join" },
  ...ogMeta("/join", "Для\u00a0психологов", "Анонимные клиенты, диалоги и\u00a0видеозвонки. Профиль появляется после ручной проверки."),
};

export default function JoinPage() {
  return <JoinForm />;
}
