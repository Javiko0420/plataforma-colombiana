import type { NextConfig } from "next";

// Headers de seguridad para TODAS las respuestas. Antes vivían en el
// middleware con un matcher catch-all, lo que invocaba el middleware en cada
// request solo para setear headers; aquí los aplica la plataforma sin costo.
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://upload-widget.cloudinary.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: https://media.api-sports.io https://media-3.api-sports.io https://res.cloudinary.com https://lh3.googleusercontent.com",
      "font-src 'self'",
      "connect-src 'self' https://api.open-meteo.com https://ipwho.is https://api-football-v1.p.rapidapi.com https://v3.football.api-sports.io https://widgets.api-sports.io https://widgets.api-football.com https://playerservices.streamtheworld.com https://*.streamtheworld.com https://api.cloudinary.com https://formspree.io",
      "media-src 'self' https: data: https://playerservices.streamtheworld.com https://*.streamtheworld.com",
      "frame-src https://widgets.api-sports.io https://widgets.api-football.com https://upload-widget.cloudinary.com",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

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
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // API-Football team/league logos (used by worldcup module)
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
      },
      {
        protocol: 'https',
        hostname: 'media-3.api-sports.io',
      },
    ],
  },
  // Ignorar errores de ESLint durante el build (bug conocido con flat config + react plugin)
  // Nota: ESLint sigue ejecutándose localmente vía "npm run lint"
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
