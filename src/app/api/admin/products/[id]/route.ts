import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, db } from '../../_auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { variants, ...product } = body;
  const supabase = db();

  const { error } = await supabase.from('products').update(product).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (variants) {
    await supabase.from('product_variants').delete().eq('product_id', id);
    if (variants.length) {
      await supabase.from('product_variants').insert(
        variants.map((v: any) => ({ attribute_value: v.attribute_value, stock: v.stock, to_produce: v.to_produce ?? 0, product_id: id }))
      );
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = db();
  await supabase.from('product_variants').delete().eq('product_id', id);
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
