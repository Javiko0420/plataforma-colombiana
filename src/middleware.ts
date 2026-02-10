import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Middleware "Guardián" — protección de rutas y seguridad
 *
 * 1. Rutas /admin/*        → requiere sesión con rol ADMIN o MODERATOR
 * 2. Rutas /api/admin/*    → requiere header x-api-key válido (n8n / herramientas externas)
 * 3. Todas las rutas       → headers de seguridad (CSP, X-Frame-Options, etc.)
 */

// Headers de seguridad consolidados (configuración original preservada)
const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self)',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://upload-widget.cloudinary.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: https://media.api-sports.io https://media-3.api-sports.io https://res.cloudinary.com",
    "font-src 'self'",
    "connect-src 'self' https://api.open-meteo.com https://ipwho.is https://api-football-v1.p.rapidapi.com https://v3.football.api-sports.io https://widgets.api-sports.io https://widgets.api-football.com https://playerservices.streamtheworld.com https://*.streamtheworld.com https://api.cloudinary.com https://formspree.io",
    "media-src 'self' https: data: https://playerservices.streamtheworld.com https://*.streamtheworld.com",
    "frame-src https://widgets.api-sports.io https://widgets.api-football.com https://upload-widget.cloudinary.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),
}

/** Aplica headers de seguridad a cualquier respuesta */
function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/** Respuesta JSON de error con headers de seguridad incluidos */
function jsonError(message: string, status: number): NextResponse {
  const res = new NextResponse(
    JSON.stringify({ error: message }),
    { status, headers: { 'content-type': 'application/json' } },
  )
  return applySecurityHeaders(res)
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // ── 1. Protección de API Routes para n8n (External Access) ────────────
  // Verificar antes que /admin UI para que /api/admin no caiga en ambas ramas
  if (path.startsWith('/api/admin')) {
    const apiKey = req.headers.get('x-api-key')

    if (!apiKey) {
      return jsonError('Missing API Key', 401)
    }

    // MVP: comparación contra variable de entorno maestra para n8n
    // Escalar a DB lookup (tabla ApiKey) cuando se necesiten múltiples keys dinámicas
    if (apiKey !== process.env.N8N_ADMIN_API_KEY) {
      return jsonError('Invalid API Key', 403)
    }

    // API Key válida → continuar con headers de seguridad
    return applySecurityHeaders(NextResponse.next())
  }

  // ── 2. Protección de Rutas de Admin (UI) ──────────────────────────────
  if (path.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // Sin sesión → redirigir a login con callback
    if (!token) {
      const url = new URL('/auth/signin', req.url)
      url.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(url)
    }

    // Solo ADMIN y MODERATOR pueden acceder al panel
    const userRole = token.role as string
    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // ── 3. Headers de seguridad para todas las rutas ──────────────────────
  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto archivos estáticos:
     * - _next/static (archivos estáticos de Next.js)
     * - _next/image  (optimización de imágenes)
     * - favicon.ico
     * - carpeta public
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
