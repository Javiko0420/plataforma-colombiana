// FIFA World Cup 2026 — API-Football v3 constants
// League ID 1 = FIFA World Cup on api-sports.io

export const WORLDCUP_LEAGUE_ID = 1
export const WORLDCUP_SEASON = 2026
export const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io'

// Cache TTLs in seconds
export const TTL = {
  /** Coverage / league metadata: changes only when FIFA updates the schedule. */
  COVERAGE_S: 24 * 60 * 60, // 24 hours
  /** Group-stage standings: relevant once matches start (July 2026). */
  STANDINGS_S: 60 * 60, // 1 hour
  /** Fixtures for a given date. */
  FIXTURES_S: 5 * 60, // 5 minutes
  /** Full fixture schedule (no live filter) — used by /worldcup/fixtures. */
  FIXTURES_DAILY_S: 86_400, // 24 hours
  /** Round list — rarely changes once the tournament schedule is published. */
  ROUNDS_TTL_S: 86_400, // 24 hours
  /** Live fixtures — aggressive refresh while World Cup matches are in progress. */
  LIVE_TTL_ACTIVE_S: 15,
  /** Live fixtures — idle poll when no World Cup match is currently playing. */
  LIVE_TTL_IDLE_S: 300, // 5 minutes
  /** Live fixtures during matches. */
  FIXTURES_LIVE_S: 30, // 30 seconds
  /** Team roster — rarely changes once the WC squad is published. */
  TEAMS_TTL_S: 86_400, // 24 hours
  /** Head-to-head history — static once the WC squad is determined. */
  HEADTOHEAD_TTL_S: 86_400, // 24 hours
} as const
