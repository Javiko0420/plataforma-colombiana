import { NextResponse } from 'next/server'
import { WORLDCUP_LEAGUE_ID, WORLDCUP_SEASON, TTL } from '@/lib/sports/worldcup/constants'
import { fetchApiFootball } from '@/lib/sports/worldcup/api-football-client'
import { worldcupCache } from '@/lib/sports/worldcup/cache'
import { ApiFootballTeamsEnvelopeSchema } from '@/lib/sports/worldcup/schemas'
import { mapTeam } from '@/lib/sports/worldcup/mappers'
import { ApiFootballError } from '@/lib/sports/worldcup/errors'
import { wcLogger } from '@/lib/sports/worldcup/logger'
import type { CachedTeams } from '@/lib/sports/worldcup/types'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'worldcup:teams'

export async function GET() {
  const cached = worldcupCache.get<CachedTeams>(CACHE_KEY)
  if (cached) {
    wcLogger.info('cache hit: teams', { count: cached.teams.length, cachedAt: cached.cachedAt })
    return NextResponse.json(cached)
  }

  try {
    const envelope = await fetchApiFootball(
      'teams',
      { league: String(WORLDCUP_LEAGUE_ID), season: String(WORLDCUP_SEASON) },
      ApiFootballTeamsEnvelopeSchema,
      { allowEmptyResponse: true }
    )

    const teams = envelope.response.map(mapTeam)
    const payload: CachedTeams = { teams, cachedAt: new Date().toISOString() }

    worldcupCache.set(CACHE_KEY, payload, TTL.TEAMS_TTL_S)
    wcLogger.info('fetched and cached teams', { count: teams.length })

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof ApiFootballError) {
      wcLogger.error('teams endpoint error', { code: err.code, message: err.message })

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

    wcLogger.error('unexpected error in teams route', { err })
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } },
      { status: 500 }
    )
  }
}
