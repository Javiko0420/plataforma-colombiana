import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiFootballError } from '../errors'

vi.mock('../api-football-client', () => ({
  fetchApiFootball: vi.fn(),
}))

vi.mock('../cache', () => {
  let store: Record<string, unknown> = {}
  return {
    worldcupCache: {
      get: vi.fn((key: string) => store[key] ?? null),
      set: vi.fn((key: string, value: unknown) => { store[key] = value }),
      _reset: () => { store = {} },
    },
  }
})

import { GET } from '@/app/api/sports/worldcup/headtohead/route'
import { fetchApiFootball } from '../api-football-client'
import { worldcupCache } from '../cache'

// ─── Mock data ────────────────────────────────────────────────────────────────

const makeRawFixture = (fixtureId: number, leagueId: number, leagueName: string) => ({
  fixture: {
    id: fixtureId,
    date: '2023-06-11T18:00:00+00:00',
    timestamp: 1686506400,
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    venue: { id: 550, name: 'SoFi Stadium', city: 'Los Angeles' },
  },
  league: { id: leagueId, name: leagueName, round: 'Group Stage - 1' },
  teams: {
    home: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png', winner: true },
    away: { id: 24, name: 'Croatia', logo: 'https://example.com/cro.png', winner: false },
  },
  goals: { home: 2, away: 1 },
})

const WC_FIXTURE = makeRawFixture(1001, 1, 'World Cup')
const CL_FIXTURE = makeRawFixture(9001, 2, 'UEFA Champions League')

function makeEnvelope(fixtures: unknown[]) {
  return { errors: {}, results: fixtures.length, response: fixtures }
}

function makeRequest(search: string) {
  return new Request(`http://localhost/api/sports/worldcup/headtohead${search}`) as unknown as import('next/server').NextRequest
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/sports/worldcup/headtohead', () => {
  beforeEach(() => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    ;(worldcupCache as unknown as { _reset: () => void })._reset?.()
    vi.mocked(fetchApiFootball).mockReset()
  })

  // ── 400 — param validation ─────────────────────────────────────────────────

  it('returns 400 when teams param is absent', async () => {
    const res = await GET(makeRequest(''))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(body.error.message).toMatch(/missing/i)
  })

  it('returns 400 when teams param is a plain number (no hyphen)', async () => {
    const res = await GET(makeRequest('?teams=6'))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 when teams param contains non-numeric parts', async () => {
    const res = await GET(makeRequest('?teams=abc-9'))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for teams param with three segments', async () => {
    const res = await GET(makeRequest('?teams=6-9-24'))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for empty string teams param', async () => {
    const res = await GET(makeRequest('?teams='))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  // ── 200 — happy path ───────────────────────────────────────────────────────

  it('returns 200 with fixtures and cachedAt on cache miss', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([WC_FIXTURE, CL_FIXTURE]))

    const res = await GET(makeRequest('?teams=6-24'))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.fixtures).toHaveLength(2)
    expect(typeof body.cachedAt).toBe('string')
  })

  it('returns 200 with fixtures: [] when teams never played each other', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([]))

    const res = await GET(makeRequest('?teams=6-24'))
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.fixtures).toEqual([])
  })

  // ── league field in output ─────────────────────────────────────────────────

  it('includes league.id and league.name in each fixture output', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([WC_FIXTURE, CL_FIXTURE]))

    const body = await (await GET(makeRequest('?teams=6-24'))).json()
    const wcFx = body.fixtures.find((f: { league: { id: number } }) => f.league.id === 1)
    const clFx = body.fixtures.find((f: { league: { id: number } }) => f.league.id === 2)

    expect(wcFx.league).toEqual({ id: 1, name: 'World Cup' })
    expect(clFx.league).toEqual({ id: 2, name: 'UEFA Champions League' })
  })

  it('does NOT expose league.round at the league level (it is promoted to fixture.round)', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([WC_FIXTURE]))

    const body = await (await GET(makeRequest('?teams=6-24'))).json()
    const fixture = body.fixtures[0]
    expect(fixture.round).toBe('Group Stage - 1')
    expect(fixture.league.round).toBeUndefined()
  })

  // ── Normalization ──────────────────────────────────────────────────────────

  it('normalizes teams=6-24 and calls upstream with h2h=6-24', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([WC_FIXTURE]))

    await GET(makeRequest('?teams=6-24'))
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures/headtohead',
      { h2h: '6-24' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  it('normalizes teams=24-6 to 6-24 and calls upstream with h2h=6-24', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([WC_FIXTURE]))

    await GET(makeRequest('?teams=24-6'))
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures/headtohead',
      { h2h: '6-24' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  it('uses normalized cache key worldcup:headtohead:6-24 when called with teams=24-6', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([WC_FIXTURE]))

    await GET(makeRequest('?teams=24-6'))
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:headtohead:6-24',
      expect.anything(),
      expect.any(Number)
    )
  })

  it('a cache hit on key 6-24 is served even when the request uses teams=24-6', async () => {
    const cachedPayload = {
      fixtures: [{ id: 1001, league: { id: 1, name: 'World Cup' } }],
      cachedAt: '2026-06-01T00:00:00.000Z',
    }
    // Only return the cache hit for the normalized key
    vi.mocked(worldcupCache.get).mockImplementation((key: string) =>
      key === 'worldcup:headtohead:6-24' ? cachedPayload : null
    )

    const res = await GET(makeRequest('?teams=24-6'))
    expect(res.status).toBe(200)
    expect(fetchApiFootball).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.cachedAt).toBe('2026-06-01T00:00:00.000Z')
  })

  // ── Cache ──────────────────────────────────────────────────────────────────

  it('returns cached data without calling upstream when cache is warm', async () => {
    const cachedPayload = {
      fixtures: [{ id: 1001, league: { id: 1, name: 'World Cup' } }],
      cachedAt: '2026-06-01T00:00:00.000Z',
    }
    vi.mocked(worldcupCache.get).mockReturnValue(cachedPayload)

    const res = await GET(makeRequest('?teams=6-24'))
    expect(fetchApiFootball).not.toHaveBeenCalled()
    expect((await res.json()).cachedAt).toBe('2026-06-01T00:00:00.000Z')
  })

  it('stores payload with HEADTOHEAD_TTL_S (86400s)', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([WC_FIXTURE]))

    await GET(makeRequest('?teams=6-24'))
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:headtohead:6-24',
      expect.objectContaining({ fixtures: expect.any(Array) }),
      86_400
    )
  })

  // ── Error handling ─────────────────────────────────────────────────────────

  it('returns 502 on UPSTREAM_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('UPSTREAM_ERROR', 'Plan limit reached')
    )
    const res = await GET(makeRequest('?teams=6-24'))
    expect(res.status).toBe(502)
    expect((await res.json()).error.code).toBe('UPSTREAM_ERROR')
  })

  it('returns 504 on TIMEOUT', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('TIMEOUT', 'Request timed out after 8s')
    )
    const res = await GET(makeRequest('?teams=6-24'))
    expect(res.status).toBe(504)
    expect((await res.json()).error.code).toBe('TIMEOUT')
  })

  it('returns 500 on VALIDATION_ERROR from upstream', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('VALIDATION_ERROR', 'Schema mismatch')
    )
    const res = await GET(makeRequest('?teams=6-24'))
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 on unexpected non-ApiFootballError exception', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(new Error('network blip'))
    const res = await GET(makeRequest('?teams=6-24'))
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })
})
