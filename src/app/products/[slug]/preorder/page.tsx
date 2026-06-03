import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import PreorderPageClient from './PreorderPageClient';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabase.from('products').select('name').eq('slug', slug).single();
  return { title: data ? `Предзаказ — ${data.name}` : 'Предзаказ' };
}

export default async function PreorderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: product } = await supabase
    .from('products')
    .select('id, name, slug, price, image_url, preorder_mode, product_variants(attribute_value, stock)')
    .eq('slug', slug)
    .single();

  if (!product) notFound();

  const sizes = (product.product_variants || [])
    .map((v: any) => String(v.attribute_value))
    .sort((a: string, b: string) => Number(a) - Number(b));

  return <PreorderPageClient product={product} sizes={sizes} />;
}
