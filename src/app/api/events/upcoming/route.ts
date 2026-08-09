/**
 * Upcoming Events API
 * GET /api/events/upcoming - Home section slots (paid + organic fallback)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const eventSelect = {
  id: true,
  title: true,
  description: true,
  category: true,
  eventDate: true,
  location: true,
  imageUrl: true,
  ticketPrice: true,
  createdAt: true,
} as const

type UpcomingEvent = {
  id: string
  title: string
  description: string
  category: string
  eventDate: Date
  location: string
  imageUrl: string | null
  ticketPrice: number | null
  createdAt: Date
}

const upcomingWhere = {
  eventDate: { gte: new Date() },
  isHidden: false,
} as const

async function hasEventRankingColumn(): Promise<boolean> {
  try {
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'Event'
          AND column_name = 'ranking'
      ) AS "exists"
    `

    return Boolean(result[0]?.exists)
  } catch {
    return false
  }
}

async function resolveUpcomingWithRanking(limit: number): Promise<UpcomingEvent[]> {
  const paidSlots = await prisma.event.findMany({
    where: {
      ...upcomingWhere,
      ranking: { gte: 1, lte: limit },
    },
    orderBy: { ranking: 'asc' },
    select: {
      ...eventSelect,
      ranking: true,
    },
  })

  const paidBySlot = new Map<number, UpcomingEvent>()
  const paidIds = new Set<string>()

  for (const event of paidSlots) {
    const { ranking, ...upcomingEvent } = event
    if (ranking >= 1 && ranking <= limit && !paidBySlot.has(ranking)) {
      paidBySlot.set(ranking, upcomingEvent)
      paidIds.add(upcomingEvent.id)
    }
  }

  const organics = await prisma.event.findMany({
    where: {
      ...upcomingWhere,
      ranking: 0,
      id: { notIn: [...paidIds] },
    },
    orderBy: { eventDate: 'asc' },
    take: limit,
    select: eventSelect,
  })

  const data: UpcomingEvent[] = []
  let organicIndex = 0

  for (let slot = 1; slot <= limit; slot++) {
    const paid = paidBySlot.get(slot)
    if (paid) {
      data.push(paid)
      continue
    }

    if (organicIndex < organics.length) {
      data.push(organics[organicIndex])
      organicIndex += 1
    }
  }

  return data
}

async function resolveUpcomingFallback(limit: number): Promise<UpcomingEvent[]> {
  return prisma.event.findMany({
    where: upcomingWhere,
    orderBy: { eventDate: 'asc' },
    take: limit,
    select: eventSelect,
  })
}

/**
 * GET /api/events/upcoming
 *
 * Returns up to 10 upcoming events for the home section.
 *
 * Slot resolution:
 *   1. Paid/priority slots use Event.ranking (1-10).
 *   2. Empty slots are filled with the soonest upcoming events (eventDate ASC).
 *
 * Query params:
 *   - limit: number (default 10, max 10)
 *
 * Response 200:
 *   { success, data: Event[] }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))

    const useRanking = await hasEventRankingColumn()
    const data = useRanking
      ? await resolveUpcomingWithRanking(limit)
      : await resolveUpcomingFallback(limit)

    if (!useRanking) {
      logger.warn(
        'Event.ranking column missing; using eventDate ordering for upcoming events'
      )
    }

    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      {
        // CDN cache: la agenda del home tolera 5 min de retraso.
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
      }
    )
  } catch (error) {
    logger.error('Error in GET /api/events/upcoming', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading upcoming events.' },
      { status: 500 }
    )
  }
}
