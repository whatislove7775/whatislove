import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, db } from '../_auth';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await db().from('cases').select('*').order('year', { ascending: false }).order('id', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // sort_order (если колонка уже добавлена миграцией) переопределяет порядок по году.
  const sorted = [...(data ?? [])].sort((a: any, b: any) => {
    const oa = a.sort_order, ob = b.sort_order;
    if (oa == null && ob == null) return 0;
    if (oa == null) return 1;
    if (ob == null) return -1;
    return oa - ob;
  });
  return NextResponse.json(sorted);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { data, error } = await db().from('cases').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
