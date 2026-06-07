import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/ProductDetail';

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wh4tislove.ru';

// Per-product SEO overrides
const SEO_OVERRIDES: Record<string, { title: string; description: string; keywords: string[] }> = {
  'ring-heart': {
    title: 'Кольцо <3 «меньше чем три» — сердечко из стали',
    description:
      'Кольцо <3 (меньше чем три) — стальное кольцо-сердечко от дизайн-студии whatislove. ' +
      'Кольцо Егор Крид, кольцо less than three, кольцо <3. Заказать с доставкой по России.',
    keywords: [
      'кольцо <3',
      'кольцо меньше чем три',
      'меньше чем три',
      'кольцо сердечко',
      'кольцо less than three',
      'Егор Крид кольцо',
      'кольцо сердце сталь',
      'стальное кольцо сердечко',
      'купить кольцо <3',
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabase
    .from('products')
    .select('name, image_url, price')
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'Продукт' };

  const override = SEO_OVERRIDES[slug];

  const title = override?.title ?? data.name;
  const description = override?.description ??
    `${data.name} — ${data.price} руб. Заказать в дизайн-студии whatislove.`;

  return {
    title,
    description,
    keywords: override?.keywords,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${slug}`,
      images: data.image_url ? [{ url: data.image_url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
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
