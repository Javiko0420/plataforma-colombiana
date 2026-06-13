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

import { GET } from '@/app/api/sports/worldcup/live/route'
import { fetchApiFootball } from '../api-football-client'
import { worldcupCache } from '../cache'

// ─── Mock fixtures ────────────────────────────────────────────────────────────

const makeRawFixture = (leagueId: number, fixtureId: number) => ({
  fixture: {
    id: fixtureId,
    date: '2026-06-11T18:00:00+00:00',
    timestamp: 1749650400,
    status: { long: 'Second Half', short: '2H', elapsed: 70 },
    venue: { id: 550, name: 'SoFi Stadium', city: 'Los Angeles' },
  },
  league: { id: leagueId, name: leagueId === 1 ? 'World Cup' : 'Champions League', round: 'Group Stage - 1' },
  teams: {
    home: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png', winner: null },
    away: { id: 24, name: 'Croatia', logo: 'https://example.com/cro.png', winner: null },
  },
  goals: { home: 1, away: 0 },
})

const WC_FIXTURE_1 = makeRawFixture(1, 1001)
const WC_FIXTURE_2 = makeRawFixture(1, 1002)
const UCL_FIXTURE = makeRawFixture(2, 9001) // Champions League — must be filtered out

const mockEnvelope = (fixtures: unknown[]) => ({
  errors: {},
  results: fixtures.length,
  response: fixtures,
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/sports/worldcup/live', () => {
  beforeEach(() => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    ;(worldcupCache as unknown as { _reset: () => void })._reset?.()
    vi.mocked(fetchApiFootball).mockReset()
  })

  // ── 200 — happy path ───────────────────────────────────────────────────────

  it('returns 200 with WC fixtures and hasLive: true when matches are live', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(mockEnvelope([WC_FIXTURE_1, WC_FIXTURE_2]))

    const res = await GET()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.fixtures).toHaveLength(2)
    expect(body.hasLive).toBe(true)
    expect(typeof body.cachedAt).toBe('string')
  })

  it('returns hasLive: false and fixtures: [] when no WC matches are live', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(mockEnvelope([]))

    const body = await (await GET()).json()
    expect(body.fixtures).toEqual([])
    expect(body.hasLive).toBe(false)
  })

  // ── Filtering by league.id ─────────────────────────────────────────────────

  it('filters out fixtures from other leagues (only league.id === 1 passes)', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(mockEnvelope([UCL_FIXTURE]))

    const body = await (await GET()).json()
    expect(body.fixtures).toEqual([])
    expect(body.hasLive).toBe(false)
  })

  it('keeps only WC fixtures when response mixes WC and non-WC leagues', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(
      mockEnvelope([WC_FIXTURE_1, UCL_FIXTURE, WC_FIXTURE_2])
    )

    const body = await (await GET()).json()
    expect(body.fixtures).toHaveLength(2)
    expect(body.fixtures.every((f: { id: number }) => [1001, 1002].includes(f.id))).toBe(true)
    expect(body.hasLive).toBe(true)
  })

  it('reports hasLive: false even when non-WC leagues have live matches', async () => {
    // UCL is live but WC has nothing → hasLive must be false
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(mockEnvelope([UCL_FIXTURE]))

    const body = await (await GET()).json()
    expect(body.hasLive).toBe(false)
  })

  // ── Mapping ────────────────────────────────────────────────────────────────

  it('maps raw fixture to the flat WorldCupFixture shape', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(mockEnvelope([WC_FIXTURE_1]))

    const body = await (await GET()).json()
    const fixture = body.fixtures[0]
    expect(fixture.id).toBe(1001)
    expect(fixture.round).toBe('Group Stage - 1')
    expect(fixture.status.short).toBe('2H')
    expect(fixture.goals).toEqual({ home: 1, away: 0 })
    // league.id and league.name must NOT be in the output (already flattened)
    expect(fixture.league).toBeUndefined()
  })

  // ── Dynamic TTL via cache.set ──────────────────────────────────────────────

  it('caches with LIVE_TTL_ACTIVE_S (15s) when hasLive is true', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(mockEnvelope([WC_FIXTURE_1]))

    await GET()
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:live',
      expect.objectContaining({ hasLive: true }),
      15 // LIVE_TTL_ACTIVE_S
    )
  })

  it('caches with LIVE_TTL_IDLE_S (300s) when hasLive is false', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(mockEnvelope([]))

    await GET()
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:live',
      expect.objectContaining({ hasLive: false }),
      300 // LIVE_TTL_IDLE_S
    )
  })

  it('caches with idle TTL (300s) when live response has only non-WC fixtures', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(mockEnvelope([UCL_FIXTURE]))

    await GET()
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:live',
      expect.objectContaining({ hasLive: false }),
      300
    )
  })

  // ── Cache ──────────────────────────────────────────────────────────────────

  it('returns cached data without calling upstream when cache is warm', async () => {
    const cached = {
      fixtures: [{ id: 1001 }],
      hasLive: true,
      cachedAt: '2026-06-11T18:30:00.000Z',
    }
    vi.mocked(worldcupCache.get).mockReturnValue(cached)

    const res = await GET()
    expect(fetchApiFootball).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.cachedAt).toBe('2026-06-11T18:30:00.000Z')
    expect(body.hasLive).toBe(true)
  })

  it('makes exactly one upstream call on cache miss', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(mockEnvelope([WC_FIXTURE_1]))

    await GET()
    expect(fetchApiFootball).toHaveBeenCalledTimes(1)
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures',
      { live: 'all' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  // ── Error handling ─────────────────────────────────────────────────────────

  it('returns 502 on UPSTREAM_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('UPSTREAM_ERROR', 'Plan limit reached')
    )

    const res = await GET()
    expect(res.status).toBe(502)
    expect((await res.json()).error.code).toBe('UPSTREAM_ERROR')
  })

  it('returns 504 on TIMEOUT', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('TIMEOUT', 'Request timed out after 8s')
    )

    const res = await GET()
    expect(res.status).toBe(504)
    expect((await res.json()).error.code).toBe('TIMEOUT')
  })

  it('returns 500 on VALIDATION_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('VALIDATION_ERROR', 'Schema mismatch')
    )

    const res = await GET()
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 on unexpected non-ApiFootballError exception', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(new Error('network blip'))

    const res = await GET()
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })
})
