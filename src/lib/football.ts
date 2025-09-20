export type SimpleFixture = {
  id: number
  dateIso: string
  status: string
  elapsed: number | null
  league: { id: number; name: string; country?: string; logo?: string }
  home: { id: number; name: string; logo?: string }
  away: { id: number; name: string; logo?: string }
  goals: { home: number | null; away: number | null }
}

export type FetchFixturesParams = {
  date?: string // YYYY-MM-DD
  live?: 'all' | '1' | '0' | boolean
  league?: string | number
  season?: string | number
  team?: string | number
  timezone?: string
  page?: number
  allPages?: boolean
  maxPages?: number
}

type CacheEntry = { ts: number; ttlMs: number; value: SimpleFixture[] }
const fixturesCache = new Map<string, CacheEntry>()

function getDefaultTimezone(): string {
  return process.env.SPORTS_DEFAULT_TIMEZONE || 'America/Bogota'
}

function getApiConfig() {
  const baseUrl = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io'
  const apiKey = process.env.API_FOOTBALL_KEY || process.env.SPORTS_API_KEY
  const useRapidApi = (process.env.API_FOOTBALL_USE_RAPIDAPI || 'false').toLowerCase() === 'true'
  const rapidHost = process.env.API_FOOTBALL_HOST || 'api-football-v1.p.rapidapi.com'
  if (!apiKey) {
    throw new Error('API football key not configured')
  }
  return { baseUrl, apiKey, useRapidApi, rapidHost }
}

function buildHeaders(): HeadersInit {
  const { apiKey, useRapidApi, rapidHost } = getApiConfig()
  if (useRapidApi) {
    return {
      'x-rapidapi-key': apiKey as string,
      'x-rapidapi-host': rapidHost,
      accept: 'application/json'
    }
  }
  return {
    'x-apisports-key': apiKey as string,
    accept: 'application/json'
  }
}

function toCacheKey(path: string, params: URLSearchParams): string {
  // Sort params for stable key
  const entries = Array.from(params.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const normalized = new URLSearchParams(entries as [string, string][])
  return `${path}?${normalized.toString()}`
}

function computeTtlMs(params: FetchFixturesParams): number {
  const isLive = params.live === true || params.live === '1' || params.live === 'all'
  if (isLive) return 10 * 1000 // very short for live
  const today = new Date().toISOString().slice(0, 10)
  if (params.date === today) return 60 * 1000 // today changes more often
  return 5 * 60 * 1000 // 5 min for historical/future
}

type ApiFixturesResponse = {
  response?: Array<{
    fixture?: { id?: number; date?: string; status?: { short?: string; long?: string; elapsed?: number | null } }
    league?: { id?: number; name?: string; country?: string; logo?: string }
    teams?: { home?: { id?: number; name?: string; logo?: string }; away?: { id?: number; name?: string; logo?: string } }
    goals?: { home?: number | null; away?: number | null }
  }>
}

type ApiPaging = { paging?: { current?: number; total?: number } }

export async function fetchFixtures(params: FetchFixturesParams = {}): Promise<SimpleFixture[]> {
  const { baseUrl } = getApiConfig()
  const qp = new URLSearchParams()
  if (params.date) qp.set('date', params.date)
  if (params.live != null) qp.set('live', params.live === true ? 'all' : String(params.live))
  if (params.league != null) qp.set('league', String(params.league))
  if (params.season != null) qp.set('season', String(params.season))
  if (params.team != null) qp.set('team', String(params.team))
  qp.set('timezone', params.timezone || getDefaultTimezone())
  qp.set('page', String(params.page ?? 1))

  const path = '/fixtures'
  const key = toCacheKey(path, qp)
  const now = Date.now()
  const cached = fixturesCache.get(key)
  const ttlMs = computeTtlMs(params)
  if (cached && now - cached.ts < cached.ttlMs) {
    return cached.value
  }

  async function fetchPage(page: number): Promise<{ items: SimpleFixture[]; totalPages: number }> {
    const paramsWithPage = new URLSearchParams(qp)
    paramsWithPage.set('page', String(page))
    const url = `${baseUrl}${path}?${paramsWithPage.toString()}`
    const res = await fetch(url, { headers: buildHeaders(), cache: 'no-store' })
    if (!res.ok) throw new Error('Football provider error')
    const json: ApiFixturesResponse & ApiPaging = await res.json()
    const list = Array.isArray(json?.response) ? json.response : []
    const fixtures: SimpleFixture[] = list.map((item) => {
      const fx = item?.fixture ?? {}
      const lg = item?.league ?? {}
      const tm = item?.teams ?? {}
      const gl = item?.goals ?? {}
      const leagueLogo = (lg as { logo?: string })?.logo
      const homeLogo = (tm.home as { logo?: string } | undefined)?.logo
      const awayLogo = (tm.away as { logo?: string } | undefined)?.logo
      return {
        id: Number(fx.id ?? 0),
        dateIso: String(fx.date ?? ''),
        status: String(fx.status?.short ?? fx.status?.long ?? 'NS'),
        elapsed: fx.status?.elapsed != null ? Number(fx.status.elapsed) : null,
        league: { id: Number(lg.id ?? 0), name: String(lg.name ?? ''), country: lg.country, logo: leagueLogo },
        home: { id: Number(tm.home?.id ?? 0), name: String(tm.home?.name ?? ''), logo: homeLogo },
        away: { id: Number(tm.away?.id ?? 0), name: String(tm.away?.name ?? ''), logo: awayLogo },
        goals: { home: gl.home != null ? Number(gl.home) : null, away: gl.away != null ? Number(gl.away) : null }
      }
    })
    const totalPagesVal = (json as ApiPaging)?.paging?.total
    const totalPages = Number(totalPagesVal ?? 1)
    return { items: fixtures, totalPages: Number.isFinite(totalPages) ? totalPages : 1 }
  }

  if (params.allPages) {
    const max = params.maxPages ?? 5
    const first = await fetchPage(Number(qp.get('page') || '1'))
    let all = [...first.items]
    const total = Math.min(first.totalPages, max)
    for (let p = 2; p <= total; p++) {
      const pg = await fetchPage(p)
      all = all.concat(pg.items)
    }
    fixturesCache.set(key, { ts: now, ttlMs, value: all })
    return all
  }

  const page1 = await fetchPage(Number(qp.get('page') || '1'))
  const fixtures = page1.items

  fixturesCache.set(key, { ts: now, ttlMs, value: fixtures })
  return fixtures
}

export type SimpleStanding = {
  rank: number
  team: { id: number; name: string; logo?: string }
  points: number
  played: number
  won: number
  draw: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalsDiff: number
  group?: string
}

function standingsCacheKey(league: number | string, season: number | string): string {
  return `standings:${league}:${season}`
}

const standingsCache = new Map<string, { ts: number; ttlMs: number; value: SimpleStanding[] }>()

type ApiStandingsResponse = {
  response?: Array<{
    league?: {
      standings?: ApiStandingRow[][]
    }
  }>
}

type ApiStandingRow = {
  rank?: number
  team?: { id?: number; name?: string }
  points?: number
  goalsDiff?: number
  group?: string
  all?: {
    played?: number
    win?: number
    draw?: number
    lose?: number
    goals?: { for?: number; against?: number }
  }
}

export async function fetchStandings(leagueId: number | string, season: number | string): Promise<SimpleStanding[]> {
  const { baseUrl } = getApiConfig()
  const qp = new URLSearchParams({ league: String(leagueId), season: String(season) })
  const path = '/standings'
  const key = standingsCacheKey(leagueId, season)
  const now = Date.now()
  const cached = standingsCache.get(key)
  const ttlMs = 10 * 60 * 1000 // 10 minutes
  if (cached && now - cached.ts < cached.ttlMs) {
    return cached.value
  }

  const url = `${baseUrl}${path}?${qp.toString()}`
  const res = await fetch(url, { headers: buildHeaders(), cache: 'no-store' })
  if (!res.ok) throw new Error('Football provider error')
  const json: ApiStandingsResponse = await res.json()
  const list = Array.isArray(json?.response) ? json.response : []
  // API returns nested arrays: league.standings is an array of groups (arrays)
  const groups: ApiStandingRow[][] = (list?.[0]?.league?.standings as ApiStandingRow[][]) || []
  const flattened: ApiStandingRow[] = groups.flat()
  type RowWithLogo = ApiStandingRow & { team?: { id?: number; name?: string; logo?: string } }
  const out: SimpleStanding[] = (flattened as RowWithLogo[]).map((row) => ({
    rank: Number(row.rank ?? 0),
    team: { id: Number(row.team?.id ?? 0), name: String(row.team?.name ?? ''), logo: row.team?.logo },
    points: Number(row.points ?? 0),
    played: Number(row.all?.played ?? 0),
    won: Number(row.all?.win ?? 0),
    draw: Number(row.all?.draw ?? 0),
    lost: Number(row.all?.lose ?? 0),
    goalsFor: Number(row.all?.goals?.for ?? 0),
    goalsAgainst: Number(row.all?.goals?.against ?? 0),
    goalsDiff: Number(row.goalsDiff ?? (Number(row.all?.goals?.for ?? 0) - Number(row.all?.goals?.against ?? 0))),
    group: row.group ? String(row.group) : undefined
  }))
  standingsCache.set(key, { ts: now, ttlMs, value: out })
  return out
}

export function getDefaultSeason(): number {
  const env = process.env.SPORTS_DEFAULT_SEASON
  if (env && /^\d{4}$/.test(env)) return Number(env)
  return new Date().getUTCFullYear()
}

export type SportsSummary = {
  leagues: Array<{
    id: number
    name: string
    standings?: SimpleStanding[]
    todayFixtures?: SimpleFixture[]
    liveFixtures?: SimpleFixture[]
  }>
  nationals: Array<{
    teamId: number
    fixtures: SimpleFixture[]
  }>
}

export async function fetchSportsSummary(input?: {
  leagues: Array<{ id: number; name: string }>
  nationalTeamIds?: number[]
  season?: number
  timezone?: string
}): Promise<SportsSummary> {
  const season = input?.season ?? getDefaultSeason()
  const timezone = input?.timezone ?? getDefaultTimezone()
  const today = new Date().toISOString().slice(0, 10)

  const leagues = input?.leagues ?? []
  const nationalTeamIds = input?.nationalTeamIds ?? []

  const leagueResults = await Promise.all(
    leagues.map(async (lg) => {
      const [standings, todayFixtures, liveFixtures] = await Promise.all([
        fetchStandings(lg.id, season).catch(() => [] as SimpleStanding[]),
        fetchFixtures({ league: lg.id, season, date: today, timezone }).catch(() => [] as SimpleFixture[]),
        fetchFixtures({ league: lg.id, season, live: 'all', timezone }).catch(() => [] as SimpleFixture[]),
      ])
      return { id: lg.id, name: lg.name, standings, todayFixtures, liveFixtures }
    })
  )

  const nationals = await Promise.all(
    nationalTeamIds.map(async (teamId) => {
      const fixtures = await fetchFixtures({ team: teamId, date: today, timezone }).catch(() => [] as SimpleFixture[])
      return { teamId, fixtures }
    })
  )

  return { leagues: leagueResults, nationals }
}


