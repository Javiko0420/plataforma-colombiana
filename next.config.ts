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
  // Ignorar errores de ESLint durante el build (bug conocido con flat config + react plugin)
  // Nota: ESLint sigue ejecutándose localmente vía "npm run lint"
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
