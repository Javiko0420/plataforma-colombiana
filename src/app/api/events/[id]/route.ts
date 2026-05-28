/**
 * Event Detail API
 * GET /api/events/[id] - Get event detail with organizer info
 * PUT /api/events/[id] - Edit event (owner only)
 * DELETE /api/events/[id] - Delete event (owner only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getAuthUserId } from '@/lib/get-auth-user'

const URL_SHORTENER_REGEX =
  /(https?:\/\/)?(bit\.ly|tinyurl\.com|cutt\.ly|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|shorte\.st)\//i

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUserId = await getAuthUserId(request)
    if (!authUserId) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida.' },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingEvent = await prisma.event.findUnique({ where: { id } })
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado.' },
        { status: 404 }
      )
    }

    if (existingEvent.userId !== authUserId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para editar este evento.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, category, eventDate, location, imageUrl, ticketLink, ticketPrice } = body

    if (description && URL_SHORTENER_REGEX.test(description)) {
      return NextResponse.json(
        { success: false, error: 'La descripción no puede contener enlaces acortados (bit.ly, tinyurl, t.co, etc.).' },
        { status: 400 }
      )
    }

    if (eventDate !== undefined) {
      const parsed = new Date(eventDate)
      if (isNaN(parsed.getTime()) || parsed <= new Date()) {
        return NextResponse.json(
          { success: false, error: 'La fecha del evento debe ser en el futuro.' },
          { status: 400 }
        )
      }
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
        ...(location !== undefined && { location }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(ticketLink !== undefined && { ticketLink }),
        ...(ticketPrice !== undefined && { ticketPrice }),
      },
    })

    return NextResponse.json({ success: true, data: updatedEvent })
  } catch (error) {
    logger.error('Error in PUT /api/events/[id]', { error })
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el evento.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUserId = await getAuthUserId(request)
    if (!authUserId) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida.' },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingEvent = await prisma.event.findUnique({ where: { id } })
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado.' },
        { status: 404 }
      )
    }

    if (existingEvent.userId !== authUserId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para eliminar este evento.' },
        { status: 403 }
      )
    }

    await prisma.event.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Evento eliminado.' })
  } catch (error) {
    logger.error('Error in DELETE /api/events/[id]', { error })
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el evento.' },
      { status: 500 }
    )
  }
}
