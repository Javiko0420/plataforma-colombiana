import { NextResponse } from 'next/server'
import { WORLDCUP_LEAGUE_ID, WORLDCUP_SEASON, TTL } from '@/lib/sports/worldcup/constants'
import { fetchApiFootball } from '@/lib/sports/worldcup/api-football-client'
import { worldcupCache } from '@/lib/sports/worldcup/cache'
import { ApiFootballEnvelopeSchema } from '@/lib/sports/worldcup/schemas'
import { ApiFootballError } from '@/lib/sports/worldcup/errors'
import { wcLogger } from '@/lib/sports/worldcup/logger'
import type { CachedCoverage } from '@/lib/sports/worldcup/types'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'worldcup:coverage'

export async function GET() {
  const cached = worldcupCache.get<CachedCoverage>(CACHE_KEY)
  if (cached) {
    wcLogger.info('cache hit: coverage', { cachedAt: cached.cachedAt })
    return NextResponse.json(cached)
  }

  try {
    const envelope = await fetchApiFootball(
      'leagues',
      { id: String(WORLDCUP_LEAGUE_ID), season: String(WORLDCUP_SEASON) },
      ApiFootballEnvelopeSchema
    )

    const entry = envelope.response[0]
    if (!entry) {
      throw new ApiFootballError('EMPTY_RESPONSE', 'No league entry found for World Cup 2026')
    }

    const season2026 = entry.seasons.find((s) => s.year === WORLDCUP_SEASON)
    if (!season2026) {
      throw new ApiFootballError(
        'EMPTY_RESPONSE',
        `Season ${WORLDCUP_SEASON} not found in API response`
      )
    }

    const payload: CachedCoverage = {
      league: {
        id: entry.league.id,
        name: entry.league.name,
        logo: entry.league.logo,
      },
      season: WORLDCUP_SEASON,
      coverage: season2026.coverage,
      cachedAt: new Date().toISOString(),
    }

    worldcupCache.set(CACHE_KEY, payload, TTL.COVERAGE_S)
    wcLogger.info('fetched and cached coverage')

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof ApiFootballError) {
      wcLogger.error(`coverage endpoint error`, { code: err.code, message: err.message })

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

      // VALIDATION_ERROR, EMPTY_RESPONSE, MISSING_API_KEY, HTTP_ERROR
      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: err.message } },
        { status: 500 }
      )
    }

    wcLogger.error('unexpected error in coverage route', { err })
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } },
      { status: 500 }
    )
  }
}
