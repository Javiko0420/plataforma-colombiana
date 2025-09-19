export type GeoPoint = { latitude: number; longitude: number; city?: string; country?: string }

/**
 * Try to get geo from platform (Vercel/Edge) request.geo first.
 * Fallback to ipwho.is (no API key, free tier) using x-forwarded-for when present.
 */
export async function resolveGeo(request: Request): Promise<GeoPoint | null> {
  const geo = (request as unknown as { geo?: { city?: string; country?: string; latitude?: string; longitude?: string } }).geo
  if (geo && geo.latitude && geo.longitude) {
    const lat = Number(geo.latitude)
    const lon = Number(geo.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { latitude: lat, longitude: lon, city: geo.city, country: geo.country }
    }
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || undefined

  const url = ip ? `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,latitude,longitude,city,country` :
                   'https://ipwho.is/?fields=success,latitude,longitude,city,country'
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    if (data && data.success && Number.isFinite(data.latitude) && Number.isFinite(data.longitude)) {
      return { latitude: Number(data.latitude), longitude: Number(data.longitude), city: data.city, country: data.country }
    }
  } catch {
    // ignore
  }
  return null
}


