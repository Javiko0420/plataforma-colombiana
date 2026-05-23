// API-Football v3 client (api-sports.io)
// Active primary provider for fixtures, standings, teams.
// Docs: https://www.api-football.com/documentation-v3

import { CALENDAR_YEAR_LEAGUE_IDS } from '@/lib/leagues'

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

export type SimpleTeam = {
  id: number
  name: string
  country?: string
  badge?: string | null
  logo?: string | null
  stadium?: string | null
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

export type FetchFixturesParams = {
  date?: string // YYYY-MM-DD
  live?: 'all' | '1' | '0' | boolean
  league?: string | number
  season?: string | number
  team?: string | number
  next?: number // upcoming N fixtures
  last?: number // last N fixtures
  timezone?: string
  page?: number
  allPages?: boolean
  maxPages?: number
}

// In-memory caches (per server instance)
type CacheEntry<T> = { ts: number; ttlMs: number; value: T }
const fixturesCache = new Map<string, CacheEntry<SimpleFixture[]>>()
const standingsCache = new Map<string, CacheEntry<SimpleStanding[]>>()
const teamsCache = new Map<string, CacheEntry<SimpleTeam[]>>()
const leagueIdCache = new Map<string, CacheEntry<number | null>>()

function getDefaultTimezone(): string {
  return process.env.SPORTS_DEFAULT_TIMEZONE || 'America/Bogota'
}

function getApiConfig() {
  const baseUrl = process.env.API_FOOTBALL_BASE_URL || 'https://v3.football.api-sports.io'
  const apiKey = process.env.API_FOOTBALL_KEY || process.env.SPORTS_API_KEY
  const useRapidApi = (process.env.API_FOOTBALL_USE_RAPIDAPI || 'false').toLowerCase() === 'true'
  const rapidHost = process.env.API_FOOTBALL_HOST || 'api-football-v1.p.rapidapi.com'
  if (!apiKey) {
    throw new Error('API-Football key not configured (set API_FOOTBALL_KEY)')
  }
  return { baseUrl, apiKey, useRapidApi, rapidHost }
}

function buildHeaders(): HeadersInit {
  const { apiKey, useRapidApi, rapidHost } = getApiConfig()
  if (useRapidApi) {
    return {
      'x-rapidapi-key': apiKey as string,
      'x-rapidapi-host': rapidHost,
      accept: 'application/json',
    }
  }
  return {
    'x-apisports-key': apiKey as string,
    accept: 'application/json',
  }
}

function stableKey(path: string, params: URLSearchParams): string {
  const entries = Array.from(params.entries()).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const normalized = new URLSearchParams(entries as [string, string][])
  return `${path}?${normalized.toString()}`
}

function computeFixturesTtlMs(params: FetchFixturesParams): number {
  const isLive = params.live === true || params.live === '1' || params.live === 'all'
  if (isLive) return 10 * 1000
  const today = new Date().toISOString().slice(0, 10)
  if (params.date === today) return 60 * 1000
  return 5 * 60 * 1000
}

// API-Football returns 200 OK with a non-empty `errors` object when the
// account is suspended, the plan disallows the request, etc. Surfacing those
// here saves debugging time: silent `.catch(() => [])` upstream hides them.
type ApiFootballEnvelope = {
  errors?: Record<string, string> | string[] | string
  response?: unknown
  results?: number
}

function logProviderError(path: string, params: URLSearchParams, errors: ApiFootballEnvelope['errors']) {
  if (!errors) return
  const isEmpty =
    (Array.isArray(errors) && errors.length === 0) ||
    (typeof errors === 'object' && !Array.isArray(errors) && Object.keys(errors).length === 0)
  if (isEmpty) return
  const summary = typeof errors === 'string' ? errors : JSON.stringify(errors)
  // eslint-disable-next-line no-console
  console.warn(`[api-football] ${path}?${params.toString()} → ${summary}`)
}

async function apiFetch<T>(
  path: string,
  params: URLSearchParams,
  options: { timeoutMs?: number; retries?: number } = {}
): Promise<T> {
  const { baseUrl } = getApiConfig()
  const url = `${baseUrl}${path}?${params.toString()}`
  const timeoutMs = options.timeoutMs ?? 8000
  const retries = options.retries ?? 1

  const attempt = async (): Promise<T> => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, {
        headers: buildHeaders(),
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!res.ok) {
        if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
          throw new Error(`retryable:${res.status}`)
        }
        throw new Error(`API-Football error ${res.status}`)
      }
      const json = (await res.json()) as T & ApiFootballEnvelope
      logProviderError(path, params, json?.errors)
      return json
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
  throw lastErr instanceof Error ? lastErr : new Error('API-Football fetch failed')
}

// -------------------- Fixtures --------------------

type ApiFixturesResponse = {
  response?: Array<{
    fixture?: { id?: number; date?: string; status?: { short?: string; long?: string; elapsed?: number | null } }
    league?: { id?: number; name?: string; country?: string; logo?: string }
    teams?: { home?: { id?: number; name?: string; logo?: string }; away?: { id?: number; name?: string; logo?: string } }
    goals?: { home?: number | null; away?: number | null }
  }>
  paging?: { current?: number; total?: number }
}

function mapFixturesPayload(list: NonNullable<ApiFixturesResponse['response']>): SimpleFixture[] {
  return list.map((item) => {
    const fx = item?.fixture ?? {}
    const lg = item?.league ?? {}
    const tm = item?.teams ?? {}
    const gl = item?.goals ?? {}
    return {
      id: Number(fx.id ?? 0),
      dateIso: String(fx.date ?? ''),
      status: String(fx.status?.short ?? fx.status?.long ?? 'NS'),
      elapsed: fx.status?.elapsed != null ? Number(fx.status.elapsed) : null,
      league: {
        id: Number(lg.id ?? 0),
        name: String(lg.name ?? ''),
        country: lg.country,
        logo: lg.logo,
      },
      home: {
        id: Number(tm.home?.id ?? 0),
        name: String(tm.home?.name ?? ''),
        logo: tm.home?.logo,
      },
      away: {
        id: Number(tm.away?.id ?? 0),
        name: String(tm.away?.name ?? ''),
        logo: tm.away?.logo,
      },
      goals: {
        home: gl.home != null ? Number(gl.home) : null,
        away: gl.away != null ? Number(gl.away) : null,
      },
    }
  })
}

export async function fetchFixtures(params: FetchFixturesParams = {}): Promise<SimpleFixture[]> {
  const qp = new URLSearchParams()
  if (params.date) qp.set('date', params.date)
  if (params.live != null) qp.set('live', params.live === true ? 'all' : String(params.live))
  if (params.league != null) qp.set('league', String(params.league))
  if (params.season != null) qp.set('season', String(params.season))
  if (params.team != null) qp.set('team', String(params.team))
  if (params.next != null) qp.set('next', String(params.next))
  if (params.last != null) qp.set('last', String(params.last))
  qp.set('timezone', params.timezone || getDefaultTimezone())
  qp.set('page', String(params.page ?? 1))

  const path = '/fixtures'
  const key = stableKey(path, qp)
  const now = Date.now()
  const cached = fixturesCache.get(key)
  const ttlMs = computeFixturesTtlMs(params)
  if (cached && now - cached.ts < cached.ttlMs) return cached.value

  const fetchPage = async (page: number): Promise<{ items: SimpleFixture[]; totalPages: number }> => {
    const paramsWithPage = new URLSearchParams(qp)
    paramsWithPage.set('page', String(page))
    const json = await apiFetch<ApiFixturesResponse>(path, paramsWithPage)
    const list = Array.isArray(json?.response) ? json.response : []
    const totalPages = Number(json?.paging?.total ?? 1)
    return {
      items: mapFixturesPayload(list),
      totalPages: Number.isFinite(totalPages) ? totalPages : 1,
    }
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
  fixturesCache.set(key, { ts: now, ttlMs, value: page1.items })
  return page1.items
}

export async function fetchTeamNextMatches(teamId: number, count = 10): Promise<SimpleFixture[]> {
  return fetchFixtures({ team: teamId, next: count })
}

export async function fetchTeamLastMatches(teamId: number, count = 10): Promise<SimpleFixture[]> {
  return fetchFixtures({ team: teamId, last: count })
}

// -------------------- Standings --------------------

type ApiStandingRow = {
  rank?: number
  team?: { id?: number; name?: string; logo?: string }
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

type ApiStandingsResponse = {
  response?: Array<{
    league?: {
      standings?: ApiStandingRow[][]
    }
  }>
}

export async function fetchStandings(
  leagueId: number | string,
  season: number | string
): Promise<SimpleStanding[]> {
  const qp = new URLSearchParams({ league: String(leagueId), season: String(season) })
  const path = '/standings'
  const key = stableKey(path, qp)
  const now = Date.now()
  const cached = standingsCache.get(key)
  const ttlMs = 10 * 60 * 1000
  if (cached && now - cached.ts < cached.ttlMs) return cached.value

  const json = await apiFetch<ApiStandingsResponse>(path, qp)
  const list = Array.isArray(json?.response) ? json.response : []
  const groups: ApiStandingRow[][] = (list?.[0]?.league?.standings as ApiStandingRow[][]) || []
  const flattened: ApiStandingRow[] = groups.flat()
  const out: SimpleStanding[] = flattened.map((row) => ({
    rank: Number(row.rank ?? 0),
    team: {
      id: Number(row.team?.id ?? 0),
      name: String(row.team?.name ?? ''),
      logo: row.team?.logo,
    },
    points: Number(row.points ?? 0),
    played: Number(row.all?.played ?? 0),
    won: Number(row.all?.win ?? 0),
    draw: Number(row.all?.draw ?? 0),
    lost: Number(row.all?.lose ?? 0),
    goalsFor: Number(row.all?.goals?.for ?? 0),
    goalsAgainst: Number(row.all?.goals?.against ?? 0),
    goalsDiff: Number(row.goalsDiff ?? (Number(row.all?.goals?.for ?? 0) - Number(row.all?.goals?.against ?? 0))),
    group: row.group ? String(row.group) : undefined,
  }))
  standingsCache.set(key, { ts: now, ttlMs, value: out })
  return out
}

// -------------------- Leagues --------------------

type ApiLeaguesResponse = {
  response?: Array<{
    league?: { id?: number; name?: string; type?: string }
    country?: { name?: string; code?: string }
  }>
}

async function resolveLeagueIdByName(leagueName: string): Promise<number | null> {
  const key = `leagueName:${leagueName.toLowerCase()}`
  const now = Date.now()
  const cached = leagueIdCache.get(key)
  const ttlMs = 24 * 60 * 60 * 1000
  if (cached && now - cached.ts < cached.ttlMs) return cached.value

  const qp = new URLSearchParams({ search: leagueName })
  const json = await apiFetch<ApiLeaguesResponse>('/leagues', qp)
  const list = Array.isArray(json?.response) ? json.response : []
  // Prefer exact (case-insensitive) match on league name
  const target = leagueName.toLowerCase()
  const exact = list.find((item) => String(item?.league?.name ?? '').toLowerCase() === target)
  const fallback = list[0]
  const picked = exact ?? fallback
  const id = picked?.league?.id != null ? Number(picked.league.id) : null
  leagueIdCache.set(key, { ts: now, ttlMs, value: id })
  return id
}

export async function fetchStandingsByName(
  leagueName: string,
  season: number | string
): Promise<SimpleStanding[]> {
  const id = await resolveLeagueIdByName(leagueName)
  if (!id) return []
  return fetchStandings(id, season)
}

// -------------------- Teams --------------------

type ApiTeamsResponse = {
  response?: Array<{
    team?: { id?: number; name?: string; country?: string; logo?: string }
    venue?: { name?: string }
  }>
}

function mapTeamsPayload(list: NonNullable<ApiTeamsResponse['response']>): SimpleTeam[] {
  return list
    .map((item) => {
      const t = item?.team ?? {}
      const v = item?.venue ?? {}
      return {
        id: Number(t.id ?? 0),
        name: String(t.name ?? ''),
        country: t.country || undefined,
        badge: t.logo ?? null,
        logo: t.logo ?? null,
        stadium: v.name ?? null,
      }
    })
    .filter((t) => t.id > 0 && t.name.length > 0)
}

export async function searchTeams(query: string): Promise<SimpleTeam[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const qp = new URLSearchParams({ search: trimmed })
  const path = '/teams'
  const key = stableKey(path, qp)
  const now = Date.now()
  const cached = teamsCache.get(key)
  const ttlMs = 10 * 60 * 1000
  if (cached && now - cached.ts < cached.ttlMs) return cached.value

  const json = await apiFetch<ApiTeamsResponse>(path, qp)
  const list = Array.isArray(json?.response) ? json.response : []
  const teams = mapTeamsPayload(list)
  teamsCache.set(key, { ts: now, ttlMs, value: teams })
  return teams
}

export async function fetchTeamDetails(teamId: number): Promise<SimpleTeam | null> {
  const qp = new URLSearchParams({ id: String(teamId) })
  const json = await apiFetch<ApiTeamsResponse>('/teams', qp)
  const list = Array.isArray(json?.response) ? json.response : []
  const teams = mapTeamsPayload(list)
  return teams[0] ?? null
}

// -------------------- Season & Summary --------------------

function readSeasonOverride(): number | null {
  const env = process.env.SPORTS_DEFAULT_SEASON
  if (env && /^\d{4}$/.test(env)) return Number(env)
  return null
}

const leagueSeasonCache = new Map<number, { ts: number; ttlMs: number; value: number }>()

type ApiLeaguesSeasonsResponse = {
  response?: Array<{
    seasons?: Array<{ year?: number; current?: boolean }>
  }>
}

/** Resolves the active season for a league via API-Football's `current` flag (cached 24h). */
export async function resolveSeasonForLeague(leagueId: number): Promise<number> {
  const override = readSeasonOverride()
  if (override != null) return override

  if (!leagueId || leagueId <= 0) return getSeasonForLeague(leagueId)

  const now = Date.now()
  const cached = leagueSeasonCache.get(leagueId)
  const ttlMs = 24 * 60 * 60 * 1000
  if (cached && now - cached.ts < cached.ttlMs) return cached.value

  try {
    const qp = new URLSearchParams({ id: String(leagueId) })
    const json = await apiFetch<ApiLeaguesSeasonsResponse>('/leagues', qp)
    const seasons = json?.response?.[0]?.seasons ?? []
    const current = seasons.find((s) => s.current === true)
    const resolved =
      current?.year ??
      seasons
        .map((s) => s.year ?? 0)
        .filter((y) => y > 0)
        .sort((a, b) => b - a)[0]

    if (resolved) {
      leagueSeasonCache.set(leagueId, { ts: now, ttlMs, value: resolved })
      return resolved
    }
  } catch {
    // Fall back to heuristic below
  }

  return getSeasonForLeague(leagueId)
}

/** Heuristic season (sync). Prefer resolveSeasonForLeague() for accurate per-league data. */
export function getSeasonForLeague(leagueId: number, now: Date = new Date()): number {
  const override = readSeasonOverride()
  if (override != null) return override

  const year = now.getUTCFullYear()
  const month = now.getUTCMonth() + 1

  if (CALENDAR_YEAR_LEAGUE_IDS.has(leagueId)) {
    return year
  }

  // European / UEFA: season label = start year (e.g. 2025 = 2025/26)
  return month >= 7 ? year : year - 1
}

/** Default season (European logic). Prefer getSeasonForLeague() when league ID is known. */
export function getDefaultSeason(): number {
  const override = readSeasonOverride()
  if (override != null) return override
  return getSeasonForLeague(39) // Premier League as European reference
}

export type LeagueDashboardRow = {
  league: { alias: string; id: number; name: string }
  table: SimpleStanding[]
  dayFx: SimpleFixture[]
}

/** Load standings + today's fixtures for many leagues using parallel API waves (Vercel-safe). */
export async function loadLeaguesDashboard(
  leagues: Array<{ alias: string; id: number; name: string }>,
  opts: { date?: string; team?: number } = {}
): Promise<LeagueDashboardRow[]> {
  if (leagues.length === 0) return []

  // Wave 1 — resolve current season per league (cached 24h each)
  const seasons = await Promise.all(leagues.map((lg) => resolveSeasonForLeague(lg.id)))
  const enriched = leagues.map((lg, i) => ({ ...lg, season: seasons[i]! }))

  // Wave 2 — all standings in parallel (avoids UCL/UEL timing out at end of sequential batches)
  const tables = await Promise.all(
    enriched.map(({ id, season, name }) =>
      fetchStandings(id, season).catch((err) => {
        console.warn(`[sports] standings failed league=${id} (${name}) season=${season}:`, err)
        return [] as SimpleStanding[]
      })
    )
  )

  // Wave 3 — all day fixtures in parallel
  const dayFixtures = await Promise.all(
    enriched.map(({ id, season }) =>
      fetchFixtures({ league: id, season, date: opts.date, team: opts.team }).catch(
        () => [] as SimpleFixture[]
      )
    )
  )

  return enriched.map((lg, i) => ({
    league: { alias: lg.alias, id: lg.id, name: lg.name },
    table: tables[i]!,
    dayFx: dayFixtures[i]!,
  }))
}

export async function fetchSportsSummary(input?: {
  leagues: Array<{ id: number; name: string }>
  nationalTeamIds?: number[]
  season?: number | string
  timezone?: string
}): Promise<SportsSummary> {
  const timezone = input?.timezone ?? getDefaultTimezone()
  const today = new Date().toISOString().slice(0, 10)

  const leagues = input?.leagues ?? []
  const nationalTeamIds = input?.nationalTeamIds ?? []

  const leagueResults = await Promise.all(
    leagues.map(async (lg) => {
      const season = input?.season ?? (await resolveSeasonForLeague(lg.id))
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
      const fixtures = await fetchFixtures({ team: teamId, date: today, timezone }).catch(
        () => [] as SimpleFixture[]
      )
      return { teamId, fixtures }
    })
  )

  return { leagues: leagueResults, nationals }
}
