import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export type AdminRole = 'owner' | 'processor';

// Владелец: ключ в localStorage — это сам пароль ADMIN_PASSWORD. Без серверного
// состояния → работает одинаково на любом бессерверном инстансе (Vercel).
export function isOwner(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key');
  const pass = process.env.ADMIN_PASSWORD;
  return !!pass && key === pass;
}

// Полный доступ (управление товарами/настройками и т.п.) — только владелец.
export function isAdmin(req: NextRequest): boolean {
  return isOwner(req);
}

// Роль запроса: owner (пароль из env) | processor (строка в admin_users) | null.
// Используется на роутах, к которым допущены сотрудники-обработчики заказов.
export async function getAdminRole(req: NextRequest): Promise<AdminRole | null> {
  const key = req.headers.get('x-admin-key');
  if (!key) return null;
  if (process.env.ADMIN_PASSWORD && key === process.env.ADMIN_PASSWORD) return 'owner';
  try {
    const { data } = await db().from('admin_users').select('role').eq('password', key).limit(1).maybeSingle();
    if (data) return ((data.role as AdminRole) ?? 'processor');
  } catch {}
  return null;
}

export async function isAnyAdmin(req: NextRequest): Promise<boolean> {
  return (await getAdminRole(req)) !== null;
}

export function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
