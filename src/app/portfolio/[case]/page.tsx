import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import CasePageClient from './CasePageClient';

export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wh4tislove.ru';

export async function generateMetadata({ params }: { params: Promise<{ case: string }> }) {
  const { case: slug } = await params;
  const { data } = await supabase
    .from('cases')
    .select('title, desc, image_url, tags')
    .eq('slug', slug)
    .single();

  if (!data) return {};

  const description = data.desc?.slice(0, 155) || data.title;
  return {
    title: data.title,
    description,
    openGraph: {
      title: data.title,
      description,
      url: `${siteUrl}/portfolio/${slug}`,
      images: data.image_url ? [{ url: data.image_url }] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description,
      images: data.image_url ? [data.image_url] : [],
    },
  };
}

export default async function CasePage({ params }: { params: Promise<{ case: string }> }) {
  const { case: slug } = await params;
  const { data: project } = await supabase
    .from('cases')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!project) notFound();

  const caseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.desc,
    image: project.image_url ? [project.image_url] : undefined,
    url: `${siteUrl}/portfolio/${slug}`,
    ...(project.year ? { datePublished: String(project.year) } : {}),
    creator: { '@type': 'Organization', name: 'WH4T!SLOV3' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(caseJsonLd) }} />
      <CasePageClient project={project} />
    </>
  );
}
