/**
 * Events API
 * GET  /api/events - List upcoming, visible events with optional filters
 * POST /api/events - Create a new event (web session or mobile JWT)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getAuthUserId } from '@/lib/get-auth-user'

const VALID_CATEGORIES = ['Concierto', 'Teatro', 'Comedia', 'Fiesta', 'Deportes', 'Cultural', 'Networking', 'Otro']
const URL_SHORTENER_REGEX = /(https?:\/\/)?(bit\.ly|tinyurl\.com|cutt\.ly|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|shorte\.st)\//i

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

/**
 * POST /api/events
 *
 * Creates a new event. Supports both web (NextAuth cookie) and mobile
 * (Authorization: Bearer <jwt>) clients via getAuthUserId().
 *
 * Body (JSON):
 *   title, description, category, eventDate (ISO, future), location,
 *   imageUrl? (Cloudinary URL), ticketLink? (no URL shorteners),
 *   ticketPrice? (number, AUD, null = free)
 *
 * Response 201: { success: true, data: Event }
 * Response 400: { success: false, error: string }
 * Response 401: { success: false, error: "Authentication required" }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, description, category, eventDate, location, imageUrl, ticketLink, ticketPrice } = body

    // Validar campos requeridos
    if (!title || !description || !category || !eventDate || !location) {
      return NextResponse.json(
        { success: false, error: 'Los campos title, description, category, eventDate y location son obligatorios.' },
        { status: 400 }
      )
    }

    // Validar categoría
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Categoría inválida. Opciones válidas: ${VALID_CATEGORIES.join(', ')}.` },
        { status: 400 }
      )
    }

    // Validar que eventDate sea una fecha futura válida
    const parsedDate = new Date(eventDate)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'eventDate no es una fecha válida (use formato ISO).' },
        { status: 400 }
      )
    }
    if (parsedDate <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'La fecha del evento debe ser en el futuro.' },
        { status: 400 }
      )
    }

    // Validar acortadores de URL en description
    if (URL_SHORTENER_REGEX.test(description)) {
      return NextResponse.json(
        { success: false, error: 'La descripción no puede contener enlaces acortados (bit.ly, tinyurl, t.co, etc.).' },
        { status: 400 }
      )
    }

    // Validar acortadores de URL en ticketLink
    if (ticketLink && URL_SHORTENER_REGEX.test(ticketLink)) {
      return NextResponse.json(
        { success: false, error: 'El enlace de tickets no puede contener acortadores de URL.' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        eventDate: parsedDate,
        location,
        imageUrl: imageUrl ?? null,
        ticketLink: ticketLink ?? null,
        ticketPrice: ticketPrice ?? null,
        userId,
      },
    })

    return NextResponse.json(
      { success: true, data: event },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error in POST /api/events', { error })
    return NextResponse.json(
      { success: false, error: 'No se pudo crear el evento.' },
      { status: 500 }
    )
  }
}
