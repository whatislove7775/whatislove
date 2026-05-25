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
          // Delegate camera/mic to cross-origin Jitsi iframe
          { key: "Permissions-Policy",     value: "camera=*, microphone=*, display-capture=*" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
