import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin, db } from '../../_auth';
import { notifyPreorders } from '@/lib/notifyPreorders';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  // delivery_services пишем отдельно (best-effort), чтобы сохранение товара не падало,
  // если колонка ещё не добавлена миграцией.
  const { variants, delivery_services, ...product } = body;
  const supabase = db();

  // Если preorder_mode выключается — проверяем, нужно ли уведомлять подписчиков
  let shouldNotify = false;
  if ('preorder_mode' in product && product.preorder_mode === false) {
    const { data: current } = await supabase.from('products').select('preorder_mode').eq('id', id).single();
    if (current?.preorder_mode === true) shouldNotify = true;
  }

  if (Object.keys(product).length > 0) {
    const { error } = await supabase.from('products').update(product).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (delivery_services !== undefined) {
    await supabase.from('products').update({ delivery_services }).eq('id', id);
  }

  if (variants) {
    await supabase.from('product_variants').delete().eq('product_id', id);
    if (variants.length) {
      await supabase.from('product_variants').insert(
        variants.map((v: any) => ({ attribute_value: v.attribute_value, stock: v.stock, to_produce: v.to_produce ?? 0, product_id: id }))
      );
    }
  }
  revalidatePath('/products');
  revalidatePath('/products/[slug]', 'page');

  // Авто-уведомление предзаказов при возврате в наличие
  if (shouldNotify) {
    await notifyPreorders(supabase, Number(id));
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
  revalidatePath('/products');
  revalidatePath('/products/[slug]', 'page');
  return NextResponse.json({ ok: true });
}
