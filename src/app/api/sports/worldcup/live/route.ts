import { NextResponse } from 'next/server'
import { WORLDCUP_LEAGUE_ID, TTL } from '@/lib/sports/worldcup/constants'
import { fetchApiFootball } from '@/lib/sports/worldcup/api-football-client'
import { worldcupCache } from '@/lib/sports/worldcup/cache'
import { ApiFootballFixturesEnvelopeSchema } from '@/lib/sports/worldcup/schemas'
import { mapFixture } from '@/lib/sports/worldcup/mappers'
import { ApiFootballError } from '@/lib/sports/worldcup/errors'
import { wcLogger } from '@/lib/sports/worldcup/logger'
import type { CachedLive } from '@/lib/sports/worldcup/types'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'worldcup:live'

export async function GET() {
  const cached = worldcupCache.get<CachedLive>(CACHE_KEY)
  if (cached) {
    wcLogger.info('cache hit: live', { hasLive: cached.hasLive, cachedAt: cached.cachedAt })
    return NextResponse.json(cached)
  }

  try {
    // live=all returns fixtures across ALL competitions globally; we filter to WC after.
    const envelope = await fetchApiFootball(
      'fixtures',
      { live: 'all' },
      ApiFootballFixturesEnvelopeSchema,
      { allowEmptyResponse: true }
    )

    const wcItems = envelope.response.filter((item) => item.league.id === WORLDCUP_LEAGUE_ID)
    const fixtures = wcItems.map(mapFixture)
    const hasLive = fixtures.length > 0

    const payload: CachedLive = { fixtures, hasLive, cachedAt: new Date().toISOString() }

    // Aggressive TTL while matches are live; back off when the tournament is idle.
    worldcupCache.set(CACHE_KEY, payload, hasLive ? TTL.LIVE_TTL_ACTIVE_S : TTL.LIVE_TTL_IDLE_S)
    wcLogger.info('fetched and cached live', { total: fixtures.length, hasLive })

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof ApiFootballError) {
      wcLogger.error('live endpoint error', { code: err.code, message: err.message })

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

    wcLogger.error('unexpected error in live route', { err })
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } },
      { status: 500 }
    )
  }
}
