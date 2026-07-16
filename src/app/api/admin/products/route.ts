import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin, db } from '../_auth';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = db();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, price, oldPrice, material, image_url, images, delivery, preorder_mode, product_variants(id, attribute_value, stock, to_produce)')
    .order('id', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Отдельные лёгкие запросы за sort_order и delivery_services — если колонка ещё не
  // добавлена (миграция не выполнена), просто вернётся ошибка и мы её проигнорируем.
  const { data: orderRows } = await supabase.from('products').select('id, sort_order');
  const orderMap = new Map((orderRows ?? []).map((r: any) => [r.id, r.sort_order]));

  const { data: delivRows } = await supabase.from('products').select('id, delivery_services');
  const delivMap = new Map((delivRows ?? []).map((r: any) => [r.id, r.delivery_services]));

  const sorted = [...(data ?? [])].sort((a: any, b: any) => {
    const oa = orderMap.get(a.id), ob = orderMap.get(b.id);
    if (oa == null && ob == null) return 0;
    if (oa == null) return 1;
    if (ob == null) return -1;
    return oa - ob;
  }).map((row: any) => ({ ...row, sort_order: orderMap.get(row.id) ?? null, delivery_services: delivMap.get(row.id) ?? null }));

  return NextResponse.json(sorted);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  // delivery_services пишем отдельно (best-effort): если колонка ещё не добавлена
  // миграцией, создание товара не должно падать.
  const { variants, delivery_services, ...product } = body;
  const supabase = db();

  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (delivery_services !== undefined) {
    await supabase.from('products').update({ delivery_services }).eq('id', data.id);
  }

  if (variants?.length) {
    await supabase.from('product_variants').insert(
      variants.map((v: any) => ({ ...v, product_id: data.id }))
    );
  }
  revalidatePath('/products');
  revalidatePath('/products/[slug]', 'page');
  return NextResponse.json(data);
}
