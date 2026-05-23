import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchSportsSummary, getDefaultSeason } from '@/lib/football'

export const runtime = 'nodejs'

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000)
const MAX_REQS = Number(process.env.RATE_LIMIT_MAX || 100)
const bucket = new Map<string, { count: number; ts: number }>()

const querySchema = z.object({
  season: z.string().regex(/^\d{4}$/).optional(),
  timezone: z.string().optional(),
})

// Latin America first, then Europe. Each entry only ships if the env var is set.
const SUMMARY_LEAGUE_ENVS: ReadonlyArray<readonly [envKey: string, label: string]> = [
  // Latinoamérica
  ['LEAGUE_COLOMBIA_ID', 'Liga BetPlay (Colombia)'],
  ['LEAGUE_ARGENTINA_ID', 'Liga Profesional (Argentina)'],
  ['LEAGUE_BRAZIL_ID', 'Brasileirão (Brasil)'],
  ['LEAGUE_MEXICO_ID', 'Liga MX (México)'],
  ['LEAGUE_CHILE_ID', 'Primera División (Chile)'],
  ['LEAGUE_URUGUAY_ID', 'Primera División (Uruguay)'],
  ['LEAGUE_PERU_ID', 'Liga 1 (Perú)'],
  ['LEAGUE_ECUADOR_ID', 'LigaPro (Ecuador)'],
  ['LEAGUE_PARAGUAY_ID', 'Primera División (Paraguay)'],
  ['LEAGUE_LIBERTADORES_ID', 'CONMEBOL Libertadores'],
  ['LEAGUE_SUDAMERICANA_ID', 'CONMEBOL Sudamericana'],
  // Europa
  ['LEAGUE_SPAIN_ID', 'LaLiga (España)'],
  ['LEAGUE_ENGLAND_ID', 'Premier League (Inglaterra)'],
  ['LEAGUE_ITALY_ID', 'Serie A (Italia)'],
  ['LEAGUE_GERMANY_ID', 'Bundesliga (Alemania)'],
  ['LEAGUE_FRANCE_ID', 'Ligue 1 (Francia)'],
  ['LEAGUE_CHAMPIONS_ID', 'UEFA Champions League'],
  ['LEAGUE_EUROPA_ID', 'UEFA Europa League'],
] as const

function readEnvLeagues() {
  const out: Array<{ id: number; name: string }> = []
  for (const [envKey, label] of SUMMARY_LEAGUE_ENVS) {
    const id = Number(process.env[envKey as keyof NodeJS.ProcessEnv])
    if (Number.isFinite(id) && id > 0) out.push({ id, name: label })
  }
  return out
}

// function readEnvNationalTeams(): number[] {
//   const ids = [
//     process.env.TEAM_COLOMBIA_ID,
//     process.env.TEAM_SPAIN_ID,
//     process.env.TEAM_ENGLAND_ID,
//     process.env.TEAM_GERMANY_ID,
//   ]
//   return ids.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0)
// }

export async function GET(request: NextRequest) {
  // Rate limit
  const key = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const rec = bucket.get(key)
  if (!rec || now - rec.ts > WINDOW_MS) {
    bucket.set(key, { count: 1, ts: now })
  } else {
    rec.count += 1
    if (rec.count > MAX_REQS) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 })
    }
  }

  const url = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid query' }, { status: 400 })
  }

  const season = parsed.data.season ? String(parsed.data.season) : getDefaultSeason()
  // const timezone = parsed.data.timezone || process.env.SPORTS_DEFAULT_TIMEZONE || 'America/Bogota'
  const leagues = readEnvLeagues()
  // const nationalTeamIds = readEnvNationalTeams()

  try {
    const summary = await fetchSportsSummary({ leagues, season })
    const res = NextResponse.json({ success: true, data: summary })
    res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=30')
    return res
  } catch {
    return NextResponse.json({ success: false, error: 'Sports summary failed' }, { status: 502 })
  }
}


