import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchSportsSummary, getDefaultSeason } from '@/lib/sports'

export const runtime = 'nodejs'

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000)
const MAX_REQS = Number(process.env.RATE_LIMIT_MAX || 100)
const bucket = new Map<string, { count: number; ts: number }>()

const querySchema = z.object({
  season: z.string().regex(/^\d{4}$/).optional(),
  timezone: z.string().optional(),
})

function readEnvLeagues() {
  const pairs: Array<[string, string | undefined]> = [
    ['LEAGUE_ENGLAND_ID', process.env.LEAGUE_ENGLAND_ID],
    ['LEAGUE_SPAIN_ID', process.env.LEAGUE_SPAIN_ID],
    ['LEAGUE_GERMANY_ID', process.env.LEAGUE_GERMANY_ID],
    ['LEAGUE_CHAMPIONS_ID', process.env.LEAGUE_CHAMPIONS_ID],
    ['LEAGUE_EUROPA_ID', process.env.LEAGUE_EUROPA_ID],
    ['LEAGUE_COLOMBIA_ID', process.env.LEAGUE_COLOMBIA_ID],
  ]
  const label: Record<string, string> = {
    LEAGUE_ENGLAND_ID: 'Premier League',
    LEAGUE_SPAIN_ID: 'La Liga',
    LEAGUE_GERMANY_ID: 'Bundesliga',
    LEAGUE_CHAMPIONS_ID: 'Champions League',
    LEAGUE_EUROPA_ID: 'Europa League',
    LEAGUE_COLOMBIA_ID: 'Liga Colombiana',
  }
  const out: Array<{ id: number; name: string }> = []
  for (const [key, val] of pairs) {
    const id = Number(val)
    if (Number.isFinite(id) && id > 0) out.push({ id, name: label[key] })
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


