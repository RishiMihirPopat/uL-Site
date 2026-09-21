import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.ngrok-free.app',
    '*.ngrok.app',
    '*.ngrok.io',
    '*.loca.lt',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'd10y46cwh6y6x1.cloudfront.net' },
      { protocol: 'https', hostname: 'urbanaut-prod.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: '**.blob.vercel-storage.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/category-covers/community-cover.JPG',
        destination: '/category-covers/community-cover.jpg',
      },
      {
        source: '/category-covers/unlecture-cover.jpg',
        destination: '/category-covers/unLecture-cover.jpg',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
