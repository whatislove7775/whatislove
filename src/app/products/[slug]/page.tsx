import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wh4tislove.ru';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabase
    .from('products')
    .select('name, image_url, price')
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'Продукт' };

  const description = `${data.name} — ${data.price} руб. Заказать в дизайн-студии whatislove.`;
  return {
    title: data.name,
    description,
    openGraph: {
      title: `${data.name} | WH4T!SLOV3`,
      description,
      url: `${siteUrl}/products/${slug}`,
      images: data.image_url ? [{ url: data.image_url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.name,
      description,
      images: data.image_url ? [data.image_url] : [],
    },
  };
}

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
