import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { PortalGate } from "@/components/business/PortalGate";

/** HR portal of a company (B2B): aggregates only. Never indexed. */
export const metadata: Metadata = {
  title: { default: "Кабинет компании", template: "%s | Aprosop для\u00a0компаний" },
  description: "Кабинет HR-администратора компании в\u00a0Aprosop.",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="business">
      <PortalGate>{children}</PortalGate>
    </AppShell>
  );
}
