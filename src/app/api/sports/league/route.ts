import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchFixtures, fetchStandings, getSeasonForLeague, resolveSeasonForLeague, fetchStandingsByName } from '@/lib/football'
import { LEAGUE_NAMES, resolveLeagueByAlias } from '@/lib/leagues'

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

function resolveLeagueId(input: string): { id: number; name: string } | null {
  if (/^\d+$/.test(input)) return { id: Number(input), name: 'League' }
  return resolveLeagueByAlias(input)
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
