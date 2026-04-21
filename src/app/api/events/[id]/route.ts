/**
 * Event Detail API
 * GET /api/events/[id] - Get event detail with organizer info
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/events/[id]
 *
 * Returns full event detail including organizer name.
 *
 * Response 200:
 *   { success, data: EventDetail }
 *
 * Response 404:
 *   { success: false, error: 'Event not found' }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required.' },
        { status: 400 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!event || event.isHidden) {
      return NextResponse.json(
        { success: false, error: 'Event not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        eventDate: event.eventDate,
        location: event.location,
        imageUrl: event.imageUrl,
        ticketLink: event.ticketLink,
        ticketPrice: event.ticketPrice,
        organizer: {
          id: event.user.id,
          name: event.user.name,
        },
        createdAt: event.createdAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error in GET /api/events/[id]', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading event.' },
      { status: 500 }
    )
  }
}
