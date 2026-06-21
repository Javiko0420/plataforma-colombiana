// FIFA World Cup 2026 — API-Football v3 constants
// League ID 1 = FIFA World Cup on api-sports.io

export const WORLDCUP_LEAGUE_ID = 1
export const WORLDCUP_SEASON = 2026
export const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io'

/** Team ID de la selección Colombia en API-Football (usado por el widget del home). */
export const COLOMBIA_TEAM_ID = 8

/**
 * Default sunset instant for the temporary World Cup campaign in the mobile app.
 * After this moment the /config endpoint reports `enabled: false` and the mobile
 * Sports section returns to its previous state. 2026-07-20 00:00 America/Bogota
 * (UTC-5, no DST) — i.e. the day AFTER the final (19 Jul 2026), which stays live.
 * Overridable at runtime via the WORLDCUP_SUNSET_AT environment variable.
 */
export const WORLDCUP_DEFAULT_SUNSET_AT = '2026-07-20T00:00:00-05:00'

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
