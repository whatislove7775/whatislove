import { supabase } from '@/lib/supabase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wh4tislove.ru';

export default async function sitemap() {
  const [{ data: cases }, { data: products }] = await Promise.all([
    supabase.from('cases').select('slug'),
    supabase.from('products').select('slug'),
  ]);

  const staticRoutes = [
    { url: siteUrl, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${siteUrl}/portfolio`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${siteUrl}/products`, priority: 0.9, changeFrequency: 'weekly' as const },
    { url: `${siteUrl}/info`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${siteUrl}/links`, priority: 0.4, changeFrequency: 'monthly' as const },
  ].map(r => ({ ...r, lastModified: new Date() }));

  const caseRoutes = (cases || []).map(c => ({
    url: `${siteUrl}/portfolio/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const productRoutes = (products || []).map(p => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  return [...staticRoutes, ...caseRoutes, ...productRoutes];
}
