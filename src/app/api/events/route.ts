/**
 * Events API
 * GET /api/events - List upcoming, visible events with optional filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/events
 *
 * Query params:
 *   - category: string (e.g. "Concierto")
 *   - q: string (search title, description, location)
 *   - page: number (default 1)
 *   - limit: number (default 20, max 50)
 *
 * Response 200:
 *   { success, data: Event[], pagination: { page, limit, total, hasMore } }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const query = searchParams.get('q')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {
      eventDate: { gte: new Date() },
      isHidden: false,
    }

    if (category) {
      where.category = category
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
      ]
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { eventDate: 'asc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          eventDate: true,
          location: true,
          imageUrl: true,
          ticketPrice: true,
          createdAt: true,
        },
      }),
      prisma.event.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + events.length < total,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error in GET /api/events', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading events.' },
      { status: 500 }
    )
  }
}
