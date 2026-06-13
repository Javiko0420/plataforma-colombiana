import { NextResponse } from 'next/server'
import { WORLDCUP_LEAGUE_ID, WORLDCUP_SEASON, TTL } from '@/lib/sports/worldcup/constants'
import { fetchApiFootball } from '@/lib/sports/worldcup/api-football-client'
import { worldcupCache } from '@/lib/sports/worldcup/cache'
import {
  ApiFootballStandingsEnvelopeSchema,
  type RawStandingsEntry,
  type WorldCupStandingsGroup,
} from '@/lib/sports/worldcup/schemas'
import { ApiFootballError } from '@/lib/sports/worldcup/errors'
import { wcLogger } from '@/lib/sports/worldcup/logger'
import type { CachedStandings } from '@/lib/sports/worldcup/types'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'worldcup:standings'

type StandingsEnvelope = {
  response: Array<{
    league: {
      standings?: Array<Array<RawStandingsEntry>>
    }
  }>
}

function mapStandingsGroups(envelope: StandingsEnvelope): WorldCupStandingsGroup[] {
  const rawGroups = envelope.response[0]?.league?.standings ?? []
  return rawGroups
    .filter((group) => group.length > 0)
    .map((group) => ({
      group: group[0]!.group,
      standings: group.map((entry) => ({
        rank: entry.rank,
        team: entry.team,
        points: entry.points,
        goalsDiff: entry.goalsDiff,
        played: entry.all.played,
        win: entry.all.win,
        draw: entry.all.draw,
        lose: entry.all.lose,
        goalsFor: entry.all.goals.for,
        goalsAgainst: entry.all.goals.against,
        form: entry.form,
      })),
    }))
}

export async function GET() {
  const cached = worldcupCache.get<CachedStandings>(CACHE_KEY)
  if (cached) {
    wcLogger.info('cache hit: standings', { cachedAt: cached.cachedAt })
    return NextResponse.json(cached)
  }

  try {
    const envelope = await fetchApiFootball(
      'standings',
      { league: String(WORLDCUP_LEAGUE_ID), season: String(WORLDCUP_SEASON) },
      ApiFootballStandingsEnvelopeSchema,
      { allowEmptyResponse: true }
    )

    const groups = mapStandingsGroups(envelope)
    const payload: CachedStandings = { groups, cachedAt: new Date().toISOString() }

    worldcupCache.set(CACHE_KEY, payload, TTL.STANDINGS_S)
    wcLogger.info('fetched and cached standings', { groupCount: groups.length })

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof ApiFootballError) {
      wcLogger.error('standings endpoint error', { code: err.code, message: err.message })

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

    wcLogger.error('unexpected error in standings route', { err })
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } },
      { status: 500 }
    )
  }
}
