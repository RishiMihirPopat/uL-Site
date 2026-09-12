import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '*.ngrok-free.app',
    '*.ngrok.app',
    '*.ngrok.io',
    '*.loca.lt',
  ],
  serverExternalPackages: ['better-sqlite3'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'd10y46cwh6y6x1.cloudfront.net' },
      { protocol: 'https', hostname: 'urbanaut-prod.s3.ap-south-1.amazonaws.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
};

export default nextConfig;
