import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveGeo } from '@/lib/geo'

describe('resolveGeo', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('uses request.geo when available', async () => {
    const req = new Request('https://example.com') as unknown as Request & { geo: any }
    ;(req as any).geo = { latitude: '4.6', longitude: '-74.1', city: 'Bogotá', country: 'CO' }
    const g = await resolveGeo(req)
    expect(g?.latitude).toBeCloseTo(4.6)
    expect(g?.longitude).toBeCloseTo(-74.1)
  })

  it('falls back to ipwho.is when request.geo is missing', async () => {
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, latitude: 6.24, longitude: -75.58, city: 'Medellín', country: 'CO' })
    })
    const req = new Request('https://example.com')
    const g = await resolveGeo(req)
    expect(g?.city).toBe('Medellín')
  })
})


