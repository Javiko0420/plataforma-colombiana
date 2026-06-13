import { type NextRequest, NextResponse } from 'next/server'
import { TTL } from '@/lib/sports/worldcup/constants'
import { fetchApiFootball } from '@/lib/sports/worldcup/api-football-client'
import { worldcupCache } from '@/lib/sports/worldcup/cache'
import { ApiFootballFixturesEnvelopeSchema, HeadToHeadParamsSchema } from '@/lib/sports/worldcup/schemas'
import { mapFixtureWithLeague } from '@/lib/sports/worldcup/mappers'
import { ApiFootballError } from '@/lib/sports/worldcup/errors'
import { wcLogger } from '@/lib/sports/worldcup/logger'
import type { CachedHeadToHead } from '@/lib/sports/worldcup/types'

export const dynamic = 'force-dynamic'

// Sort both team IDs ascending so "9-6" and "6-9" share the same cache entry.
function normalizeH2H(teams: string): string {
  const [a, b] = teams.split('-').map(Number)
  return (a! <= b!) ? `${a}-${b}` : `${b}-${a}`
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const rawTeams = url.searchParams.get('teams')

  if (!rawTeams) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: "Missing required param 'teams' (format: 'A-B', e.g. '6-9')" } },
      { status: 400 }
    )
  }

  const parsed = HeadToHeadParamsSchema.safeParse({ teams: rawTeams })
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const message = issue
      ? `Invalid param 'teams': ${issue.message}`
      : "Invalid param 'teams': must be in format 'A-B' (e.g. '6-9')"
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message } },
      { status: 400 }
    )
  }

  const normalized = normalizeH2H(parsed.data.teams)
  const cacheKey = `worldcup:headtohead:${normalized}`

  const cached = worldcupCache.get<CachedHeadToHead>(cacheKey)
  if (cached) {
    wcLogger.info('cache hit: headtohead', { teams: normalized, cachedAt: cached.cachedAt })
    return NextResponse.json(cached)
  }

  try {
    // No league/season filter — h2h history spans all competitions.
    const envelope = await fetchApiFootball(
      'fixtures/headtohead',
      { h2h: normalized },
      ApiFootballFixturesEnvelopeSchema,
      { allowEmptyResponse: true }
    )

    const fixtures = envelope.response.map(mapFixtureWithLeague)
    const payload: CachedHeadToHead = { fixtures, cachedAt: new Date().toISOString() }

    worldcupCache.set(cacheKey, payload, TTL.HEADTOHEAD_TTL_S)
    wcLogger.info('fetched and cached headtohead', { teams: normalized, count: fixtures.length })

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof ApiFootballError) {
      wcLogger.error('headtohead endpoint error', { code: err.code, message: err.message })

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

    wcLogger.error('unexpected error in headtohead route', { err })
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } },
      { status: 500 }
    )
  }
}
