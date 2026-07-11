const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wh4tislove.ru';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/checkout/', '/order/', '/admin/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
