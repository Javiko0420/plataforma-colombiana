// TheSportsDB client exposing the same simple types used by the app
// Docs: https://www.thesportsdb.com/documentation

export type SimpleFixture = {
  id: number
  dateIso: string
  status: string
  elapsed: number | null
  league: { id: number | null; name: string }
  home: { id: number | null; name: string }
  away: { id: number | null; name: string }
  goals: { home: number | null; away: number | null }
}

export type SimpleStanding = {
  rank: number
  team: { id: number | null; name: string }
  points: number
  played: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalsDiff: number
}

type FetchFixturesParams = {
  date?: string // YYYY-MM-DD
  league?: string | number // If numeric, treated as TSDB league id
  team?: string | number // optional TSDB team id (not used for now)
}

function getConfig() {
  const baseUrl = process.env.THESPORTSDB_BASE_URL || 'https://www.thesportsdb.com/api/v1/json'
  const apiKey = process.env.THESPORTSDB_API_KEY || '123'
  return { baseUrl, apiKey }
}

async function tsdbFetch<T>(pathAndQuery: string): Promise<T> {
  const { baseUrl, apiKey } = getConfig()
  const url = `${baseUrl}/${apiKey}/${pathAndQuery}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('TheSportsDB error')
  return res.json() as Promise<T>
}

const fixturesCache = new Map<string, { ts: number; ttlMs: number; value: SimpleFixture[] }>()

export async function fetchFixtures(params: FetchFixturesParams = {}): Promise<SimpleFixture[]> {
  const date = params.date || new Date().toISOString().slice(0, 10)
  const key = `day:${date}` + (params.league ? `:lg=${params.league}` : '')
  const now = Date.now()
  const cached = fixturesCache.get(key)
  const ttlMs = date === new Date().toISOString().slice(0, 10) ? 60_000 : 5 * 60_000
  if (cached && now - cached.ts < cached.ttlMs) return cached.value

  // v1 day events for soccer
  type EventsDay = {
    events?: Array<{
      idEvent?: string
      dateEvent?: string
      strTime?: string
      strTimestamp?: string
      strStatus?: string | null
      idLeague?: string | null
      strLeague?: string | null
      idHomeTeam?: string | null
      idAwayTeam?: string | null
      strHomeTeam?: string | null
      strAwayTeam?: string | null
      intHomeScore?: string | null
      intAwayScore?: string | null
    }>
  }

  const json = await tsdbFetch<EventsDay>(`eventsday.php?d=${date}&s=Soccer`)
  let list = Array.isArray(json.events) ? json.events : []

  // If numeric league provided, filter by id; if string, filter by league contains
  if (params.league != null) {
    if (typeof params.league === 'number' || /^\d+$/.test(String(params.league))) {
      const lid = String(params.league)
      list = list.filter(e => (e.idLeague || '') === lid)
    } else {
      const nameLc = String(params.league).toLowerCase()
      list = list.filter(e => (e.strLeague || '').toLowerCase().includes(nameLc))
    }
  }

  const fixtures: SimpleFixture[] = list.map((e) => {
    const ts = e.strTimestamp ? new Date(e.strTimestamp).toISOString() : `${e.dateEvent}T00:00:00.000Z`
    const hs = e.intHomeScore != null ? Number(e.intHomeScore) : null
    const as = e.intAwayScore != null ? Number(e.intAwayScore) : null
    return {
      id: e.idEvent ? Number(e.idEvent) : 0,
      dateIso: ts,
      status: e.strStatus || (hs != null || as != null ? 'FT' : 'NS'),
      elapsed: null,
      league: { id: e.idLeague ? Number(e.idLeague) : null, name: e.strLeague || '' },
      home: { id: e.idHomeTeam ? Number(e.idHomeTeam) : null, name: e.strHomeTeam || '' },
      away: { id: e.idAwayTeam ? Number(e.idAwayTeam) : null, name: e.strAwayTeam || '' },
      goals: { home: hs, away: as }
    }
  })

  fixturesCache.set(key, { ts: now, ttlMs, value: fixtures })
  return fixtures
}

export function getDefaultSeason(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1
  const start = month >= 7 ? year : year - 1
  return `${start}-${start + 1}`
}

export async function fetchStandings(leagueId: number | string, season: string): Promise<SimpleStanding[]> {
  type TableResp = {
    table?: Array<{
      intRank?: string
      idTeam?: string
      strTeam?: string
      intPoints?: string
      intPlayed?: string
      intWin?: string
      intDraw?: string
      intLoss?: string
      intGoalsFor?: string
      intGoalsAgainst?: string
      intGoalDifference?: string
    }>
  }
  const json = await tsdbFetch<TableResp>(`lookuptable.php?l=${leagueId}&s=${encodeURIComponent(season)}`)
  const rows = Array.isArray(json.table) ? json.table : []
  return rows.map((r) => ({
    rank: Number(r.intRank || 0),
    team: { id: r.idTeam ? Number(r.idTeam) : null, name: r.strTeam || '' },
    points: Number(r.intPoints || 0),
    played: Number(r.intPlayed || 0),
    won: Number(r.intWin || 0),
    draw: Number(r.intDraw || 0),
    lost: Number(r.intLoss || 0),
    goalsFor: Number(r.intGoalsFor || 0),
    goalsAgainst: Number(r.intGoalsAgainst || 0),
    goalsDiff: Number(r.intGoalDifference || 0)
  }))
}

export async function fetchStandingsByName(leagueName: string, season: string): Promise<SimpleStanding[]> {
  // Try to resolve league id by exact name search
  type SearchResp = {
    countrys?: Array<{ idLeague?: string; strLeague?: string; strSport?: string }>
    leagues?: Array<{ idLeague?: string; strLeague?: string; strSport?: string }>
  }
  const q = encodeURIComponent(leagueName)
  const search = await tsdbFetch<SearchResp>(`searchleagues.php?l=${q}`)
  const arr: Array<{ idLeague?: string; strLeague?: string; strSport?: string }> = Array.isArray(search.countrys)
    ? search.countrys
    : Array.isArray((search as unknown as { leagues?: Array<{ idLeague?: string; strLeague?: string; strSport?: string }> }).leagues)
      ? (search as unknown as { leagues?: Array<{ idLeague?: string; strLeague?: string; strSport?: string }> }).leagues!
      : []
  const found = arr.find(x => (x.strSport || '').toLowerCase() === 'soccer' || (x.strLeague || '').toLowerCase().includes(leagueName.toLowerCase()))
  const id = found?.idLeague
  if (!id) return []
  return fetchStandings(Number(id), season)
}

export type SportsSummary = {
  leagues: Array<{
    id: number | string
    name: string
    standings?: SimpleStanding[]
    todayFixtures?: SimpleFixture[]
  }>
}

export async function fetchSportsSummary(input: {
  leagues: Array<{ id: number | string; name: string }>
  season?: string
}): Promise<SportsSummary> {
  const season = input.season || getDefaultSeason()
  const today = new Date().toISOString().slice(0, 10)

  const leagues = await Promise.all(
    input.leagues.map(async (lg) => {
      const [standings, todayFx] = await Promise.all([
        fetchStandings(lg.id, season).catch(() => [] as SimpleStanding[]),
        fetchFixtures({ date: today, league: lg.id }).catch(() => [] as SimpleFixture[])
      ])
      return { id: lg.id, name: lg.name, standings, todayFixtures: todayFx }
    })
  )
  return { leagues }
}


