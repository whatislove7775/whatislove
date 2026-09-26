import type { Metadata } from "next";
import { RecoverForm } from "@/components/auth/RecoverForm";
import { ogMeta } from "@/lib/og/sections";

export const metadata: Metadata = {
  title: "Восстановить доступ",
  description: "Смена пароля по\u00a0имени и\u00a0ключу восстановления.",
  alternates: { canonical: "/recover" },
  ...ogMeta("/recover", "Восстановить доступ", "Новый пароль по\u00a0имени и\u00a0ключу восстановления."),
  robots: { index: false, follow: true },
};

export default function RecoverPage() {
  return <RecoverForm />;
}
