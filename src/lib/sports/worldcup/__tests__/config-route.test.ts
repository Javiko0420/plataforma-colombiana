import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GET } from '@/app/api/sports/worldcup/config/route'

// The route reads process.env at request time, so we mutate it per test.
// `enabled` depends on the current instant, so we drive "now" with fake timers.

describe('GET /api/sports/worldcup/config', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    delete process.env.WORLDCUP_ENABLED
    delete process.env.WORLDCUP_SUNSET_AT
  })

  afterEach(() => {
    vi.useRealTimers()
    delete process.env.WORLDCUP_ENABLED
    delete process.env.WORLDCUP_SUNSET_AT
  })

  // ── Default sunset (2026-07-20 America/Bogota) ──────────────────────────────

  it('returns enabled:true before the default sunset (final day 19 Jul stays live)', async () => {
    vi.setSystemTime(new Date('2026-07-19T23:00:00-05:00'))

    const res = await GET()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.enabled).toBe(true)
    expect(typeof body.sunsetAt).toBe('string')
    expect(typeof body.cachedAt).toBe('string')
  })

  it('returns enabled:false at/after the default sunset (20 Jul 2026)', async () => {
    vi.setSystemTime(new Date('2026-07-20T00:00:01-05:00'))

    const body = await (await GET()).json()
    expect(body.enabled).toBe(false)
  })

  // ── Manual kill switch ──────────────────────────────────────────────────────

  it('returns enabled:false when WORLDCUP_ENABLED=false even before sunset', async () => {
    vi.setSystemTime(new Date('2026-07-01T00:00:00-05:00'))
    process.env.WORLDCUP_ENABLED = 'false'

    const body = await (await GET()).json()
    expect(body.enabled).toBe(false)
  })

  it('treats any non-"false" WORLDCUP_ENABLED as enabled', async () => {
    vi.setSystemTime(new Date('2026-07-01T00:00:00-05:00'))
    process.env.WORLDCUP_ENABLED = 'true'

    const body = await (await GET()).json()
    expect(body.enabled).toBe(true)
  })

  // ── Custom / invalid sunset override ────────────────────────────────────────

  it('respects a custom WORLDCUP_SUNSET_AT', async () => {
    vi.setSystemTime(new Date('2026-06-21T00:00:00-05:00'))
    process.env.WORLDCUP_SUNSET_AT = '2026-06-20T00:00:00-05:00' // already past

    const body = await (await GET()).json()
    expect(body.enabled).toBe(false)
    expect(body.sunsetAt).toBe(new Date('2026-06-20T00:00:00-05:00').toISOString())
  })

  it('falls back to the default sunset when WORLDCUP_SUNSET_AT is invalid', async () => {
    vi.setSystemTime(new Date('2026-07-19T00:00:00-05:00'))
    process.env.WORLDCUP_SUNSET_AT = 'not-a-date'

    const body = await (await GET()).json()
    expect(body.enabled).toBe(true)
    expect(body.sunsetAt).toBe(new Date('2026-07-20T00:00:00-05:00').toISOString())
  })

  // ── Caching ─────────────────────────────────────────────────────────────────

  it('sets Cache-Control: no-store', async () => {
    vi.setSystemTime(new Date('2026-07-01T00:00:00-05:00'))

    const res = await GET()
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})
