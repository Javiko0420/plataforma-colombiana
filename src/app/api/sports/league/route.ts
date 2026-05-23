import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchFixtures, fetchStandings, getSeasonForLeague, resolveSeasonForLeague, fetchStandingsByName } from '@/lib/football'
import { LEAGUE_NAMES } from '@/lib/leagues'

export const runtime = 'nodejs'

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000)
const MAX_REQS = Number(process.env.RATE_LIMIT_MAX || 100)
const bucket = new Map<string, { count: number; ts: number }>()

const querySchema = z.object({
  league: z.string().min(1), // alias (e.g. 'colombia') or numeric API-Football ID
  season: z.string().regex(/^\d{4}$/).optional(),
  timezone: z.string().optional(),
  include: z
    .string()
    .transform((v) => (v ? v.split(',').map((s) => s.trim().toLowerCase()) : []))
    .optional(), // e.g. 'results,standings'
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  live: z.enum(['all', '1', '0']).optional(),
})

// Map our public aliases to env-var-backed API-Football league IDs.
// Latin America first, then Europe (matches user-facing priority).
const ALIAS_TO_ENV: Record<string, { env: string; name: string }> = {
  // Latinoamérica
  colombia: { env: 'LEAGUE_COLOMBIA_ID', name: 'Liga BetPlay' },
  argentina: { env: 'LEAGUE_ARGENTINA_ID', name: 'Liga Profesional Argentina' },
  brazil: { env: 'LEAGUE_BRAZIL_ID', name: 'Brasileirão Série A' },
  mexico: { env: 'LEAGUE_MEXICO_ID', name: 'Liga MX' },
  chile: { env: 'LEAGUE_CHILE_ID', name: 'Primera División (Chile)' },
  uruguay: { env: 'LEAGUE_URUGUAY_ID', name: 'Primera División (Uruguay)' },
  peru: { env: 'LEAGUE_PERU_ID', name: 'Liga 1 (Perú)' },
  ecuador: { env: 'LEAGUE_ECUADOR_ID', name: 'LigaPro' },
  paraguay: { env: 'LEAGUE_PARAGUAY_ID', name: 'Primera División (Paraguay)' },
  bolivia: { env: 'LEAGUE_BOLIVIA_ID', name: 'Primera División (Bolivia)' },
  venezuela: { env: 'LEAGUE_VENEZUELA_ID', name: 'Primera División (Venezuela)' },
  libertadores: { env: 'LEAGUE_LIBERTADORES_ID', name: 'CONMEBOL Libertadores' },
  sudamericana: { env: 'LEAGUE_SUDAMERICANA_ID', name: 'CONMEBOL Sudamericana' },
  // Europa
  spain: { env: 'LEAGUE_SPAIN_ID', name: 'LaLiga' },
  england: { env: 'LEAGUE_ENGLAND_ID', name: 'Premier League' },
  italy: { env: 'LEAGUE_ITALY_ID', name: 'Serie A' },
  germany: { env: 'LEAGUE_GERMANY_ID', name: 'Bundesliga' },
  france: { env: 'LEAGUE_FRANCE_ID', name: 'Ligue 1' },
  portugal: { env: 'LEAGUE_PORTUGAL_ID', name: 'Primeira Liga' },
  netherlands: { env: 'LEAGUE_NETHERLANDS_ID', name: 'Eredivisie' },
  ucl: { env: 'LEAGUE_CHAMPIONS_ID', name: 'UEFA Champions League' },
  champions: { env: 'LEAGUE_CHAMPIONS_ID', name: 'UEFA Champions League' },
  uel: { env: 'LEAGUE_EUROPA_ID', name: 'UEFA Europa League' },
  europa: { env: 'LEAGUE_EUROPA_ID', name: 'UEFA Europa League' },
  conference: { env: 'LEAGUE_CONFERENCE_ID', name: 'UEFA Europa Conference League' },
}

function resolveLeagueId(input: string): { id: number; name: string } | null {
  if (/^\d+$/.test(input)) return { id: Number(input), name: 'League' }
  const conf = ALIAS_TO_ENV[input.toLowerCase()]
  if (!conf) return null
  const id = Number(process.env[conf.env as keyof NodeJS.ProcessEnv])
  if (!Number.isFinite(id) || id <= 0) return null
  return { id, name: conf.name }
}

export async function GET(request: NextRequest) {
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
  const q = parsed.data

  const resolved = resolveLeagueId(q.league)
  const alias = q.league.toLowerCase()
  // Fallback to canonical league name search if no env-backed alias resolves.
  const leagueName = LEAGUE_NAMES[alias]
  if (!resolved && !leagueName && !/^\d+$/.test(q.league)) {
    return NextResponse.json({ success: false, error: 'Unknown league' }, { status: 404 })
  }

  const season = q.season ? Number(q.season) : resolved ? await resolveSeasonForLeague(resolved.id) : getSeasonForLeague(0)
  const include = new Set((q.include ?? ['results', 'standings']).map((s) => s.toLowerCase()))
  const date = q.date || new Date().toISOString().slice(0, 10)

  try {
    const [results, standings] = await Promise.all([
      include.has('results')
        ? (resolved
            ? fetchFixtures({ league: resolved.id, season, date }).catch(() => [])
            : Promise.resolve([]))
        : Promise.resolve([]),
      include.has('standings')
        ? (resolved
            ? fetchStandings(resolved.id, season).catch(() => [])
            : fetchStandingsByName(leagueName as string, season).catch(() => []))
        : Promise.resolve([]),
    ])
    const leagueInfo = resolved || { id: 0, name: leagueName || q.league }
    return NextResponse.json({ success: true, data: { league: leagueInfo, season, results, standings } })
  } catch {
    return NextResponse.json({ success: false, error: 'League fetch failed' }, { status: 502 })
  }
}
