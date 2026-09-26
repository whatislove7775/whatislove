"use client";

import { useEffect, type ReactNode } from "react";
import { ToastProvider } from "@/ui";
import { consoleHello } from "@/lib/console/hello";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(consoleHello, []);
  return <ToastProvider>{children}</ToastProvider>;
}
