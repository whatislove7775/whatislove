/** Client nickname (alias): suggest, live check, signup with a custom one, change later. See docs/API.md. */
import { api } from "./client";
import type { AuthResponse, User } from "./types";

export interface AliasCheck {
  alias: string;
  available: boolean;
  error: string | null;
}

export interface MyAlias {
  alias: string;
  /** ISO time when the nickname can be changed again; null — can change now. */
  next_change_at: string | null;
}

export const nicknameApi = {
  suggest: () => api<{ alias: string }>("/auth/alias/suggest/", { auth: false }),
  check: (alias: string, signal?: AbortSignal) => api<AliasCheck>("/auth/alias/check/", { query: { alias }, signal }),
  signup: (password: string, alias?: string) =>
    api<AuthResponse>("/auth/anonymous/", { method: "POST", body: alias ? { password, alias } : { password }, auth: false }),
  mine: () => api<MyAlias>("/auth/me/alias/"),
  change: (alias: string) => api<MyAlias & { user: User }>("/auth/me/alias/", { method: "POST", body: { alias } }),
};

/** Client-side mirror of the server rules — instant feedback before the network check. */
export function aliasHint(raw: string): string | null {
  const v = raw.trim().replace(/\s+/g, " ").toLowerCase().replace(/ё/g, "е");
  if (v.length < 3) return "Не\u00a0короче 3\u00a0символов.";
  if (v.length > 32) return "Не\u00a0длиннее 32\u00a0символов.";
  if (/[@./:]/.test(v)) return "Ник не\u00a0может быть почтой, ссылкой или\u00a0@именем.";
  if (!/^[a-zа-я0-9 _-]+$/.test(v)) return "Только буквы, цифры, дефис, подчёркивание и\u00a0пробел.";
  if (!/[a-zа-я]/.test(v)) return "Нужна хотя\u00a0бы одна буква.";
  return null;
}
