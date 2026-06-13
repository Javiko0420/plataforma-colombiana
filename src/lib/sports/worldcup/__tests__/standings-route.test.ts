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

import { GET } from '@/app/api/sports/worldcup/standings/route'
import { fetchApiFootball } from '../api-football-client'
import { worldcupCache } from '../cache'

// ─── Shared fixture data ──────────────────────────────────────────────────────

const makeEntry = (rank: number, teamId: number, teamName: string, group: string, points: number) => ({
  rank,
  team: { id: teamId, name: teamName, logo: `https://example.com/${teamId}.png` },
  points,
  goalsDiff: points - 3,
  group,
  form: 'W'.repeat(Math.floor(points / 3)) || null,
  status: 'same',
  description: null,
  all: {
    played: 3,
    win: Math.floor(points / 3),
    draw: 0,
    lose: 3 - Math.floor(points / 3),
    goals: { for: points + 1, against: 2 },
  },
})

const GROUP_A_ENTRIES = [
  makeEntry(1, 6,  'Morocco',  'Group A', 9),
  makeEntry(2, 24, 'Croatia',  'Group A', 6),
  makeEntry(3, 15, 'Belgium',  'Group A', 3),
  makeEntry(4, 30, 'Canada',   'Group A', 0),
]

const GROUP_B_ENTRIES = [
  makeEntry(1, 1,  'Brazil',   'Group B', 7),
  makeEntry(2, 11, 'Argentina','Group B', 5),
]

const MOCK_ENVELOPE_TWO_GROUPS = {
  errors: {},
  results: 1,
  response: [
    {
      league: {
        id: 1,
        name: 'World Cup',
        season: 2026,
        standings: [GROUP_A_ENTRIES, GROUP_B_ENTRIES],
      },
    },
  ],
}

const MOCK_ENVELOPE_EMPTY_RESPONSE = {
  errors: {},
  results: 0,
  response: [],
}

const MOCK_ENVELOPE_EMPTY_STANDINGS = {
  errors: {},
  results: 1,
  response: [{ league: { id: 1, name: 'World Cup', season: 2026, standings: [] } }],
}

const MOCK_ENVELOPE_NO_STANDINGS_KEY = {
  errors: {},
  results: 1,
  response: [{ league: { id: 1, name: 'World Cup', season: 2026 } }],
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/sports/worldcup/standings', () => {
  beforeEach(() => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    ;(worldcupCache as unknown as { _reset: () => void })._reset?.()
    vi.mocked(fetchApiFootball).mockReset()
  })

  // ── 200 — normal response with multiple groups ─────────────────────────────

  it('returns 200 with correctly mapped groups on cache miss', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_TWO_GROUPS)
    const res = await GET()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.groups).toHaveLength(2)
    expect(body.groups[0].group).toBe('Group A')
    expect(body.groups[0].standings).toHaveLength(4)
    expect(body.groups[1].group).toBe('Group B')
    expect(typeof body.cachedAt).toBe('string')
  })

  it('maps goalsFor and goalsAgainst from all.goals.for/against', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_TWO_GROUPS)
    const res = await GET()
    const body = await res.json()

    const topTeam = body.groups[0].standings[0]
    expect(topTeam.goalsFor).toBe(GROUP_A_ENTRIES[0]!.all.goals.for)
    expect(topTeam.goalsAgainst).toBe(GROUP_A_ENTRIES[0]!.all.goals.against)
    // Verify status and description are NOT in the output
    expect(topTeam.status).toBeUndefined()
    expect(topTeam.description).toBeUndefined()
  })

  it('maps played/win/draw/lose from all.* to root level', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_TWO_GROUPS)
    const body = await (await GET()).json()

    const first = body.groups[0].standings[0]
    expect(first.played).toBe(3)
    expect(first.win).toBe(3)
    expect(first.draw).toBe(0)
    expect(first.lose).toBe(0)
  })

  it('preserves form (including null) in output', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_TWO_GROUPS)
    const body = await (await GET()).json()
    // Morocco: form = 'WWW' (3 wins)
    expect(body.groups[0].standings[0].form).toBe('WWW')
    // Canada: form = null (0 wins)
    expect(body.groups[0].standings[3].form).toBeNull()
  })

  // ── 200 — pre-tournament empty cases ──────────────────────────────────────

  it('returns 200 { groups: [] } when upstream response is [] (pre-tournament)', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_EMPTY_RESPONSE)
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.groups).toEqual([])
    expect(typeof body.cachedAt).toBe('string')
  })

  it('returns 200 { groups: [] } when standings: [] (tournament not yet started)', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_EMPTY_STANDINGS)
    const res = await GET()
    expect(res.status).toBe(200)
    expect((await res.json()).groups).toEqual([])
  })

  it('returns 200 { groups: [] } when standings key is absent in response', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_NO_STANDINGS_KEY)
    const res = await GET()
    expect(res.status).toBe(200)
    expect((await res.json()).groups).toEqual([])
  })

  // ── Cache ──────────────────────────────────────────────────────────────────

  it('returns cached data without calling upstream when cache is warm', async () => {
    const cached = {
      groups: [{ group: 'Group A', standings: [] }],
      cachedAt: '2026-06-12T00:00:00.000Z',
    }
    vi.mocked(worldcupCache.get).mockReturnValue(cached)

    const res = await GET()
    expect(fetchApiFootball).not.toHaveBeenCalled()
    const body = await res.json()
    expect(body.cachedAt).toBe('2026-06-12T00:00:00.000Z')
    expect(body.groups[0].group).toBe('Group A')
  })

  it('stores result in cache after a successful fetch', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_TWO_GROUPS)
    await GET()
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:standings',
      expect.objectContaining({ groups: expect.any(Array) }),
      expect.any(Number)
    )
  })

  // ── Upstream errors ────────────────────────────────────────────────────────

  it('returns 502 on UPSTREAM_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('UPSTREAM_ERROR', 'Plan limit reached')
    )
    const res = await GET()
    expect(res.status).toBe(502)
    expect((await res.json()).error.code).toBe('UPSTREAM_ERROR')
  })

  it('returns 504 on TIMEOUT', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('TIMEOUT', 'Request timed out')
    )
    const res = await GET()
    expect(res.status).toBe(504)
    expect((await res.json()).error.code).toBe('TIMEOUT')
  })

  it('returns 500 on VALIDATION_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('VALIDATION_ERROR', 'Schema mismatch')
    )
    const res = await GET()
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 on MISSING_API_KEY', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('MISSING_API_KEY', 'API key not configured')
    )
    const res = await GET()
    expect(res.status).toBe(500)
  })

  it('returns 500 on unexpected non-ApiFootballError exceptions', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(new Error('network blip'))
    const res = await GET()
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })
})
