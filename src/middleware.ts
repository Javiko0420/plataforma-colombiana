import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Lista blanca de dominios corporativos autorizados para acceder al panel admin.
// Defense in Depth: el acceso requiere ROL válido + email en dominio corporativo.
const ALLOWED_ADMIN_DOMAINS = ['@latinterritory.com', '@javiwarrior.com']

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

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

  // Nota: los headers de seguridad (CSP, X-Frame-Options, etc.) viven en
  // next.config.ts → headers(). Este middleware solo corre en rutas protegidas.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*', // Protege todas las rutas de UI de admin
    '/registrar-negocio', // Requiere autenticación para registrar negocio
    '/perfil/:path*', // Requiere autenticación para ver perfil
    '/api/admin/:path*', // Protege endpoints de automatización
  ],
}
