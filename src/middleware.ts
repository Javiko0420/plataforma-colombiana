import { NextResponse } from 'next/server'

/**
 * Simplified middleware for Edge Runtime compatibility
 * Basic security headers and routing
 */

// Basic + required security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Allow geolocation use on this origin; adjust as needed per environment
  'Permissions-Policy': 'geolocation=(self)',
  // Minimal CSP; allow API calls to Open-Meteo, ipwho.is, API-FOOTBALL and Cloudinary
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://upload-widget.cloudinary.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: https://media.api-sports.io https://media-3.api-sports.io https://res.cloudinary.com",
    "font-src 'self'",
    "connect-src 'self' https://api.open-meteo.com https://ipwho.is https://api-football-v1.p.rapidapi.com https://v3.football.api-sports.io https://widgets.api-sports.io https://widgets.api-football.com https://playerservices.streamtheworld.com https://*.streamtheworld.com https://api.cloudinary.com",
    "media-src 'self' https: data: https://playerservices.streamtheworld.com https://*.streamtheworld.com",
    "frame-src https://widgets.api-sports.io https://widgets.api-football.com https://upload-widget.cloudinary.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ')
}

export async function middleware() {
  // Create response with security headers
  const response = NextResponse.next()
  
  // Apply basic security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
