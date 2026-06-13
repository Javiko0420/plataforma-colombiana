import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { WORLDCUP_LEAGUE_ID, WORLDCUP_SEASON, TTL } from '@/lib/sports/worldcup/constants'
import { fetchApiFootball } from '@/lib/sports/worldcup/api-football-client'
import { worldcupCache } from '@/lib/sports/worldcup/cache'
import { ApiFootballFixturesEnvelopeSchema } from '@/lib/sports/worldcup/schemas'
import { mapFixture } from '@/lib/sports/worldcup/mappers'
import { ApiFootballError } from '@/lib/sports/worldcup/errors'
import { wcLogger } from '@/lib/sports/worldcup/logger'
import type { CachedFixtures } from '@/lib/sports/worldcup/types'

export const dynamic = 'force-dynamic'

const querySchema = z.object({
  round: z.string().optional(),
  // coerce from query string; must be a positive integer
  team: z.coerce.number().int().positive().optional(),
  // z.string().date() validates YYYY-MM-DD (rejects "13/06/2026", "2026-13-45", etc.)
  date: z.string().date().optional(),
})

function buildCacheKey(round: string | undefined, team: number | undefined, date: string | undefined): string {
  return `worldcup:fixtures:${round ?? 'none'}:${team ?? 'none'}:${date ?? 'none'}`
}


export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams))

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    const message = firstIssue
      ? `Invalid param '${firstIssue.path.join('.')}': ${firstIssue.message}`
      : 'Invalid query parameters'
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message } },
      { status: 400 }
    )
  }

  const { round, team, date } = parsed.data
  const cacheKey = buildCacheKey(round, team, date)

  const cached = worldcupCache.get<CachedFixtures>(cacheKey)
  if (cached) {
    wcLogger.info('cache hit: fixtures', { cacheKey })
    return NextResponse.json(cached)
  }

  const upstreamParams: Record<string, string> = {
    league: String(WORLDCUP_LEAGUE_ID),
    season: String(WORLDCUP_SEASON),
  }
  if (round !== undefined) upstreamParams.round = round
  if (team !== undefined) upstreamParams.team = String(team)
  if (date !== undefined) upstreamParams.date = date

  try {
    const envelope = await fetchApiFootball(
      'fixtures',
      upstreamParams,
      ApiFootballFixturesEnvelopeSchema,
      { allowEmptyResponse: true }
    )

    const fixtures = envelope.response.map(mapFixture)
    const payload: CachedFixtures = { fixtures, cachedAt: new Date().toISOString() }

    worldcupCache.set(cacheKey, payload, TTL.FIXTURES_DAILY_S)
    wcLogger.info('fetched and cached fixtures', { count: fixtures.length, cacheKey })

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof ApiFootballError) {
      wcLogger.error('fixtures endpoint error', { code: err.code, message: err.message })

      if (err.code === 'UPSTREAM_ERROR') {
        return NextResponse.json(
          { error: { code: 'UPSTREAM_ERROR', message: err.message } },
          { status: 502 }
        )
      }

      if (err.code === 'TIMEOUT') {
        return NextResponse.json(
          { error: { code: 'TIMEOUT', message: err.message } },
          { status: 504 }
        )
      }

      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: err.message } },
        { status: 500 }
      )
    }

    wcLogger.error('unexpected error in fixtures route', { err })
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } },
      { status: 500 }
    )
  }
}
