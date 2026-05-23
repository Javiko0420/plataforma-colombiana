import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  fetchFixtures,
  fetchStandings,
  searchTeams,
  fetchTeamNextMatches,
  fetchTeamLastMatches,
  getDefaultSeason,
  resolveSeasonForLeague,
  getSeasonForLeague,
} from '@/lib/football'
import { LEAGUES } from '@/lib/leagues'

describe('football client (API-Football v3)', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    process.env.API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io'
    process.env.API_FOOTBALL_KEY = 'test-key'
    process.env.API_FOOTBALL_USE_RAPIDAPI = 'false'
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('parses fixtures response into simplified list', async () => {
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: [
          {
            fixture: { id: 123, date: '2025-01-01T20:00:00Z', status: { short: '1H', elapsed: 23 } },
            league: { id: 239, name: 'Liga BetPlay', country: 'Colombia' },
            teams: { home: { id: 1, name: 'Local' }, away: { id: 2, name: 'Visita' } },
            goals: { home: 1, away: 0 },
          },
        ],
      }),
    })

    const out = await fetchFixtures({ live: 'all', timezone: 'America/Bogota' })
    expect(out.length).toBe(1)
    expect(out[0].home.name).toBe('Local')
    expect(out[0].elapsed).toBe(23)
    expect(out[0].league.id).toBe(239)
  })

  it('sends x-apisports-key header by default', async () => {
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ response: [] }) })

    // Unique league + season tuple avoids hitting the in-memory cache from prior tests
    await fetchFixtures({ live: 'all', league: 9999, season: 2099 })

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/fixtures')
    expect((init as RequestInit).headers).toMatchObject({
      'x-apisports-key': 'test-key',
    })
  })

  it('flattens grouped standings response', async () => {
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: [
          {
            league: {
              standings: [
                [
                  {
                    rank: 1,
                    team: { id: 10, name: 'Equipo A', logo: 'a.png' },
                    points: 30,
                    goalsDiff: 12,
                    all: { played: 12, win: 10, draw: 0, lose: 2, goals: { for: 25, against: 13 } },
                  },
                  {
                    rank: 2,
                    team: { id: 11, name: 'Equipo B' },
                    points: 28,
                    goalsDiff: 8,
                    all: { played: 12, win: 9, draw: 1, lose: 2, goals: { for: 22, against: 14 } },
                  },
                ],
              ],
            },
          },
        ],
      }),
    })

    const table = await fetchStandings(239, 2025)
    expect(table.length).toBe(2)
    expect(table[0]).toMatchObject({ rank: 1, points: 30, goalsDiff: 12 })
    expect(table[0].team).toMatchObject({ id: 10, name: 'Equipo A', logo: 'a.png' })
  })

  it('maps team search results from /teams endpoint', async () => {
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: [
          {
            team: { id: 50, name: 'Atlético Nacional', country: 'Colombia', logo: 'nacional.png' },
            venue: { name: 'Atanasio Girardot' },
          },
        ],
      }),
    })

    const teams = await searchTeams('nacional')
    expect(teams.length).toBe(1)
    expect(teams[0]).toMatchObject({
      id: 50,
      name: 'Atlético Nacional',
      country: 'Colombia',
      stadium: 'Atanasio Girardot',
    })
  })

  it('returns empty array when team query is too short', async () => {
    const out = await searchTeams('a')
    expect(out).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('uses next/last params for team match helpers', async () => {
    const fetchMock = global.fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ response: [] }) })

    await fetchTeamNextMatches(99, 5)
    await fetchTeamLastMatches(99, 7)

    const calls = fetchMock.mock.calls.map((c) => String(c[0]))
    expect(calls[0]).toContain('team=99')
    expect(calls[0]).toContain('next=5')
    expect(calls[1]).toContain('team=99')
    expect(calls[1]).toContain('last=7')
  })

  it('resolves default season honouring SPORTS_DEFAULT_SEASON override', () => {
    const previous = process.env.SPORTS_DEFAULT_SEASON
    process.env.SPORTS_DEFAULT_SEASON = '2024'
    expect(getDefaultSeason()).toBe(2024)
    expect(getSeasonForLeague(LEAGUES.COLOMBIA_PRIMERA_A)).toBe(2024)
    if (previous == null) delete process.env.SPORTS_DEFAULT_SEASON
    else process.env.SPORTS_DEFAULT_SEASON = previous
  })

  it('uses calendar year for Latin American leagues and Aug–Jul for European', () => {
    delete process.env.SPORTS_DEFAULT_SEASON
    const may2026 = new Date('2026-05-15T12:00:00Z')
    expect(getSeasonForLeague(LEAGUES.COLOMBIA_PRIMERA_A, may2026)).toBe(2026)
    expect(getSeasonForLeague(LEAGUES.PREMIER_LEAGUE, may2026)).toBe(2025)
    const aug2026 = new Date('2026-08-15T12:00:00Z')
    expect(getSeasonForLeague(LEAGUES.PREMIER_LEAGUE, aug2026)).toBe(2026)
  })

  it('resolveSeasonForLeague uses API current season flag', async () => {
    delete process.env.SPORTS_DEFAULT_SEASON
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: [
          {
            seasons: [
              { year: 2024, current: false },
              { year: 2025, current: true },
              { year: 2026, current: false },
            ],
          },
        ],
      }),
    })

    const season = await resolveSeasonForLeague(LEAGUES.MEXICO_LIGA_MX)
    expect(season).toBe(2025)
  })
})
