import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventEmitter } from 'node:events'
import { resolveGeo, isPublicIp } from '@/lib/geo'

// Mock del cliente https nativo que usa resolveGeo (vía `await import('node:https')`).
const { httpsGet } = vi.hoisted(() => ({ httpsGet: vi.fn() }))
vi.mock('node:https', () => ({ default: { get: httpsGet }, get: httpsGet }))

/** Simula una respuesta JSON de https.get(url, opts, cb). */
function primeHttps(jsonBody: unknown, statusCode = 200) {
  httpsGet.mockImplementationOnce((_url: string, _opts: unknown, cb: (res: EventEmitter & { statusCode: number; setEncoding: () => void; resume: () => void }) => void) => {
    const res = Object.assign(new EventEmitter(), {
      statusCode,
      setEncoding: () => {},
      resume: () => {},
    })
    cb(res)
    queueMicrotask(() => { res.emit('data', JSON.stringify(jsonBody)); res.emit('end') })
    const req = Object.assign(new EventEmitter(), { setTimeout: () => {}, destroy: () => {} })
    return req
  })
}

describe('isPublicIp', () => {
  it('rejects loopback, private, link-local and reserved addresses', () => {
    for (const ip of ['::1', '::', '0.0.0.0', '127.0.0.1', '10.0.0.5', '192.168.1.10', '169.254.1.1', '172.16.0.1', '172.31.255.255', 'fd00::1', 'fe80::1']) {
      expect(isPublicIp(ip), ip).toBe(false)
    }
  })

  it('rejects empty / nullish values', () => {
    expect(isPublicIp(undefined)).toBe(false)
    expect(isPublicIp(null)).toBe(false)
    expect(isPublicIp('')).toBe(false)
  })

  it('accepts routable public addresses', () => {
    for (const ip of ['203.0.113.5', '8.8.8.8', '152.200.1.1', '172.15.0.1', '172.32.0.1']) {
      expect(isPublicIp(ip), ip).toBe(true)
    }
  })
})

describe('resolveGeo', () => {
  beforeEach(() => {
    httpsGet.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('prioritizes Vercel geolocation headers (production)', async () => {
    const req = new Request('https://example.com', {
      headers: {
        'x-vercel-ip-latitude': '-27.47',
        'x-vercel-ip-longitude': '153.02',
        'x-vercel-ip-city': 'Brisbane',
        'x-vercel-ip-country': 'AU',
      },
    })
    const g = await resolveGeo(req)
    expect(g?.city).toBe('Brisbane')
    expect(g?.latitude).toBeCloseTo(-27.47)
    expect(httpsGet).not.toHaveBeenCalled() // no debe consultar ipwho.is
  })

  it('uses request.geo when Vercel headers are absent', async () => {
    const req = new Request('https://example.com') as unknown as Request & { geo: unknown }
    ;(req as unknown as { geo: unknown }).geo = { latitude: '4.6', longitude: '-74.1', city: 'Bogotá', country: 'CO' }
    const g = await resolveGeo(req)
    expect(g?.latitude).toBeCloseTo(4.6)
    expect(g?.city).toBe('Bogotá')
  })

  it('falls back to ipwho.is when no platform geo is available', async () => {
    primeHttps({ success: true, latitude: 6.24, longitude: -75.58, city: 'Medellín', country: 'CO' })
    const req = new Request('https://example.com')
    const g = await resolveGeo(req)
    expect(g?.city).toBe('Medellín')
  })

  it('ignores a loopback x-forwarded-for and queries ipwho.is without an IP', async () => {
    primeHttps({ success: true, latitude: -27.47, longitude: 153.02, city: 'Brisbane', country: 'AU' })
    const req = new Request('https://example.com', { headers: { 'x-forwarded-for': '::1' } })
    const g = await resolveGeo(req)
    // No debe consultar ipwho.is/::1 (rango reservado), sino la URL sin IP.
    const calledUrl = String(httpsGet.mock.calls[0][0])
    expect(calledUrl).toBe('https://ipwho.is/?fields=success,latitude,longitude,city,country')
    expect(g?.city).toBe('Brisbane')
  })
})
