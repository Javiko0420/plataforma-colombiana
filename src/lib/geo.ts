export type GeoPoint = { latitude: number; longitude: number; city?: string; country?: string }

/**
 * True si `ip` es una dirección enrutable públicamente.
 * Descarta loopback, rangos privados (RFC 1918), link-local y ULA IPv6.
 *
 * En local el `x-forwarded-for` suele ser `::1`/`127.0.0.1`, y tras algunos
 * proxies llega una IP privada. En esos casos NO debemos consultar ipwho.is con
 * esa IP (responde "Reserved range"): es mejor dejar que ipwho.is detecte la IP
 * pública de salida con una consulta sin parámetro.
 */
export function isPublicIp(ip: string | undefined | null): boolean {
  if (!ip) return false
  const v = ip.trim().toLowerCase()
  if (v === '' || v === '::1' || v === '::' || v === '0.0.0.0') return false
  if (/^127\./.test(v)) return false                       // loopback IPv4
  if (/^10\./.test(v)) return false                        // privada
  if (/^192\.168\./.test(v)) return false                  // privada
  if (/^169\.254\./.test(v)) return false                  // link-local IPv4
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(v)) return false   // 172.16.0.0–172.31.255.255
  if (/^(fc|fd|fe80)/.test(v)) return false                // ULA / link-local IPv6
  return true
}

/**
 * GET JSON con el cliente `https` nativo de Node.
 *
 * Importante: NO usamos `fetch` aquí. El `fetch` instrumentado de Next.js inyecta
 * un header `Origin` que ipwho.is (plan free) rechaza con
 * 403 "CORS is not supported on the Free plan". El cliente nativo no lo envía.
 */
async function getJsonNoOrigin(url: string): Promise<Record<string, unknown> | null> {
  const https = await import('node:https')
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { accept: 'application/json' } }, (res) => {
      if (!res.statusCode || res.statusCode >= 400) { res.resume(); resolve(null); return }
      let body = ''
      res.setEncoding('utf8')
      res.on('data', (chunk) => { body += chunk })
      res.on('end', () => { try { resolve(JSON.parse(body)) } catch { resolve(null) } })
    })
    req.on('error', () => resolve(null))
    req.setTimeout(4500, () => { req.destroy(); resolve(null) })
  })
}

/**
 * Resuelve la ubicación aproximada del visitante.
 *
 * Orden de prioridad:
 *   1. Headers de geolocalización de Vercel (`x-vercel-ip-*`) — presentes en
 *      producción, confiables y sin dependencias externas.
 *   2. `request.geo` legacy (algunas plataformas/edge).
 *   3. ipwho.is (desarrollo local y fallback), vía cliente nativo de Node.
 */
export async function resolveGeo(request: Request): Promise<GeoPoint | null> {
  // 1) Vercel edge geolocation headers (producción).
  const vLat = Number(request.headers.get('x-vercel-ip-latitude'))
  const vLon = Number(request.headers.get('x-vercel-ip-longitude'))
  if (Number.isFinite(vLat) && Number.isFinite(vLon) && (vLat !== 0 || vLon !== 0)) {
    const rawCity = request.headers.get('x-vercel-ip-city')
    let city: string | undefined
    try { city = rawCity ? decodeURIComponent(rawCity) : undefined } catch { city = rawCity ?? undefined }
    return { latitude: vLat, longitude: vLon, city, country: request.headers.get('x-vercel-ip-country') ?? undefined }
  }

  // 2) Legacy request.geo.
  const geo = (request as unknown as { geo?: { city?: string; country?: string; latitude?: string; longitude?: string } }).geo
  if (geo && geo.latitude && geo.longitude) {
    const lat = Number(geo.latitude)
    const lon = Number(geo.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { latitude: lat, longitude: lon, city: geo.city, country: geo.country }
    }
  }

  // 3) ipwho.is. Solo usamos la IP del header si es pública; si es loopback/
  //    privada (local o tras proxy), consulta sin IP para que detecte la de salida.
  const candidate = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || undefined
  const ip = isPublicIp(candidate) ? candidate : undefined
  const url = ip
    ? `https://ipwho.is/${encodeURIComponent(ip)}?fields=success,latitude,longitude,city,country`
    : 'https://ipwho.is/?fields=success,latitude,longitude,city,country'

  const data = await getJsonNoOrigin(url)
  if (data && data.success === true && Number.isFinite(Number(data.latitude)) && Number.isFinite(Number(data.longitude))) {
    return {
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      city: typeof data.city === 'string' ? data.city : undefined,
      country: typeof data.country === 'string' ? data.country : undefined,
    }
  }
  return null
}
