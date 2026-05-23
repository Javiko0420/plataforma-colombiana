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
