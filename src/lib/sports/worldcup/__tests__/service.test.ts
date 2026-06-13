import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiFootballError } from '../errors'
import { TTL } from '../constants'

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

import { fetchApiFootball } from '../api-football-client'
import { worldcupCache } from '../cache'
import {
  getWorldcupFixtures,
  getWorldcupStandings,
  getWorldcupTeams,
  getWorldcupLive,
} from '../service'

// ─── Shared mock data ──────────────────────────────────────────────────────────

const makeRawFixture = (leagueId = 1, leagueName = 'World Cup') => ({
  fixture: {
    id: 101,
    date: '2026-06-15T18:00:00+00:00',
    timestamp: 1750010400,
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    venue: { id: 550, name: 'SoFi Stadium', city: 'Los Angeles' },
  },
  league: { id: leagueId, name: leagueName, round: 'Group Stage - 1' },
  teams: {
    home: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png', winner: null },
    away: { id: 24, name: 'Croatia', logo: 'https://example.com/cro.png', winner: null },
  },
  goals: { home: null, away: null },
})

const makeRawTeam = () => ({
  team: {
    id: 6,
    name: 'Morocco',
    code: 'MAR',
    country: 'Morocco',
    founded: 1955,
    national: true,
    logo: 'https://example.com/mar.png',
  },
  venue: {
    id: null,
    name: null,
    address: null,
    city: null,
    capacity: null,
    surface: null,
    image: null,
  },
})

const makeRawStandingsEntry = (rank: number, teamId: number, teamName: string) => ({
  rank,
  team: { id: teamId, name: teamName, logo: 'https://example.com/logo.png' },
  points: 0,
  goalsDiff: 0,
  group: 'Group A',
  form: null,
  status: 'same',
  description: null,
  all: { played: 0, win: 0, draw: 0, lose: 0, goals: { for: 0, against: 0 } },
})

function makeFixturesEnvelope(fixtures: unknown[]) {
  return { errors: {}, results: fixtures.length, response: fixtures }
}

// standings shape: Array<Array<RawStandingsEntry>> — one inner array per group
function makeStandingsEnvelope(groups: unknown[][]) {
  return { errors: {}, results: 1, response: [{ league: { id: 1, name: 'World Cup', season: 2026, standings: groups } }] }
}

function makeTeamsEnvelope(teams: unknown[]) {
  return { errors: {}, results: teams.length, response: teams }
}

// ─── getWorldcupFixtures ──────────────────────────────────────────────────────

describe('getWorldcupFixtures', () => {
  beforeEach(() => {
    ;(worldcupCache as unknown as { _reset: () => void })._reset()
    vi.mocked(fetchApiFootball).mockReset()
  })

  it('returns cached data without calling upstream on cache hit', async () => {
    const payload = { fixtures: [], cachedAt: '2026-06-01T00:00:00.000Z' }
    vi.mocked(worldcupCache.get).mockReturnValue(payload)

    const result = await getWorldcupFixtures()

    expect(fetchApiFootball).not.toHaveBeenCalled()
    expect(result).toBe(payload)
  })

  it('calls upstream with league+season and caches result on cache miss (no params)', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeFixturesEnvelope([makeRawFixture()]))

    const result = await getWorldcupFixtures()

    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures',
      { league: '1', season: '2026' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
    expect(result.fixtures).toHaveLength(1)
    expect(result.fixtures[0]!.id).toBe(101)
    expect(typeof result.cachedAt).toBe('string')
  })

  it('uses cache key worldcup:fixtures:none:none:none when called with no params', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeFixturesEnvelope([]))

    await getWorldcupFixtures()

    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:fixtures:none:none:none',
      expect.objectContaining({ fixtures: [] }),
      TTL.FIXTURES_DAILY_S
    )
  })

  it('includes round/team/date in cache key and upstream params when provided', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeFixturesEnvelope([]))

    await getWorldcupFixtures({ round: 'Group Stage - 1', team: 6, date: '2026-06-15' })

    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures',
      { league: '1', season: '2026', round: 'Group Stage - 1', team: '6', date: '2026-06-15' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:fixtures:Group Stage - 1:6:2026-06-15',
      expect.anything(),
      TTL.FIXTURES_DAILY_S
    )
  })

  it('returns empty fixtures without error when response is empty', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeFixturesEnvelope([]))

    const result = await getWorldcupFixtures()

    expect(result.fixtures).toEqual([])
  })

  it('propagates ApiFootballError from upstream', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('TIMEOUT', 'Request timed out after 8s')
    )

    await expect(getWorldcupFixtures()).rejects.toThrow(ApiFootballError)
  })

  it('propagates unexpected errors from upstream', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(new Error('network blip'))

    await expect(getWorldcupFixtures()).rejects.toThrow('network blip')
  })
})

// ─── getWorldcupStandings ─────────────────────────────────────────────────────

describe('getWorldcupStandings', () => {
  beforeEach(() => {
    ;(worldcupCache as unknown as { _reset: () => void })._reset()
    vi.mocked(fetchApiFootball).mockReset()
  })

  it('returns cached data without calling upstream on cache hit', async () => {
    const payload = { groups: [], cachedAt: '2026-06-01T00:00:00.000Z' }
    vi.mocked(worldcupCache.get).mockReturnValue(payload)

    const result = await getWorldcupStandings()

    expect(fetchApiFootball).not.toHaveBeenCalled()
    expect(result).toBe(payload)
  })

  it('calls upstream and maps standings groups on cache miss', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    const groupA = [
      makeRawStandingsEntry(1, 6, 'Morocco'),
      makeRawStandingsEntry(2, 24, 'Croatia'),
    ]
    // standings shape: Array<Array<RawStandingsEntry>> — one array per group
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeStandingsEnvelope([groupA]))

    const result = await getWorldcupStandings()

    expect(fetchApiFootball).toHaveBeenCalledWith(
      'standings',
      { league: '1', season: '2026' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
    expect(result.groups).toHaveLength(1)
    expect(result.groups[0]!.group).toBe('Group A')
    expect(result.groups[0]!.standings).toHaveLength(2)
  })

  it('maps group entry fields correctly', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    const entry = {
      ...makeRawStandingsEntry(1, 6, 'Morocco'),
      points: 9,
      goalsDiff: 5,
      all: { played: 3, win: 3, draw: 0, lose: 0, goals: { for: 8, against: 3 } },
      form: 'WWW',
    }
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeStandingsEnvelope([[entry]]))

    const result = await getWorldcupStandings()
    const row = result.groups[0]!.standings[0]!

    expect(row.points).toBe(9)
    expect(row.played).toBe(3)
    expect(row.win).toBe(3)
    expect(row.draw).toBe(0)
    expect(row.lose).toBe(0)
    expect(row.goalsFor).toBe(8)
    expect(row.goalsAgainst).toBe(3)
    expect(row.goalsDiff).toBe(5)
    expect(row.form).toBe('WWW')
  })

  it('returns empty groups when standings are not yet available', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce({
      errors: {},
      results: 1,
      response: [{ league: { id: 1, name: 'World Cup', season: 2026 } }],
    })

    const result = await getWorldcupStandings()

    expect(result.groups).toEqual([])
  })

  it('stores payload with STANDINGS_S TTL', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeStandingsEnvelope([]))

    await getWorldcupStandings()

    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:standings',
      expect.objectContaining({ groups: [] }),
      TTL.STANDINGS_S
    )
  })

  it('propagates ApiFootballError from upstream', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('UPSTREAM_ERROR', 'Plan limit')
    )

    await expect(getWorldcupStandings()).rejects.toThrow(ApiFootballError)
  })
})

// ─── getWorldcupTeams ─────────────────────────────────────────────────────────

describe('getWorldcupTeams', () => {
  beforeEach(() => {
    ;(worldcupCache as unknown as { _reset: () => void })._reset()
    vi.mocked(fetchApiFootball).mockReset()
  })

  it('returns cached data without calling upstream on cache hit', async () => {
    const payload = { teams: [], cachedAt: '2026-06-01T00:00:00.000Z' }
    vi.mocked(worldcupCache.get).mockReturnValue(payload)

    const result = await getWorldcupTeams()

    expect(fetchApiFootball).not.toHaveBeenCalled()
    expect(result).toBe(payload)
  })

  it('calls upstream and maps teams on cache miss', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeTeamsEnvelope([makeRawTeam()]))

    const result = await getWorldcupTeams()

    expect(fetchApiFootball).toHaveBeenCalledWith(
      'teams',
      { league: '1', season: '2026' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
    expect(result.teams).toHaveLength(1)
    expect(result.teams[0]!.id).toBe(6)
    expect(result.teams[0]!.name).toBe('Morocco')
    // Drops founded, national, address, capacity, surface, image
    expect(result.teams[0]).not.toHaveProperty('founded')
    expect(result.teams[0]).not.toHaveProperty('national')
  })

  it('stores payload with TEAMS_TTL_S TTL', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeTeamsEnvelope([]))

    await getWorldcupTeams()

    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:teams',
      expect.objectContaining({ teams: [] }),
      TTL.TEAMS_TTL_S
    )
  })

  it('propagates ApiFootballError from upstream', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('MISSING_API_KEY', 'API key not configured')
    )

    await expect(getWorldcupTeams()).rejects.toThrow(ApiFootballError)
  })
})

// ─── getWorldcupLive ──────────────────────────────────────────────────────────

describe('getWorldcupLive', () => {
  beforeEach(() => {
    ;(worldcupCache as unknown as { _reset: () => void })._reset()
    vi.mocked(fetchApiFootball).mockReset()
  })

  it('returns cached data without calling upstream on cache hit', async () => {
    const payload = { fixtures: [], hasLive: false, cachedAt: '2026-06-01T00:00:00.000Z' }
    vi.mocked(worldcupCache.get).mockReturnValue(payload)

    const result = await getWorldcupLive()

    expect(fetchApiFootball).not.toHaveBeenCalled()
    expect(result).toBe(payload)
  })

  it('calls upstream with live=all and filters to World Cup fixtures', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    const wcFixture = makeRawFixture(1, 'World Cup')
    const otherFixture = makeRawFixture(2, 'Premier League')
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(
      makeFixturesEnvelope([wcFixture, otherFixture])
    )

    const result = await getWorldcupLive()

    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures',
      { live: 'all' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
    expect(result.fixtures).toHaveLength(1)
    expect(result.hasLive).toBe(true)
  })

  it('sets hasLive=false and TTL_IDLE when no WC fixtures are live', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(makeFixturesEnvelope([]))

    const result = await getWorldcupLive()

    expect(result.hasLive).toBe(false)
    expect(result.fixtures).toHaveLength(0)
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:live',
      expect.objectContaining({ hasLive: false }),
      TTL.LIVE_TTL_IDLE_S
    )
  })

  it('sets hasLive=true and TTL_ACTIVE when WC fixtures are live', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(
      makeFixturesEnvelope([makeRawFixture(1, 'World Cup')])
    )

    const result = await getWorldcupLive()

    expect(result.hasLive).toBe(true)
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:live',
      expect.objectContaining({ hasLive: true }),
      TTL.LIVE_TTL_ACTIVE_S
    )
  })

  it('excludes non-World Cup fixtures from output even if WC fixtures are present', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockResolvedValueOnce(
      makeFixturesEnvelope([
        makeRawFixture(1, 'World Cup'),
        makeRawFixture(140, 'LaLiga'),
        makeRawFixture(2, 'Champions League'),
      ])
    )

    const result = await getWorldcupLive()

    expect(result.fixtures).toHaveLength(1)
  })

  it('propagates ApiFootballError from upstream', async () => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    vi.mocked(fetchApiFootball).mockRejectedValueOnce(
      new ApiFootballError('TIMEOUT', 'Request timed out after 8s')
    )

    await expect(getWorldcupLive()).rejects.toThrow(ApiFootballError)
  })
})
