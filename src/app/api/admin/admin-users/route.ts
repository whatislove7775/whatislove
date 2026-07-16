import { NextRequest, NextResponse } from 'next/server';
import { isOwner, db } from '../_auth';

// Управление сотрудниками-обработчиками. Только владелец (ADMIN_PASSWORD).
export async function GET(req: NextRequest) {
  if (!isOwner(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await db()
    .from('admin_users')
    .select('id, username, password, role, created_at')
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!isOwner(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const username = String(body.username ?? '').trim().slice(0, 100);
  const password = String(body.password ?? '').trim().slice(0, 200);
  const role = body.role === 'owner' ? 'owner' : 'processor';
  if (!username || !password) {
    return NextResponse.json({ error: 'нужны имя и пароль' }, { status: 400 });
  }
  if (password === process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'этот пароль занят' }, { status: 400 });
  }
  const { data, error } = await db()
    .from('admin_users')
    .insert({ username, password, role })
    .select('id, username, password, role, created_at')
    .single();
  if (error) {
    // Скорее всего дубликат пароля (уникальный индекс).
    return NextResponse.json({ error: 'не удалось добавить (возможно, такой пароль уже используется)' }, { status: 400 });
  }
  return NextResponse.json(data);
}
