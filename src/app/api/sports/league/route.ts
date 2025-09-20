import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchFixtures, fetchStandings, getDefaultSeason, fetchStandingsByName } from '@/lib/sports'
import { TSDB_LEAGUE_NAMES } from '@/lib/leagues'

export const runtime = 'nodejs'

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000)
const MAX_REQS = Number(process.env.RATE_LIMIT_MAX || 100)
const bucket = new Map<string, { count: number; ts: number }>()

const querySchema = z.object({
  league: z.string().min(1), // may be alias like 'colombia' or numeric id
  season: z.string().regex(/^\d{4}$/).optional(),
  timezone: z.string().optional(),
  include: z
    .string()
    .transform((v) => (v ? v.split(',').map((s) => s.trim().toLowerCase()) : []))
    .optional(), // e.g. 'results,standings'
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), // for results filter
  live: z.enum(['all', '1', '0']).optional(),
})

function resolveLeagueId(input: string): { id: number; name: string } | null {
  // Accept numeric ID directly
  if (/^\d+$/.test(input)) return { id: Number(input), name: 'League' }

  // Aliases -> env IDs
  const alias = input.toLowerCase()
  const mapping: Record<string, { env: string; name: string }> = {
    colombia: { env: 'LEAGUE_COLOMBIA_ID', name: 'Liga Colombiana' },
    spain: { env: 'LEAGUE_SPAIN_ID', name: 'La Liga' },
    england: { env: 'LEAGUE_ENGLAND_ID', name: 'Premier League' },
    germany: { env: 'LEAGUE_GERMANY_ID', name: 'Bundesliga' },
    ucl: { env: 'LEAGUE_CHAMPIONS_ID', name: 'Champions League' },
    champions: { env: 'LEAGUE_CHAMPIONS_ID', name: 'Champions League' },
    uel: { env: 'LEAGUE_EUROPA_ID', name: 'Europa League' },
    europa: { env: 'LEAGUE_EUROPA_ID', name: 'Europa League' },
  }
  const conf = mapping[alias]
  if (!conf) return null
  const id = Number(process.env[conf.env as keyof NodeJS.ProcessEnv])
  if (!Number.isFinite(id) || id <= 0) return null
  return { id, name: conf.name }
}

export async function GET(request: NextRequest) {
  // Basic rate limit
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
  const leagueName = TSDB_LEAGUE_NAMES[alias]
  if (!resolved && !leagueName && !/^\d+$/.test(q.league)) {
    return NextResponse.json({ success: false, error: 'Unknown league' }, { status: 404 })
  }

  const season = q.season ? String(q.season) : getDefaultSeason()
  // const timezone = q.timezone || process.env.SPORTS_DEFAULT_TIMEZONE || 'America/Bogota'
  const include = new Set((q.include ?? ['results', 'standings']).map((s) => s.toLowerCase()))
  const date = q.date || new Date().toISOString().slice(0, 10)

  try {
    const [results, standings] = await Promise.all([
      include.has('results')
        ? (resolved ? fetchFixtures({ league: resolved.id, date }) : fetchFixtures({ league: leagueName || q.league, date })).catch(() => [])
        : Promise.resolve([]),
      include.has('standings')
        ? (resolved ? fetchStandings(resolved.id, season) : fetchStandingsByName(leagueName || q.league, season)).catch(() => [])
        : Promise.resolve([]),
    ])
    const leagueInfo = resolved || { id: 0, name: leagueName || q.league }
    return NextResponse.json({ success: true, data: { league: leagueInfo, season, results, standings } })
  } catch {
    return NextResponse.json({ success: false, error: 'League fetch failed' }, { status: 502 })
  }
}


