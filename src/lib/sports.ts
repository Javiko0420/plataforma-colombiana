// TheSportsDB client exposing the same simple types used by the app
// Docs: https://www.thesportsdb.com/documentation

import { z } from 'zod'

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
  team?: string | number // TSDB team id to filter fixtures (home or away)
}

function getConfig() {
  const baseUrl = process.env.THESPORTSDB_BASE_URL || 'https://www.thesportsdb.com/api/v1/json'
  const apiKey = process.env.THESPORTSDB_API_KEY || '123'
  return { baseUrl, apiKey }
}

type TsdbFetchOptions<T> = {
  timeoutMs?: number
  retries?: number
  schema?: z.ZodType<T>
}

async function tsdbFetch<T>(pathAndQuery: string, options: TsdbFetchOptions<T> = {}): Promise<T> {
  const { baseUrl, apiKey } = getConfig()
  const url = `${baseUrl}/${apiKey}/${pathAndQuery}`

  const timeoutMs = options.timeoutMs ?? 8000
  const retries = options.retries ?? 1

  async function attempt(): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      // Usar cache más agresivo para reducir llamadas a la API
      const res = await fetch(url, { 
        cache: 'default',
        next: { revalidate: 300 }, // Cache de 5 minutos
        signal: controller.signal 
      })
      if (!res.ok) {
        // Retry on 429 or 5xx
        if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
          throw new Error(`retryable:${res.status}`)
        }
        throw new Error(`TheSportsDB error ${res.status}`)
      }
      const json = (await res.json()) as unknown
      if (options.schema) {
        return options.schema.parse(json)
      }
      return json as T
    } finally {
      clearTimeout(timer)
    }
  }

  let lastErr: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      return await attempt()
    } catch (err) {
      lastErr = err
      // Only backoff for retryable errors
      const msg = String(err instanceof Error ? err.message : '')
      const isAbort = err instanceof Error && (err.name === 'AbortError' || msg.includes('network'))
      const isRetryable = isAbort || msg.startsWith('retryable:')
      if (i < retries && isRetryable) {
        const backoff = 200 * Math.pow(2, i) + Math.floor(Math.random() * 100)
        await new Promise((r) => setTimeout(r, backoff))
        continue
      }
      break
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('TheSportsDB fetch failed')
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
  const eventSchema = z.object({
    idEvent: z.string().optional(),
    dateEvent: z.string().optional(),
    strTime: z.string().optional(),
    strTimestamp: z.string().optional(),
    strStatus: z.string().nullable().optional(),
    idLeague: z.string().nullable().optional(),
    strLeague: z.string().nullable().optional(),
    idHomeTeam: z.string().nullable().optional(),
    idAwayTeam: z.string().nullable().optional(),
    strHomeTeam: z.string().nullable().optional(),
    strAwayTeam: z.string().nullable().optional(),
    intHomeScore: z.string().nullable().optional(),
    intAwayScore: z.string().nullable().optional(),
  })
  const eventsDaySchema = z.object({ events: z.array(eventSchema).optional() })
  type EventsDay = z.infer<typeof eventsDaySchema>

  const json = await tsdbFetch<EventsDay>(`eventsday.php?d=${date}&s=Soccer`, { schema: eventsDaySchema })
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

  // Filter by team (home or away) if provided
  if (params.team != null) {
    const tid = String(params.team)
    list = list.filter(e => (e.idHomeTeam || '') === tid || (e.idAwayTeam || '') === tid)
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
  const leagueSchema = z.object({ idLeague: z.string().optional(), strLeague: z.string().optional(), strSport: z.string().optional() })
  const searchRespSchema = z.object({
    countrys: z.array(leagueSchema).optional(),
    leagues: z.array(leagueSchema).optional(),
  })
  type SearchResp = z.infer<typeof searchRespSchema>
  const q = encodeURIComponent(leagueName)
  const search = await tsdbFetch<SearchResp>(`searchleagues.php?l=${q}`, { schema: searchRespSchema })
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


// Team search (TheSportsDB searchteams.php)
export type SimpleTeam = {
  id: number
  name: string
  country?: string
  badge?: string | null
  logo?: string | null
  stadium?: string | null
}

export async function searchTeams(query: string): Promise<SimpleTeam[]> {
  const q = encodeURIComponent(query)
  const teamSchema = z.object({
    idTeam: z.string().optional(),
    strTeam: z.string().optional(),
    strCountry: z.string().nullable().optional(),
    strTeamBadge: z.string().nullable().optional(),
    strTeamLogo: z.string().nullable().optional(),
    strStadium: z.string().nullable().optional(),
  })
  const respSchema = z.object({ teams: z.array(teamSchema).nullable().optional() })
  type TeamsResp = z.infer<typeof respSchema>
  const json = await tsdbFetch<TeamsResp>(`searchteams.php?t=${q}`, { schema: respSchema })
  const list = Array.isArray(json?.teams as unknown[]) ? (json?.teams as Array<z.infer<typeof teamSchema>>) : []
  return list.map((t) => ({
    id: t.idTeam ? Number(t.idTeam) : 0,
    name: t.strTeam || '',
    country: t.strCountry || undefined,
    badge: t.strTeamBadge ?? null,
    logo: t.strTeamLogo ?? null,
    stadium: t.strStadium ?? null,
  })).filter((t) => t.id > 0 && t.name.length > 0)
}

// Fetch full team details by id
export async function fetchTeamDetails(teamId: number): Promise<SimpleTeam | null> {
  const teamSchema = z.object({
    idTeam: z.string().optional(),
    strTeam: z.string().optional(),
    strCountry: z.string().nullable().optional(),
    strTeamBadge: z.string().nullable().optional(),
    strTeamLogo: z.string().nullable().optional(),
    strStadium: z.string().nullable().optional(),
  })
  const respSchema = z.object({ teams: z.array(teamSchema).nullable().optional() })
  type TeamsResp = z.infer<typeof respSchema>
  const json = await tsdbFetch<TeamsResp>(`lookupteam.php?id=${encodeURIComponent(String(teamId))}`, { schema: respSchema })
  const t = (Array.isArray(json?.teams) ? json?.teams : [])[0]
  if (!t?.idTeam) return null
  return {
    id: Number(t.idTeam),
    name: t.strTeam || '',
    country: t.strCountry || undefined,
    badge: t.strTeamBadge ?? null,
    logo: t.strTeamLogo ?? null,
    stadium: t.strStadium ?? null,
  }
}

// Map TSDB event payloads to SimpleFixture
function mapTsdbEventsToFixtures(list: Array<{
  idEvent?: string
  dateEvent?: string
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
}>): SimpleFixture[] {
  return list.map((e) => {
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
}

export async function fetchTeamNextMatches(teamId: number): Promise<SimpleFixture[]> {
  const eventSchema = z.object({
    idEvent: z.string().optional(),
    dateEvent: z.string().optional(),
    strTimestamp: z.string().optional(),
    strStatus: z.string().nullable().optional(),
    idLeague: z.string().nullable().optional(),
    strLeague: z.string().nullable().optional(),
    idHomeTeam: z.string().nullable().optional(),
    idAwayTeam: z.string().nullable().optional(),
    strHomeTeam: z.string().nullable().optional(),
    strAwayTeam: z.string().nullable().optional(),
    intHomeScore: z.string().nullable().optional(),
    intAwayScore: z.string().nullable().optional(),
  })
  const respSchema = z.object({ events: z.array(eventSchema).optional() })
  type Resp = z.infer<typeof respSchema>
  const json = await tsdbFetch<Resp>(`eventsnext.php?id=${encodeURIComponent(String(teamId))}`, { schema: respSchema })
  const list = Array.isArray(json.events) ? json.events : []
  return mapTsdbEventsToFixtures(list)
}

export async function fetchTeamLastMatches(teamId: number): Promise<SimpleFixture[]> {
  const eventSchema = z.object({
    idEvent: z.string().optional(),
    dateEvent: z.string().optional(),
    strTimestamp: z.string().optional(),
    strStatus: z.string().nullable().optional(),
    idLeague: z.string().nullable().optional(),
    strLeague: z.string().nullable().optional(),
    idHomeTeam: z.string().nullable().optional(),
    idAwayTeam: z.string().nullable().optional(),
    strHomeTeam: z.string().nullable().optional(),
    strAwayTeam: z.string().nullable().optional(),
    intHomeScore: z.string().nullable().optional(),
    intAwayScore: z.string().nullable().optional(),
  })
  const respSchema = z.object({ results: z.array(eventSchema).optional() })
  type Resp = z.infer<typeof respSchema>
  const json = await tsdbFetch<Resp>(`eventslast.php?id=${encodeURIComponent(String(teamId))}`, { schema: respSchema })
  const list = Array.isArray(json.results) ? json.results : []
  return mapTsdbEventsToFixtures(list)
}


