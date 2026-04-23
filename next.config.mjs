/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'kong' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
