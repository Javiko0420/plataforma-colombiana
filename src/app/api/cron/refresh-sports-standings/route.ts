/**
 * Sports standings refresh cron
 * Proactively fetches and persists league tables so /deportes survives
 * Vercel cold starts and API-Football rate limits.
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchStandings, resolveSeasonForLeague } from '@/lib/football'
import { getDefaultStandingsLeagues } from '@/lib/leagues'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized sports standings cron attempt', {
        ip: request.headers.get('x-forwarded-for'),
      })
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const leagues = getDefaultStandingsLeagues((key) => key)
    const results: Array<{ leagueId: number; season: number; rows: number; ok: boolean }> = []

    for (const lg of leagues) {
      try {
        const season = await resolveSeasonForLeague(lg.id)
        const table = await fetchStandings(lg.id, season)
        results.push({
          leagueId: lg.id,
          season,
          rows: table.length,
          ok: table.length > 0,
        })
        await new Promise((r) => setTimeout(r, 250))
      } catch (err) {
        logger.warn('Sports standings cron league failed', {
          leagueId: lg.id,
          alias: lg.alias,
          error: err instanceof Error ? err.message : String(err),
        })
        results.push({ leagueId: lg.id, season: 0, rows: 0, ok: false })
      }
    }

    const refreshed = results.filter((r) => r.ok).length

    logger.info('Sports standings cron completed', {
      leagues: leagues.length,
      refreshed,
    })

    return NextResponse.json({
      success: true,
      data: { refreshed, total: leagues.length, results },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Sports standings cron failed', { error })

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh sports standings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: 'Not available in production' }, { status: 403 })
  }

  return POST(request)
}
