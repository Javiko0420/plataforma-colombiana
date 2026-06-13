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

import { GET } from '@/app/api/sports/worldcup/fixtures/[id]/route'
import { fetchApiFootball } from '../api-football-client'
import { worldcupCache } from '../cache'

// ─── Mock helpers ─────────────────────────────────────────────────────────────

const BASE_FIXTURE = {
  fixture: {
    id: 1001,
    date: '2026-06-11T18:00:00+00:00',
    timestamp: 1749650400,
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    venue: { id: 550, name: 'SoFi Stadium', city: 'Los Angeles' },
  },
  league: { id: 1, name: 'World Cup', round: 'Group Stage - 1' },
  teams: {
    home: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png', winner: null },
    away: { id: 24, name: 'Croatia', logo: 'https://example.com/cro.png', winner: null },
  },
  goals: { home: null, away: null },
  events: [],
  lineups: [],
  statistics: [],
}

const LIVE_FIXTURE = {
  ...BASE_FIXTURE,
  fixture: {
    ...BASE_FIXTURE.fixture,
    status: { long: 'Second Half', short: '2H', elapsed: 70 },
  },
  goals: { home: 1, away: 0 },
}

const FINISHED_FIXTURE = {
  ...BASE_FIXTURE,
  fixture: {
    ...BASE_FIXTURE.fixture,
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
  },
  goals: { home: 2, away: 1 },
}

const FIXTURE_WITH_DATA = {
  ...LIVE_FIXTURE,
  events: [
    {
      time: { elapsed: 45, extra: null },
      team: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png' },
      player: { id: 12345, name: 'Ziyech' },
      assist: { id: null, name: null },
      type: 'Goal',
      detail: 'Normal Goal',
    },
    {
      time: { elapsed: 70, extra: 2 },
      team: { id: 24, name: 'Croatia', logo: 'https://example.com/cro.png' },
      player: { id: null, name: 'Own Goal' },
      assist: { id: null, name: null },
      type: 'Goal',
      detail: 'Own Goal',
    },
  ],
  lineups: [
    {
      team: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png', colors: {} },
      formation: '4-3-3',
      startXI: [
        { player: { id: 1, name: 'Bounou', number: 1, pos: 'G', grid: '1:1' } },
      ],
      substitutes: [
        { player: { id: 2, name: 'El Kaabi', number: 9, pos: 'F', grid: null } },
      ],
      coach: { id: 10, name: 'Regragui', photo: 'https://example.com/coach.png' },
    },
  ],
  statistics: [
    {
      team: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png' },
      statistics: [
        { type: 'Shots on Goal', value: 5 },
        { type: 'Ball Possession', value: '55%' },
        { type: 'Fouls', value: null },
      ],
    },
  ],
}

function makeEnvelope(fixtures: unknown[]) {
  return { errors: {}, results: fixtures.length, response: fixtures }
}

function makeRequest(id: string) {
  return new Request(`http://localhost/api/sports/worldcup/fixtures/${id}`)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/sports/worldcup/fixtures/[id]', () => {
  beforeEach(() => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    ;(worldcupCache as unknown as { _reset: () => void })._reset?.()
    vi.mocked(fetchApiFootball).mockReset()
  })

  // ── 400 — param validation ─────────────────────────────────────────────────

  it('returns 400 for a non-numeric id', async () => {
    const res = await GET(
      makeRequest('abc') as unknown as import('next/server').NextRequest,
      { params: Promise.resolve({ id: 'abc' }) }
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for a negative id', async () => {
    const res = await GET(
      makeRequest('-5') as unknown as import('next/server').NextRequest,
      { params: Promise.resolve({ id: '-5' }) }
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for id=0', async () => {
    const res = await GET(
      makeRequest('0') as unknown as import('next/server').NextRequest,
      { params: Promise.resolve({ id: '0' }) }
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for a decimal id', async () => {
    const res = await GET(
      makeRequest('1.5') as unknown as import('next/server').NextRequest,
      { params: Promise.resolve({ id: '1.5' }) }
    )
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  // ── 200 — happy path ───────────────────────────────────────────────────────

  const validParams = { params: Promise.resolve({ id: '1001' }) }
  const validReq = makeRequest('1001') as unknown as import('next/server').NextRequest

  it('returns 200 with fixture, events, lineups, statistics and cachedAt', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([FIXTURE_WITH_DATA]))

    const res = await GET(validReq, validParams)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.fixture.id).toBe(1001)
    expect(body.events).toHaveLength(2)
    expect(body.lineups).toHaveLength(1)
    expect(body.statistics).toHaveLength(1)
    expect(typeof body.cachedAt).toBe('string')
  })

  it('returns 200 with empty arrays when fixture exists but has no events/lineups/statistics (NS)', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([BASE_FIXTURE]))

    const res = await GET(validReq, validParams)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.events).toEqual([])
    expect(body.lineups).toEqual([])
    expect(body.statistics).toEqual([])
  })

  // ── Mapping ────────────────────────────────────────────────────────────────

  it('flattens fixture correctly (round promoted, league not exposed)', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([BASE_FIXTURE]))

    const body = await (await GET(validReq, validParams)).json()
    expect(body.fixture.round).toBe('Group Stage - 1')
    expect(body.fixture.league).toBeUndefined()
    expect(body.fixture.id).toBe(1001)
    expect(body.fixture.status.short).toBe('NS')
  })

  it('maps events correctly — drops logo, keeps player.id null for own goal', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([FIXTURE_WITH_DATA]))

    const body = await (await GET(validReq, validParams)).json()
    const ownGoal = body.events.find((e: { detail: string }) => e.detail === 'Own Goal')
    expect(ownGoal.player.id).toBeNull()
    expect(ownGoal.time).toEqual({ elapsed: 70, extra: 2 })
    // Raw `team.logo` must not appear in the event output
    expect(ownGoal.team.logo).toBeUndefined()
  })

  it('maps lineups correctly — drops grid and coach.photo, defaults null number to 0', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([FIXTURE_WITH_DATA]))

    const body = await (await GET(validReq, validParams)).json()
    const lineup = body.lineups[0]
    expect(lineup.formation).toBe('4-3-3')
    expect(lineup.startXI[0].player.grid).toBeUndefined()
    expect(lineup.coach.photo).toBeUndefined()
    expect(lineup.team.logo).toBeUndefined()
  })

  it('maps statistics correctly — drops team.logo, preserves null and string values', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([FIXTURE_WITH_DATA]))

    const body = await (await GET(validReq, validParams)).json()
    const stats = body.statistics[0]
    expect(stats.team.logo).toBeUndefined()
    const fouls = stats.statistics.find((s: { type: string }) => s.type === 'Fouls')
    expect(fouls.value).toBeNull()
    const possession = stats.statistics.find((s: { type: string }) => s.type === 'Ball Possession')
    expect(possession.value).toBe('55%')
  })

  // ── Dynamic TTL ────────────────────────────────────────────────────────────

  it('caches with LIVE_TTL_ACTIVE_S (15s) when status is 2H', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([LIVE_FIXTURE]))

    await GET(validReq, validParams)
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:fixture:1001',
      expect.anything(),
      15
    )
  })

  it('caches with LIVE_TTL_IDLE_S (300s) when status is FT', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([FINISHED_FIXTURE]))

    await GET(validReq, validParams)
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:fixture:1001',
      expect.anything(),
      300
    )
  })

  it('caches with LIVE_TTL_IDLE_S (300s) when status is NS', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([BASE_FIXTURE]))

    await GET(validReq, validParams)
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:fixture:1001',
      expect.anything(),
      300
    )
  })

  it.each(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'])(
    'caches with 15s for live status "%s"',
    async (short) => {
      const liveFixture = {
        ...BASE_FIXTURE,
        fixture: { ...BASE_FIXTURE.fixture, status: { long: 'Live', short, elapsed: 50 } },
      }
      vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([liveFixture]))

      await GET(validReq, validParams)
      expect(worldcupCache.set).toHaveBeenCalledWith(
        'worldcup:fixture:1001',
        expect.anything(),
        15
      )
      vi.mocked(fetchApiFootball).mockReset()
      ;(worldcupCache as unknown as { _reset: () => void })._reset?.()
      vi.mocked(worldcupCache.get).mockReturnValue(null)
    }
  )

  // ── Cache ──────────────────────────────────────────────────────────────────

  it('returns cached data without calling upstream when cache is warm', async () => {
    const cachedPayload = {
      fixture: { id: 1001, round: 'Group Stage - 1' },
      events: [],
      lineups: [],
      statistics: [],
      cachedAt: '2026-06-11T18:00:00.000Z',
    }
    vi.mocked(worldcupCache.get).mockReturnValue(cachedPayload)

    const res = await GET(validReq, validParams)
    expect(fetchApiFootball).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.cachedAt).toBe('2026-06-11T18:00:00.000Z')
  })

  it('uses cache key worldcup:fixture:{id}', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([BASE_FIXTURE]))

    await GET(validReq, validParams)
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:fixture:1001',
      expect.anything(),
      expect.any(Number)
    )
  })

  // ── 404 — fixture not found ────────────────────────────────────────────────

  it('returns 404 NOT_FOUND when upstream returns empty response (fixture does not exist)', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('EMPTY_RESPONSE', 'API-Football returned no results for fixtures')
    )

    const res = await GET(validReq, validParams)
    expect(res.status).toBe(404)
    expect((await res.json()).error.code).toBe('NOT_FOUND')
  })

  // ── Error handling ─────────────────────────────────────────────────────────

  it('returns 502 on UPSTREAM_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('UPSTREAM_ERROR', 'Plan limit reached')
    )

    const res = await GET(validReq, validParams)
    expect(res.status).toBe(502)
    expect((await res.json()).error.code).toBe('UPSTREAM_ERROR')
  })

  it('returns 504 on TIMEOUT', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('TIMEOUT', 'Request timed out after 8s')
    )

    const res = await GET(validReq, validParams)
    expect(res.status).toBe(504)
    expect((await res.json()).error.code).toBe('TIMEOUT')
  })

  it('returns 500 on VALIDATION_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('VALIDATION_ERROR', 'Schema mismatch')
    )

    const res = await GET(validReq, validParams)
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 on unexpected non-ApiFootballError exception', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(new Error('network blip'))

    const res = await GET(validReq, validParams)
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })
})
