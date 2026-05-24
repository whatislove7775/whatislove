import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin, db } from '../_auth';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await db()
    .from('products')
    .select('id, name, slug, price, oldPrice, material, image_url, images, delivery, product_variants(id, attribute_value, stock, to_produce)')
    .order('id', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { variants, ...product } = body;
  const supabase = db();

  const { data, error } = await supabase.from('products').insert(product).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (variants?.length) {
    await supabase.from('product_variants').insert(
      variants.map((v: any) => ({ ...v, product_id: data.id }))
    );
  }
  revalidatePath('/products');
  revalidatePath('/products/[slug]', 'page');
  return NextResponse.json(data);
}
