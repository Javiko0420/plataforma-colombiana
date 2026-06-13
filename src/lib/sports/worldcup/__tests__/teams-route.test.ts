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

import { GET } from '@/app/api/sports/worldcup/teams/route'
import { fetchApiFootball } from '../api-football-client'
import { worldcupCache } from '../cache'

// ─── Mock data ────────────────────────────────────────────────────────────────

const makeRawTeam = (id: number, name: string, code: string | null = 'TST') => ({
  team: {
    id,
    name,
    code,
    country: name,
    founded: 1960,
    national: true,
    logo: `https://example.com/${id}.png`,
  },
  venue: {
    id: 100 + id,
    name: `Stadium ${id}`,
    address: '123 Main St',
    city: `City ${id}`,
    capacity: 50000,
    surface: 'grass',
    image: `https://example.com/venue-${id}.png`,
  },
})

const MOROCCO = makeRawTeam(6, 'Morocco', 'MAR')
const CROATIA = makeRawTeam(24, 'Croatia', 'CRO')
const NO_CODE_TEAM = makeRawTeam(99, 'NoCode', null)

function makeEnvelope(teams: unknown[]) {
  return { errors: {}, results: teams.length, response: teams }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/sports/worldcup/teams', () => {
  beforeEach(() => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    ;(worldcupCache as unknown as { _reset: () => void })._reset?.()
    vi.mocked(fetchApiFootball).mockReset()
  })

  // ── 200 — normal response ──────────────────────────────────────────────────

  it('returns 200 with mapped teams on cache miss', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([MOROCCO, CROATIA]))

    const res = await GET()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.teams).toHaveLength(2)
    expect(typeof body.cachedAt).toBe('string')
  })

  it('returns 200 with teams: [] when upstream returns empty array (pre-draw)', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([]))

    const res = await GET()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.teams).toEqual([])
    expect(typeof body.cachedAt).toBe('string')
  })

  // ── Mapping ────────────────────────────────────────────────────────────────

  it('maps id, name, code, country, logo correctly', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([MOROCCO]))

    const body = await (await GET()).json()
    const team = body.teams[0]
    expect(team.id).toBe(6)
    expect(team.name).toBe('Morocco')
    expect(team.code).toBe('MAR')
    expect(team.country).toBe('Morocco')
    expect(team.logo).toBe('https://example.com/6.png')
  })

  it('maps venue to id, name, city only — drops address/capacity/surface/image', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([MOROCCO]))

    const body = await (await GET()).json()
    const venue = body.teams[0].venue
    expect(venue.id).toBe(106)
    expect(venue.name).toBe('Stadium 6')
    expect(venue.city).toBe('City 6')
    expect(venue.address).toBeUndefined()
    expect(venue.capacity).toBeUndefined()
    expect(venue.surface).toBeUndefined()
    expect(venue.image).toBeUndefined()
  })

  it('drops founded and national from the output', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([MOROCCO]))

    const body = await (await GET()).json()
    const team = body.teams[0]
    expect(team.founded).toBeUndefined()
    expect(team.national).toBeUndefined()
  })

  it('preserves code = null for teams without a code', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([NO_CODE_TEAM]))

    const body = await (await GET()).json()
    expect(body.teams[0].code).toBeNull()
  })

  // ── Upstream call params ───────────────────────────────────────────────────

  it('calls upstream with league=1 and season=2026', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([MOROCCO]))

    await GET()
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'teams',
      { league: '1', season: '2026' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  it('makes exactly one upstream call on cache miss', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([MOROCCO]))

    await GET()
    expect(fetchApiFootball).toHaveBeenCalledTimes(1)
  })

  // ── Cache ──────────────────────────────────────────────────────────────────

  it('returns cached data without calling upstream when cache is warm', async () => {
    const cached = {
      teams: [{ id: 6, name: 'Morocco', code: 'MAR', country: 'Morocco', logo: '...', venue: {} }],
      cachedAt: '2026-06-01T00:00:00.000Z',
    }
    vi.mocked(worldcupCache.get).mockReturnValue(cached)

    const res = await GET()
    expect(fetchApiFootball).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.cachedAt).toBe('2026-06-01T00:00:00.000Z')
    expect(body.teams).toHaveLength(1)
  })

  it('stores payload in cache with TEAMS_TTL_S (86400s) after a successful fetch', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([MOROCCO, CROATIA]))

    await GET()
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:teams',
      expect.objectContaining({ teams: expect.any(Array) }),
      86_400
    )
  })

  it('stores empty teams array in cache when upstream returns []', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeEnvelope([]))

    await GET()
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:teams',
      expect.objectContaining({ teams: [] }),
      86_400
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
