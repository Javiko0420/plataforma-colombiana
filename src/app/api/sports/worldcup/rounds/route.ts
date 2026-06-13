import { NextResponse } from 'next/server'
import { WORLDCUP_LEAGUE_ID, WORLDCUP_SEASON, TTL } from '@/lib/sports/worldcup/constants'
import { fetchApiFootball } from '@/lib/sports/worldcup/api-football-client'
import { worldcupCache } from '@/lib/sports/worldcup/cache'
import { ApiFootballRoundsEnvelopeSchema } from '@/lib/sports/worldcup/schemas'
import { ApiFootballError } from '@/lib/sports/worldcup/errors'
import { wcLogger } from '@/lib/sports/worldcup/logger'
import type { CachedRounds } from '@/lib/sports/worldcup/types'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'worldcup:rounds'

const BASE_PARAMS = {
  league: String(WORLDCUP_LEAGUE_ID),
  season: String(WORLDCUP_SEASON),
}

export async function GET() {
  const cached = worldcupCache.get<CachedRounds>(CACHE_KEY)
  if (cached) {
    wcLogger.info('cache hit: rounds', { cachedAt: cached.cachedAt })
    return NextResponse.json(cached)
  }

  try {
    // Both calls share the same schema — fetch in parallel to minimize latency.
    const [allEnvelope, currentEnvelope] = await Promise.all([
      fetchApiFootball('fixtures/rounds', BASE_PARAMS, ApiFootballRoundsEnvelopeSchema, {
        allowEmptyResponse: true,
      }),
      fetchApiFootball(
        'fixtures/rounds',
        { ...BASE_PARAMS, current: 'true' },
        ApiFootballRoundsEnvelopeSchema,
        { allowEmptyResponse: true }
      ),
    ])

    const rounds = allEnvelope.response
    const current = currentEnvelope.response[0] ?? null

    const payload: CachedRounds = { rounds, current, cachedAt: new Date().toISOString() }

    worldcupCache.set(CACHE_KEY, payload, TTL.ROUNDS_TTL_S)
    wcLogger.info('fetched and cached rounds', { total: rounds.length, current })

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof ApiFootballError) {
      wcLogger.error('rounds endpoint error', { code: err.code, message: err.message })

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

    wcLogger.error('unexpected error in rounds route', { err })
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } },
      { status: 500 }
    )
  }
}
