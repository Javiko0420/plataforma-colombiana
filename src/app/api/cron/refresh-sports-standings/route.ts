/**
 * Sports standings refresh cron
 * Proactively fetches and persists league tables so /deportes survives
 * Vercel cold starts and API-Football rate limits.
 */

import { NextRequest, NextResponse } from 'next/server'
import { refreshDefaultStandings } from '@/lib/refresh-sports-standings'
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

    const { refreshed, total, results } = await refreshDefaultStandings()

    logger.info('Sports standings cron completed', {
      leagues: total,
      refreshed,
    })

    return NextResponse.json({
      success: true,
      data: { refreshed, total, results },
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
