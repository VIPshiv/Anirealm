import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  serverExternalPackages: ['anigo-anime-api'],
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', 'lucide-react', 'framer-motion'],
    serverActions: {
      allowedOrigins: ['v34s680f-3000.inc1.devtunnels.ms', 'localhost:3000'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/suwayomi-graphql',
        destination: 'http://127.0.0.1:4567/api/graphql',
      },
      {
        source: '/api/suwayomi/:path*',
        destination: 'http://127.0.0.1:4567/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
