import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { searchTeams } from '@/lib/sports'

export const runtime = 'nodejs'

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000)
const MAX_REQS = Number(process.env.RATE_LIMIT_MAX || 100)
const bucket = new Map<string, { count: number; ts: number }>()

const querySchema = z.object({
  query: z.string().min(2).max(64),
})

export async function GET(request: NextRequest) {
  // Basic IP rate limit
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

  try {
    const teams = await searchTeams(parsed.data.query)
    const res = NextResponse.json({ success: true, data: teams })
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60')
    return res
  } catch {
    return NextResponse.json({ success: false, error: 'Team search failed' }, { status: 502 })
  }
}


