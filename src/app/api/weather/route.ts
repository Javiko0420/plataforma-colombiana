import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchWeather } from '@/lib/weather'
import { findCityBySlug } from '@/lib/cities'
import { resolveGeo } from '@/lib/geo'

export const runtime = 'edge'

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

  // Priority: lat/lon → city → me (geo)
  if (q.lat && q.lon) {
    latitude = Number(q.lat)
    longitude = Number(q.lon)
  } else if (q.city) {
    const c = findCityBySlug(q.city)
    if (!c) return NextResponse.json({ success: false, error: 'Unknown city' }, { status: 404 })
    latitude = c.latitude
    longitude = c.longitude
  } else if (q.me === '1') {
    const g = await resolveGeo(request)
    if (g) {
      latitude = g.latitude
      longitude = g.longitude
    } else {
      // Fallback a Bogotá si no hay geo por IP
      const bogota = findCityBySlug('bogota')!
      latitude = bogota.latitude
      longitude = bogota.longitude
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
    return NextResponse.json({ success: true, data: bundle })
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Weather fetch failed' }, { status: 502 })
  }
}


