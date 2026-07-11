import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, db } from '../_auth';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await db().from('link_columns').select('*').order('sort_order', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { data: last } = await db().from('link_columns').select('sort_order').order('sort_order', { ascending: false }).limit(1).single();
  const nextOrder = (last?.sort_order ?? -1) + 1;
  const { data, error } = await db()
    .from('link_columns')
    .insert({ title: body.title ?? '', sort_order: nextOrder })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
