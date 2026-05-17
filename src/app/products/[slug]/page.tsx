import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [{ data: product }, { data: textData }] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_variants(id, attribute_value, stock, to_produce)')
      .eq('slug', params.slug)
      .single(),
    supabase.from('site_settings').select('value').eq('key', 'product_bottom_text').single(),
  ]);

  if (!product) notFound();

  const stock = (product.product_variants || []).reduce(
    (acc: Record<string, number>, v: any) => {
      acc[String(v.attribute_value)] = v.stock ?? 0;
      return acc;
    },
    {}
  );

  return (
    <ProductDetail
      product={{ ...product, stock }}
      bottomText={textData?.value || 'произведём, упакуем,\nи доставим'}
    />
  );
}
