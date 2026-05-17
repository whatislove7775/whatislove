import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';

export const revalidate = 60;

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [{ data: product }, { data: textData }] = await Promise.all([
    supabase.from('products').select('*').eq('slug', params.slug).single(),
    supabase.from('site_settings').select('value').eq('key', 'product_bottom_text').single(),
  ]);

  if (!product) notFound();

  return (
    <ProductDetail
      product={product}
      bottomText={textData?.value || 'произведём, упакуем,\nи доставим'}
    />
  );
}
