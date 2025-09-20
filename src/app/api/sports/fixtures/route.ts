import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchFixtures } from '@/lib/football'

export const runtime = 'nodejs'

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000)
const MAX_REQS = Number(process.env.RATE_LIMIT_MAX || 100)
const bucket = new Map<string, { count: number; ts: number }>()

const querySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  live: z.enum(['all', '1', '0']).optional(),
  league: z.string().regex(/^\d+$/).optional(),
  team: z.string().regex(/^\d+$/).optional(),
  season: z.string().regex(/^\d{4}$/).optional(),
  timezone: z.string().min(2).optional(),
})

export async function GET(request: NextRequest) {
  // Simple IP-based rate limit
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
  try {
    const fixtures = await fetchFixtures({
      date: q.date,
      live: q.live,
      league: q.league,
      team: q.team,
      season: q.season,
      timezone: q.timezone,
    })
    const res = NextResponse.json({ success: true, data: fixtures })
    // Cache API response briefly unless live requested
    const isLive = q.live === 'all' || q.live === '1'
    res.headers.set('Cache-Control', isLive ? 'public, s-maxage=5, stale-while-revalidate=5' : 'public, s-maxage=60, stale-while-revalidate=60')
    return res
  } catch {
    return NextResponse.json({ success: false, error: 'Sports fetch failed' }, { status: 502 })
  }
}


