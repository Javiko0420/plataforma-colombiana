// Official API-Football v3 league IDs.
// Priority focus: Latin American + European soccer/football competitions.
// Source: https://www.api-football.com/documentation-v3#tag/Leagues
export const LEAGUES = {
  // Latinoamérica - Ligas nacionales
  COLOMBIA_PRIMERA_A: 239, // Liga BetPlay Dimayor
  ARGENTINA_PRIMERA: 128, // Liga Profesional Argentina
  BRAZIL_SERIE_A: 71, // Brasileirão Série A
  BRAZIL_SERIE_B: 72,
  MEXICO_LIGA_MX: 262, // Liga MX
  CHILE_PRIMERA: 265, // Primera División de Chile
  URUGUAY_PRIMERA: 268, // Primera División de Uruguay
  PERU_LIGA_1: 281, // Liga 1 Perú
  ECUADOR_LIGA_PRO: 242, // LigaPro Ecuador
  PARAGUAY_PRIMERA: 284, // Primera División de Paraguay
  BOLIVIA_PRIMERA: 344, // División Profesional de Bolivia
  VENEZUELA_PRIMERA: 299, // Primera División de Venezuela

  // Latinoamérica - Copas continentales
  COPA_LIBERTADORES: 13,
  COPA_SUDAMERICANA: 11,
  COPA_AMERICA: 9,

  // Europa - Top 5
  PREMIER_LEAGUE: 39, // Inglaterra
  LALIGA: 140, // España
  SERIE_A: 135, // Italia
  BUNDESLIGA: 78, // Alemania
  LIGUE_1: 61, // Francia

  // Europa - Otras ligas relevantes
  PRIMEIRA_LIGA: 94, // Portugal
  EREDIVISIE: 88, // Países Bajos
  JUPILER_PRO: 144, // Bélgica
  SUPER_LIG: 203, // Turquía
  SUPER_LEAGUE_GR: 197, // Grecia

  // Europa - Competiciones UEFA
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  CONFERENCE_LEAGUE: 848,
  UEFA_SUPERCUP: 531,
} as const

export type LeagueId = (typeof LEAGUES)[keyof typeof LEAGUES]

// Leagues that follow calendar year (Jan–Dec) in API-Football's `season` param.
export const CALENDAR_YEAR_LEAGUE_IDS = new Set<number>([
  LEAGUES.COLOMBIA_PRIMERA_A,
  LEAGUES.ARGENTINA_PRIMERA,
  LEAGUES.BRAZIL_SERIE_A,
  LEAGUES.BRAZIL_SERIE_B,
  LEAGUES.MEXICO_LIGA_MX,
  LEAGUES.CHILE_PRIMERA,
  LEAGUES.URUGUAY_PRIMERA,
  LEAGUES.PERU_LIGA_1,
  LEAGUES.ECUADOR_LIGA_PRO,
  LEAGUES.PARAGUAY_PRIMERA,
  LEAGUES.BOLIVIA_PRIMERA,
  LEAGUES.VENEZUELA_PRIMERA,
  LEAGUES.COPA_LIBERTADORES,
  LEAGUES.COPA_SUDAMERICANA,
  LEAGUES.COPA_AMERICA,
])

// Canonical league names accepted by API-Football's `/leagues?search=` endpoint.
// Used as a fallback when only an alias (no numeric ID) is provided.
export const LEAGUE_NAMES: Record<string, string> = {
  // Latinoamérica
  colombia: 'Primera A',
  argentina: 'Primera División',
  brazil: 'Serie A',
  mexico: 'Liga MX',
  chile: 'Primera División',
  uruguay: 'Primera División',
  peru: 'Liga 1',
  ecuador: 'Liga Pro',
  paraguay: 'Primera División',
  bolivia: 'Primera División',
  venezuela: 'Primera División',
  libertadores: 'CONMEBOL Libertadores',
  sudamericana: 'CONMEBOL Sudamericana',
  copaamerica: 'Copa America',

  // Europa
  england: 'Premier League',
  spain: 'La Liga',
  italy: 'Serie A',
  germany: 'Bundesliga',
  france: 'Ligue 1',
  portugal: 'Primeira Liga',
  netherlands: 'Eredivisie',
  belgium: 'Jupiler Pro League',
  ucl: 'UEFA Champions League',
  champions: 'UEFA Champions League',
  uel: 'UEFA Europa League',
  europa: 'UEFA Europa League',
  conference: 'UEFA Europa Conference League',
}

/** Platform leagues shown in /deportes and sports APIs (LatAm first, then Europe). */
export type PlatformLeagueDef = {
  alias: string
  envKey: string
  defaultId: number
  i18nKey: string
  label: string
}

export const PLATFORM_LEAGUE_DEFS: readonly PlatformLeagueDef[] = [
  // Latinoamérica
  { alias: 'colombia', envKey: 'LEAGUE_COLOMBIA_ID', defaultId: LEAGUES.COLOMBIA_PRIMERA_A, i18nKey: 'sports.league.co', label: 'Liga BetPlay (Colombia)' },
  { alias: 'argentina', envKey: 'LEAGUE_ARGENTINA_ID', defaultId: LEAGUES.ARGENTINA_PRIMERA, i18nKey: 'sports.league.ar', label: 'Liga Profesional (Argentina)' },
  { alias: 'brazil', envKey: 'LEAGUE_BRAZIL_ID', defaultId: LEAGUES.BRAZIL_SERIE_A, i18nKey: 'sports.league.br', label: 'Brasileirão (Brasil)' },
  { alias: 'mexico', envKey: 'LEAGUE_MEXICO_ID', defaultId: LEAGUES.MEXICO_LIGA_MX, i18nKey: 'sports.league.mx', label: 'Liga MX (México)' },
  { alias: 'chile', envKey: 'LEAGUE_CHILE_ID', defaultId: LEAGUES.CHILE_PRIMERA, i18nKey: 'sports.league.cl', label: 'Primera División (Chile)' },
  { alias: 'uruguay', envKey: 'LEAGUE_URUGUAY_ID', defaultId: LEAGUES.URUGUAY_PRIMERA, i18nKey: 'sports.league.uy', label: 'Primera División (Uruguay)' },
  { alias: 'peru', envKey: 'LEAGUE_PERU_ID', defaultId: LEAGUES.PERU_LIGA_1, i18nKey: 'sports.league.pe', label: 'Liga 1 (Perú)' },
  { alias: 'ecuador', envKey: 'LEAGUE_ECUADOR_ID', defaultId: LEAGUES.ECUADOR_LIGA_PRO, i18nKey: 'sports.league.ec', label: 'LigaPro (Ecuador)' },
  { alias: 'paraguay', envKey: 'LEAGUE_PARAGUAY_ID', defaultId: LEAGUES.PARAGUAY_PRIMERA, i18nKey: 'sports.league.py', label: 'Primera División (Paraguay)' },
  { alias: 'libertadores', envKey: 'LEAGUE_LIBERTADORES_ID', defaultId: LEAGUES.COPA_LIBERTADORES, i18nKey: 'sports.league.libertadores', label: 'CONMEBOL Libertadores' },
  { alias: 'sudamericana', envKey: 'LEAGUE_SUDAMERICANA_ID', defaultId: LEAGUES.COPA_SUDAMERICANA, i18nKey: 'sports.league.sudamericana', label: 'CONMEBOL Sudamericana' },
  // Europa
  { alias: 'spain', envKey: 'LEAGUE_SPAIN_ID', defaultId: LEAGUES.LALIGA, i18nKey: 'sports.league.es', label: 'LaLiga (España)' },
  { alias: 'england', envKey: 'LEAGUE_ENGLAND_ID', defaultId: LEAGUES.PREMIER_LEAGUE, i18nKey: 'sports.league.en', label: 'Premier League (Inglaterra)' },
  { alias: 'italy', envKey: 'LEAGUE_ITALY_ID', defaultId: LEAGUES.SERIE_A, i18nKey: 'sports.league.it', label: 'Serie A (Italia)' },
  { alias: 'germany', envKey: 'LEAGUE_GERMANY_ID', defaultId: LEAGUES.BUNDESLIGA, i18nKey: 'sports.league.de', label: 'Bundesliga (Alemania)' },
  { alias: 'france', envKey: 'LEAGUE_FRANCE_ID', defaultId: LEAGUES.LIGUE_1, i18nKey: 'sports.league.fr', label: 'Ligue 1 (Francia)' },
  { alias: 'ucl', envKey: 'LEAGUE_CHAMPIONS_ID', defaultId: LEAGUES.CHAMPIONS_LEAGUE, i18nKey: 'sports.league.ucl', label: 'UEFA Champions League' },
  { alias: 'europa', envKey: 'LEAGUE_EUROPA_ID', defaultId: LEAGUES.EUROPA_LEAGUE, i18nKey: 'sports.league.uel', label: 'UEFA Europa League' },
] as const

/** Default standings on /deportes (keeps API usage within Vercel + rate limits). */
export const DEFAULT_STANDINGS_ALIASES: readonly string[] = [
  'colombia',
  'argentina',
  'libertadores',
  'spain',
  'england',
  'italy',
  'germany',
  'france',
  'ucl',
] as const

/** Cup / continental IDs — skipped when inferring a team's domestic league. */
export const CONTINENTAL_CUP_LEAGUE_IDS = new Set<number>([
  LEAGUES.COPA_LIBERTADORES,
  LEAGUES.COPA_SUDAMERICANA,
  LEAGUES.COPA_AMERICA,
  LEAGUES.CHAMPIONS_LEAGUE,
  LEAGUES.EUROPA_LEAGUE,
  LEAGUES.CONFERENCE_LEAGUE,
  LEAGUES.UEFA_SUPERCUP,
])

/** Read league ID from env, falling back to baked-in API-Football default (for Vercel/prod). */
export function resolveLeagueIdFromEnv(envKey: string, defaultId: number): number {
  const fromEnv = Number(process.env[envKey as keyof NodeJS.ProcessEnv])
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv
  return defaultId
}

export function resolveLeagueByAlias(alias: string): { id: number; name: string } | null {
  const key = alias.toLowerCase()
  const def = PLATFORM_LEAGUE_DEFS.find((d) => d.alias === key)
  if (!def) return null
  return { id: resolveLeagueIdFromEnv(def.envKey, def.defaultId), name: def.label }
}

export function getActivePlatformLeagues(
  nameFor: (i18nKey: string) => string
): Array<{ alias: string; id: number; name: string }> {
  return PLATFORM_LEAGUE_DEFS.map((def) => ({
    alias: def.alias,
    id: resolveLeagueIdFromEnv(def.envKey, def.defaultId),
    name: nameFor(def.i18nKey),
  }))
}

export function getDefaultStandingsLeagues(
  nameFor: (i18nKey: string) => string
): Array<{ alias: string; id: number; name: string }> {
  const aliasSet = new Set(DEFAULT_STANDINGS_ALIASES)
  return PLATFORM_LEAGUE_DEFS.filter((def) => aliasSet.has(def.alias)).map((def) => ({
    alias: def.alias,
    id: resolveLeagueIdFromEnv(def.envKey, def.defaultId),
    name: nameFor(def.i18nKey),
  }))
}

export function getPlatformLeagueById(
  leagueId: number,
  nameFor: (i18nKey: string) => string
): { alias: string; id: number; name: string } | null {
  const def = PLATFORM_LEAGUE_DEFS.find(
    (d) => resolveLeagueIdFromEnv(d.envKey, d.defaultId) === leagueId
  )
  if (!def) return null
  return {
    alias: def.alias,
    id: leagueId,
    name: nameFor(def.i18nKey),
  }
}

/** Default standings + extra leagues (e.g. from team search), deduped by id. */
export function mergeStandingsLeagues(
  base: Array<{ alias: string; id: number; name: string }>,
  extra: Array<{ alias: string; id: number; name: string }>
): Array<{ alias: string; id: number; name: string }> {
  const seen = new Set<number>()
  const out: Array<{ alias: string; id: number; name: string }> = []
  for (const lg of [...base, ...extra]) {
    if (seen.has(lg.id)) continue
    seen.add(lg.id)
    out.push(lg)
  }
  return out
}

export function getPlatformLeaguesForSummary(): Array<{ id: number; name: string }> {
  const aliasSet = new Set(DEFAULT_STANDINGS_ALIASES)
  return PLATFORM_LEAGUE_DEFS.filter((def) => aliasSet.has(def.alias)).map((def) => ({
    id: resolveLeagueIdFromEnv(def.envKey, def.defaultId),
    name: def.label,
  }))
}
