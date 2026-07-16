import { NextRequest, NextResponse } from 'next/server';
import { getAdminRole, db } from '../_auth';

export async function GET(req: NextRequest) {
  if (!(await getAdminRole(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await db()
    .from('order_notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Отметить заказ отправленным / снять отметку. Доступно и владельцу, и обработчикам.
export async function PATCH(req: NextRequest) {
  if (!(await getAdminRole(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const id = body.id;
  const shipped = !!body.shipped;
  if (!id) return NextResponse.json({ error: 'id обязателен' }, { status: 400 });
  const { error } = await db()
    .from('order_notifications')
    .update({ shipped, shipped_at: shipped ? new Date().toISOString() : null })
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
