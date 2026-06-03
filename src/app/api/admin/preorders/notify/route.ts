import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, db } from '../../_auth';
import { notifyPreorders } from '@/lib/notifyPreorders';

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { product_id } = await req.json();
  if (!product_id) return NextResponse.json({ error: 'product_id обязателен' }, { status: 400 });
  const result = await notifyPreorders(db(), Number(product_id));
  return NextResponse.json(result);
}
