// IDs oficiales de API-FOOTBALL v3 para las principales ligas y copas
// Fuente: Documentación API-FOOTBALL v3
export const LEAGUES = {
  // 🌍 Europa - Top 5
  PREMIER_LEAGUE: 39,   // Inglaterra
  LALIGA: 140,          // España
  SERIE_A: 135,         // Italia
  BUNDESLIGA: 78,       // Alemania
  LIGUE_1: 61,          // Francia

  // 🇪🇺 Otras ligas importantes
  PRIMEIRA_LIGA: 94,    // Portugal
  EREDIVISIE: 88,       // Países Bajos
  JUPILER_PRO: 144,     // Bélgica
  SUPER_LIG: 203,       // Turquía
  SUPER_LEAGUE_GR: 197, // Grecia

  // 🏆 Competiciones UEFA
  CHAMPIONS_LEAGUE: 2,
  EUROPA_LEAGUE: 3,
  CONFERENCE_LEAGUE: 848,
  UEFA_SUPERCUP: 531,

  // 🇨🇴 Colombia
  COLOMBIA_PRIMERA_A: 239,
} as const

export type LeagueId = (typeof LEAGUES)[keyof typeof LEAGUES]

// Nombres oficiales usados por TheSportsDB (strLeague) para filtrar/buscar
export const TSDB_LEAGUE_NAMES: Record<string, string> = {
  england: 'English Premier League',
  spain: 'Spanish La Liga',
  italy: 'Italian Serie A',
  germany: 'German Bundesliga',
  france: 'French Ligue 1',
  ucl: 'UEFA Champions League',
  europa: 'UEFA Europa League',
  colombia: 'Colombian Primera A'
}


