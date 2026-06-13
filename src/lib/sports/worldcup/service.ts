import { WORLDCUP_LEAGUE_ID, WORLDCUP_SEASON, TTL } from './constants'
import { fetchApiFootball } from './api-football-client'
import { worldcupCache } from './cache'
import {
  ApiFootballFixturesEnvelopeSchema,
  ApiFootballStandingsEnvelopeSchema,
  ApiFootballTeamsEnvelopeSchema,
} from './schemas'
import { mapFixture, mapTeam } from './mappers'
import { wcLogger } from './logger'
import type {
  WorldCupFixturesResponse,
  WorldCupStandingsResponse,
  WorldCupTeamsResponse,
  WorldCupLiveResponse,
  WorldCupStandingsGroup,
  CachedFixtures,
  CachedStandings,
  CachedTeams,
  CachedLive,
} from './types'
import type { RawStandingsEntry } from './schemas'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

export interface GetFixturesParams {
  round?: string
  team?: number
  date?: string
}

function buildFixturesCacheKey(
  round: string | undefined,
  team: number | undefined,
  date: string | undefined
): string {
  return `worldcup:fixtures:${round ?? 'none'}:${team ?? 'none'}:${date ?? 'none'}`
}

export async function getWorldcupFixtures(
  params: GetFixturesParams = {}
): Promise<WorldCupFixturesResponse> {
  const { round, team, date } = params
  const cacheKey = buildFixturesCacheKey(round, team, date)

  const cached = worldcupCache.get<CachedFixtures>(cacheKey)
  if (cached) {
    wcLogger.info('service cache hit: fixtures', { cacheKey })
    return cached
  }

  const upstreamParams: Record<string, string> = {
    league: String(WORLDCUP_LEAGUE_ID),
    season: String(WORLDCUP_SEASON),
  }
  if (round !== undefined) upstreamParams.round = round
  if (team !== undefined) upstreamParams.team = String(team)
  if (date !== undefined) upstreamParams.date = date

  const envelope = await fetchApiFootball(
    'fixtures',
    upstreamParams,
    ApiFootballFixturesEnvelopeSchema,
    { allowEmptyResponse: true }
  )

  const fixtures = envelope.response.map(mapFixture)
  const payload: CachedFixtures = { fixtures, cachedAt: new Date().toISOString() }

  worldcupCache.set(cacheKey, payload, TTL.FIXTURES_DAILY_S)
  wcLogger.info('service fetched and cached fixtures', { count: fixtures.length, cacheKey })

  return payload
}

// ─── Standings ────────────────────────────────────────────────────────────────

type StandingsEnvelope = {
  response: Array<{
    league: {
      standings?: Array<Array<RawStandingsEntry>>
    }
  }>
}

function mapStandingsGroups(envelope: StandingsEnvelope): WorldCupStandingsGroup[] {
  const rawGroups = envelope.response[0]?.league?.standings ?? []
  return rawGroups
    .filter((group) => group.length > 0)
    .map((group) => ({
      group: group[0]!.group,
      standings: group.map((entry) => ({
        rank: entry.rank,
        team: entry.team,
        points: entry.points,
        goalsDiff: entry.goalsDiff,
        played: entry.all.played,
        win: entry.all.win,
        draw: entry.all.draw,
        lose: entry.all.lose,
        goalsFor: entry.all.goals.for,
        goalsAgainst: entry.all.goals.against,
        form: entry.form,
      })),
    }))
}

const STANDINGS_CACHE_KEY = 'worldcup:standings'

export async function getWorldcupStandings(): Promise<WorldCupStandingsResponse> {
  const cached = worldcupCache.get<CachedStandings>(STANDINGS_CACHE_KEY)
  if (cached) {
    wcLogger.info('service cache hit: standings', { cachedAt: cached.cachedAt })
    return cached
  }

  const envelope = await fetchApiFootball(
    'standings',
    { league: String(WORLDCUP_LEAGUE_ID), season: String(WORLDCUP_SEASON) },
    ApiFootballStandingsEnvelopeSchema,
    { allowEmptyResponse: true }
  )

  const groups = mapStandingsGroups(envelope)
  const payload: CachedStandings = { groups, cachedAt: new Date().toISOString() }

  worldcupCache.set(STANDINGS_CACHE_KEY, payload, TTL.STANDINGS_S)
  wcLogger.info('service fetched and cached standings', { groupCount: groups.length })

  return payload
}

// ─── Teams ────────────────────────────────────────────────────────────────────

const TEAMS_CACHE_KEY = 'worldcup:teams'

export async function getWorldcupTeams(): Promise<WorldCupTeamsResponse> {
  const cached = worldcupCache.get<CachedTeams>(TEAMS_CACHE_KEY)
  if (cached) {
    wcLogger.info('service cache hit: teams', { count: cached.teams.length })
    return cached
  }

  const envelope = await fetchApiFootball(
    'teams',
    { league: String(WORLDCUP_LEAGUE_ID), season: String(WORLDCUP_SEASON) },
    ApiFootballTeamsEnvelopeSchema,
    { allowEmptyResponse: true }
  )

  const teams = envelope.response.map(mapTeam)
  const payload: CachedTeams = { teams, cachedAt: new Date().toISOString() }

  worldcupCache.set(TEAMS_CACHE_KEY, payload, TTL.TEAMS_TTL_S)
  wcLogger.info('service fetched and cached teams', { count: teams.length })

  return payload
}

// ─── Live ─────────────────────────────────────────────────────────────────────

const LIVE_CACHE_KEY = 'worldcup:live'

export async function getWorldcupLive(): Promise<WorldCupLiveResponse> {
  const cached = worldcupCache.get<CachedLive>(LIVE_CACHE_KEY)
  if (cached) {
    wcLogger.info('service cache hit: live', { hasLive: cached.hasLive })
    return cached
  }

  // live=all returns fixtures across ALL competitions globally; filter to WC after.
  const envelope = await fetchApiFootball(
    'fixtures',
    { live: 'all' },
    ApiFootballFixturesEnvelopeSchema,
    { allowEmptyResponse: true }
  )

  const wcItems = envelope.response.filter((item) => item.league.id === WORLDCUP_LEAGUE_ID)
  const fixtures = wcItems.map(mapFixture)
  const hasLive = fixtures.length > 0

  const payload: CachedLive = { fixtures, hasLive, cachedAt: new Date().toISOString() }

  worldcupCache.set(LIVE_CACHE_KEY, payload, hasLive ? TTL.LIVE_TTL_ACTIVE_S : TTL.LIVE_TTL_IDLE_S)
  wcLogger.info('service fetched and cached live', { total: fixtures.length, hasLive })

  return payload
}
