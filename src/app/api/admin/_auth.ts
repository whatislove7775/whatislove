import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Простая проверка по паролю. Ключ, который хранит админка в localStorage —
// это и есть пароль (ADMIN_PASSWORD). Без серверного состояния: работает
// одинаково на любом бессерверном инстансе (Vercel), поэтому вход не "слетает".
export function isAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key');
  const pass = process.env.ADMIN_PASSWORD;
  return !!pass && key === pass;
}

export function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
