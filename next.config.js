/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
