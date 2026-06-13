// Types for the worldcup module — inferred from Zod schemas where possible.
// Import from schemas.ts for Zod-inferred types; add manual types here only
// when they can't be derived from schemas.

export type {
  WorldCupCoverage,
  SeasonCoverage,
  LeagueInfo,
  WorldCupFixture,
  WorldCupFixturesResponse,
  WorldCupStandingsGroup,
  WorldCupStandingsResponse,
  WorldCupRoundsResponse,
  WorldCupLiveResponse,
  WorldCupFixtureDetailResponse,
  WorldCupTeam,
  WorldCupTeamsResponse,
  WorldCupH2HFixture,
  WorldCupHeadToHeadResponse,
} from './schemas'

/** Cached coverage payload stored in CacheStore. */
export type CachedCoverage = {
  league: import('./schemas').LeagueInfo
  season: number
  coverage: import('./schemas').SeasonCoverage
  cachedAt: string
}

/** Cached fixtures payload stored in CacheStore. */
export type CachedFixtures = {
  fixtures: import('./schemas').WorldCupFixture[]
  cachedAt: string
}

/** Cached standings payload stored in CacheStore. */
export type CachedStandings = {
  groups: import('./schemas').WorldCupStandingsGroup[]
  cachedAt: string
}

/** Cached rounds payload stored in CacheStore. */
export type CachedRounds = {
  rounds: string[]
  current: string | null
  cachedAt: string
}

/** Cached live fixtures payload stored in CacheStore. */
export type CachedLive = {
  fixtures: import('./schemas').WorldCupFixture[]
  hasLive: boolean
  cachedAt: string
}

/** Cached fixture detail payload stored in CacheStore. */
export type CachedFixtureDetail = import('./schemas').WorldCupFixtureDetailResponse

/** Cached head-to-head payload stored in CacheStore. */
export type CachedHeadToHead = import('./schemas').WorldCupHeadToHeadResponse

/** Cached teams payload stored in CacheStore. */
export type CachedTeams = import('./schemas').WorldCupTeamsResponse
