/**
 * Smart App Link
 * GET /app - Redirige a la tienda de apps según el dispositivo del visitante.
 *
 * Pensado como link único para redes sociales (botón de la página de Facebook
 * de LatinTerritory). El navegador in-app de Facebook conserva "iPhone" o
 * "Android" en su user-agent, así que la detección funciona también ahí.
 *
 * Redirects 302 (temporales) a propósito: un 301 quedaría cacheado en el
 * navegador y fijaría el destino de forma permanente.
 */

import { NextResponse, type NextRequest } from 'next/server'

// La ruta debe leer el user-agent de cada request en vivo: nunca prerender.
export const dynamic = 'force-dynamic'

const APP_STORE_URL = 'https://apps.apple.com/us/app/latinterritory/id6775073125'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.latinterritory.mobile'
const FALLBACK_URL = 'https://latinterritory.com'

export function GET(request: NextRequest): NextResponse {
  const userAgent = request.headers.get('user-agent') ?? ''

  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return NextResponse.redirect(APP_STORE_URL, 302)
  }

  if (/android/i.test(userAgent)) {
    return NextResponse.redirect(PLAY_STORE_URL, 302)
  }

  return NextResponse.redirect(FALLBACK_URL, 302)
}
