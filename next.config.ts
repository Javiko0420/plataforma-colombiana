import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure Prisma works properly with Next.js
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
