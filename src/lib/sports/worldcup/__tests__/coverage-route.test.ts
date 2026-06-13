// Tests for GET /api/sports/worldcup/coverage
// Strategy: mock fetchApiFootball and worldcupCache at the module boundary
// so the route logic is tested in isolation from the actual HTTP client.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiFootballError } from '../errors'

// --- Module mocks (hoisted before imports) ---

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

// Import after mocks are registered
import { GET } from '@/app/api/sports/worldcup/coverage/route'
import { fetchApiFootball } from '../api-football-client'
import { worldcupCache } from '../cache'

const MOCK_API_RESPONSE = {
  errors: {},
  results: 1,
  response: [
    {
      league: { id: 1, name: 'World Cup', logo: 'https://example.com/wc.png' },
      country: { name: 'World' },
      seasons: [
        {
          year: 2026,
          current: true,
          coverage: {
            fixtures: { events: true, lineups: true, statistics_fixtures: false, statistics_players: false },
            standings: true,
            players: true,
            top_scorers: true,
            top_assists: true,
            top_cards: true,
            injuries: false,
            predictions: true,
            odds: false,
          },
        },
      ],
    },
  ],
}

describe('GET /api/sports/worldcup/coverage', () => {
  beforeEach(() => {
    vi.mocked(worldcupCache).get.mockReturnValue(null)
    ;(worldcupCache as unknown as { _reset: () => void })._reset?.()
  })

  it('returns cached data without calling upstream when cache is warm', async () => {
    const cachedPayload = {
      league: { id: 1, name: 'World Cup', logo: 'https://example.com/wc.png' },
      season: 2026,
      coverage: MOCK_API_RESPONSE.response[0]!.seasons[0]!.coverage,
      cachedAt: '2026-01-01T00:00:00.000Z',
    }
    vi.mocked(worldcupCache.get).mockReturnValue(cachedPayload)

    const res = await GET()
    const body = await res.json()

    expect(fetchApiFootball).not.toHaveBeenCalled()
    expect(body.season).toBe(2026)
    expect(body.cachedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('fetches upstream and returns 200 on cache miss', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_API_RESPONSE)

    const res = await GET()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.league.id).toBe(1)
    expect(body.season).toBe(2026)
    expect(body.coverage.standings).toBe(true)
    expect(typeof body.cachedAt).toBe('string')
  })

  it('returns 502 on UPSTREAM_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('UPSTREAM_ERROR', 'Plan limit reached')
    )
    const res = await GET()
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error.code).toBe('UPSTREAM_ERROR')
  })

  it('returns 504 on TIMEOUT', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('TIMEOUT', 'Request timed out')
    )
    const res = await GET()
    expect(res.status).toBe(504)
    const body = await res.json()
    expect(body.error.code).toBe('TIMEOUT')
  })

  it('returns 500 on VALIDATION_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('VALIDATION_ERROR', 'Schema mismatch')
    )
    const res = await GET()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 on EMPTY_RESPONSE', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('EMPTY_RESPONSE', 'No results')
    )
    const res = await GET()
    expect(res.status).toBe(500)
  })

  it('returns 500 on unexpected (non-ApiFootballError) exceptions', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(new Error('network blip'))
    const res = await GET()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error.code).toBe('INTERNAL_ERROR')
  })
})
