/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "Referrer-Policy",        value: "no-referrer" },
          // Разрешаем камеру/микрофон нашей странице и Jitsi-iframe (meet.jit.si)
          {
            key:   "Permissions-Policy",
            value: 'camera=(self "https://meet.jit.si"), microphone=(self "https://meet.jit.si"), display-capture=(self "https://meet.jit.si"), fullscreen=(self "https://meet.jit.si"), autoplay=(self "https://meet.jit.si")',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
