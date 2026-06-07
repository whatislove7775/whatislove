/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Современные форматы — заметно легче JPEG/PNG
    formats: ['image/avif', 'image/webp'],
    // Дольше держим оптимизированные картинки в кэше (сек)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 дней
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
  },

  // Redirect www.wh4tislove.ru → wh4tislove.ru (permanent 308)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.wh4tislove.ru' }],
        destination: 'https://wh4tislove.ru/:path*',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
