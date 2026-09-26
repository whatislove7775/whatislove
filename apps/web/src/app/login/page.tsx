import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { ogMeta } from "@/lib/og/sections";

export const metadata: Metadata = {
  title: "Вход",
  description: "Вход в\u00a0Aprosop по\u00a0имени вроде «тихий-кит-4821» или\u00a0по\u00a0почте специалиста.",
  alternates: { canonical: "/login" },
  ...ogMeta("/login", "Вход в\u00a0Aprosop", "По\u00a0имени вроде «тихий-кит-4821» или\u00a0по\u00a0почте специалиста."),
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
