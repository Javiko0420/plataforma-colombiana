import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchWeather } from '@/lib/weather'
import { findCityBySlug } from '@/lib/cities'
import { resolveGeo } from '@/lib/geo'

export const runtime = 'nodejs'

const querySchema = z.object({
  lat: z.string().optional(),
  lon: z.string().optional(),
  city: z.string().optional(),
  me: z.string().optional(),
})

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 })
  }

  const q = parsed.data

  let latitude: number | undefined
  let longitude: number | undefined
  // Nombre de la ciudad resuelta (para mostrar en la UI; opcional).
  let city: string | undefined
  let country: string | undefined

  // Priority: lat/lon → city → me (geo)
  if (q.lat && q.lon) {
    latitude = Number(q.lat)
    longitude = Number(q.lon)
  } else if (q.city) {
    const c = findCityBySlug(q.city)
    if (!c) return NextResponse.json({ success: false, error: 'Unknown city' }, { status: 404 })
    latitude = c.latitude
    longitude = c.longitude
    city = c.name
    country = c.country
  } else if (q.me === '1') {
    const g = await resolveGeo(request)
    if (g) {
      latitude = g.latitude
      longitude = g.longitude
      city = g.city
      country = g.country
    } else {
      // Fallback a Bogotá si no hay geo por IP
      const bogota = findCityBySlug('bogota')!
      latitude = bogota.latitude
      longitude = bogota.longitude
      city = bogota.name
      country = bogota.country
    }
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ success: false, error: 'Missing coordinates' }, { status: 400 })
  }

  try {
    const bundle = await fetchWeather(latitude!, longitude!, {
      currentTtlSec: 300, // 5 min
      forecastTtlSec: 3600 // 60 min
    })
    // `me=1` depende de la IP del visitante: solo caché privada (navegador).
    // Variantes por ciudad/coordenadas son públicas y cacheables en CDN por URL.
    const cacheControl =
      q.me === '1'
        ? 'private, max-age=300'
        : 'public, s-maxage=600, stale-while-revalidate=1800'
    return NextResponse.json({
      success: true,
      data: bundle,
      location: city ? { city, country: country ?? null } : null,
    }, { headers: { 'Cache-Control': cacheControl } })
  } catch {
    return NextResponse.json({ success: false, error: 'Weather fetch failed' }, { status: 502 })
  }
}


