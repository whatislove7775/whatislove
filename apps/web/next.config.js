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
          { key: "X-Content-Type-Options",        value: "nosniff"      },
          { key: "X-Frame-Options",               value: "DENY"         },
          { key: "Referrer-Policy",               value: "no-referrer"  },
          // Required for MediaPipe Tasks Vision WASM (SharedArrayBuffer / GPU delegate).
          // "credentialless" is less restrictive than "require-corp" — cross-origin
          // resources (RPM CDN, googleapis, jsDelivr) load without extra CORP headers.
          { key: "Cross-Origin-Opener-Policy",    value: "same-origin"  },
          { key: "Cross-Origin-Embedder-Policy",  value: "credentialless" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
