import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure Prisma works properly with Next.js
  serverExternalPackages: ['@prisma/client', '@prisma/engines'],
};

export default nextConfig;
