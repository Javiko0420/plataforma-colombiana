import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Lista blanca de dominios corporativos autorizados para acceder al panel admin.
// Defense in Depth: el acceso requiere ROL válido + email en dominio corporativo.
const ALLOWED_ADMIN_DOMAINS = ['@latinterritory.com', '@javiwarrior.com']

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const response = NextResponse.next()

  // Auth routes pass through without any processing to prevent redirect loops
  if (path.startsWith('/auth/') || path.startsWith('/api/auth/')) {
    return NextResponse.next()
  }

  // ── 1. Protección del Panel de Administración (/admin) ─────────────────
  if (path.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // A. Si no hay sesión, redirigir al login
    if (!token) {
      const url = new URL('/auth/signin', req.url)
      url.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(url)
    }

    // B. Validación de ROL (Debe ser Admin o Moderador)
    const userRole = token.role as string
    const isAuthorizedRole = userRole === 'ADMIN' || userRole === 'MODERATOR'

    // C. Validación de DOMINIO (Debe ser corporativo)
    const userEmail = token.email || ''
    const isAuthorizedDomain = ALLOWED_ADMIN_DOMAINS.some(domain =>
      userEmail.endsWith(domain),
    )

    // D. "El Portero": Si falla rol O falla dominio -> A casa.
    if (!isAuthorizedRole || !isAuthorizedDomain) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // E. Perfil incompleto → redirigir a completar perfil
    if (token.hasCompletedProfile === false) {
      return NextResponse.redirect(new URL('/perfil/completar', req.url))
    }
  }

  // ── 2. Protección de rutas autenticadas (/registrar-negocio, /perfil) ──
  const protectedRoutes = ['/registrar-negocio', '/perfil']
  if (protectedRoutes.some(route => path.startsWith(route))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    if (!token) {
      const url = new URL('/auth/signin', req.url)
      url.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(url)
    }

    // Perfil incompleto → redirigir a /perfil/completar.
    // Usamos `=== false` (no falsy) para no afectar tokens existentes
    // creados antes de esta feature (donde hasCompletedProfile es undefined).
    // Solo tokens nuevos que explícitamente tengan `false` serán redirigidos.
    // Preservamos el callbackUrl para que el usuario vuelva a su destino
    // original (ej: /registrar-negocio) después de completar el perfil.
    if (token.hasCompletedProfile === false && !path.startsWith('/perfil/completar')) {
      const completeUrl = new URL('/perfil/completar', req.url)
      completeUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(completeUrl)
    }
  }

  // ── 3. Protección de API Routes para n8n (External Access) ─────────────
  if (path.startsWith('/api/admin')) {
    const apiKey = req.headers.get('x-api-key')

    if (!apiKey || apiKey !== process.env.N8N_ADMIN_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Invalid API Key' }),
        { status: 401, headers: { 'content-type': 'application/json' } },
      )
    }
  }

  // ── 4. Headers de Seguridad (Security Hardening) ───────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    [
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
  )

  return response
}

export const config = {
  matcher: [
    '/admin/:path*', // Protege todas las rutas de UI de admin
    '/registrar-negocio', // Requiere autenticación para registrar negocio
    '/perfil/:path*', // Requiere autenticación para ver perfil
    '/api/admin/:path*', // Protege endpoints de automatización
    '/((?!_next/static|_next/image|favicon.ico|public/).*)', // Aplica headers a todo lo demás
  ],
}
