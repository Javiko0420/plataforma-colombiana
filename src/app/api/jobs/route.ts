/**
 * Jobs API
 * GET  /api/jobs - List active job offers with optional filters
 * POST /api/jobs - Create a new job offer (web session or mobile JWT)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getAuthUserId } from '@/lib/get-auth-user'
import { JOB_CATEGORIES, jobCategoryValues, isValidCategory } from '@/lib/constants/categories'

const VALID_LOCATIONS  = ['Brisbane', 'Sydney', 'Melbourne', 'Gold Coast', 'Remoto']
const VALID_JOB_TYPES  = ['Full-time', 'Part-time', 'Freelance', 'Contract']
const URL_SHORTENER_REGEX = /(https?:\/\/)?(bit\.ly|tinyurl\.com|cutt\.ly|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|shorte\.st)\//i

export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs
 *
 * Query params:
 *   - category: string (e.g. "Construcción")
 *   - location: string (e.g. "Sydney")
 *   - q: string (search title, description)
 *   - page: number (default 1)
 *   - limit: number (default 20, max 50)
 *
 * Response 200:
 *   { success, data: JobOffer[], pagination: { page, limit, total, hasMore } }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const query = searchParams.get('q')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {
      deletedAt: null,
      expiresAt: { gt: new Date() },
    }

    if (category) {
      where.category = category
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      }
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    const [jobs, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          category: true,
          description: true,
          location: true,
          jobType: true,
          hourlyRate: true,
          isVerified: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
      prisma.jobOffer.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + jobs.length < total,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error in GET /api/jobs', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading jobs.' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/jobs
 *
 * Creates a new job offer. Supports both web (NextAuth cookie) and mobile
 * (Authorization: Bearer <jwt>) clients via getAuthUserId().
 *
 * Body (JSON):
 *   title, category, description, location, jobType,
 *   hourlyRate (number > 0, AUD/hora),
 *   email?, phone?, externalLink? (no URL shorteners)
 *   — al menos un método de contacto requerido.
 *
 * Response 201: { success: true, data: JobOffer }
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
    const { title, category, description, location, jobType, hourlyRate, email, phone, externalLink } = body

    // Validar campos requeridos
    if (!title || !category || !description || !location || !jobType) {
      return NextResponse.json(
        { success: false, error: 'Los campos title, category, description, location y jobType son obligatorios.' },
        { status: 400 }
      )
    }

    // Validar categoría
    if (!isValidCategory(JOB_CATEGORIES, category)) {
      return NextResponse.json(
        { success: false, error: `Categoría inválida. Opciones válidas: ${jobCategoryValues.join(', ')}.` },
        { status: 400 }
      )
    }

    // Validar ubicación
    if (!VALID_LOCATIONS.includes(location)) {
      return NextResponse.json(
        { success: false, error: `Ubicación inválida. Opciones válidas: ${VALID_LOCATIONS.join(', ')}.` },
        { status: 400 }
      )
    }

    // Validar tipo de empleo
    if (!VALID_JOB_TYPES.includes(jobType)) {
      return NextResponse.json(
        { success: false, error: `Tipo de empleo inválido. Opciones válidas: ${VALID_JOB_TYPES.join(', ')}.` },
        { status: 400 }
      )
    }

    // Validar salario por hora (obligatorio por requisito legal)
    if (!hourlyRate || typeof hourlyRate !== 'number' || hourlyRate <= 0) {
      return NextResponse.json(
        { success: false, error: 'El salario por hora es obligatorio y debe ser mayor a 0 (requisito legal).' },
        { status: 400 }
      )
    }

    // Validar al menos un método de contacto
    if (!email && !phone && !externalLink) {
      return NextResponse.json(
        { success: false, error: 'Se requiere al menos un método de contacto válido (email, teléfono o enlace).' },
        { status: 400 }
      )
    }

    // Validar acortadores de URL en externalLink
    if (externalLink && URL_SHORTENER_REGEX.test(externalLink)) {
      return NextResponse.json(
        { success: false, error: 'Por seguridad de la comunidad, no se permiten acortadores de URL en los enlaces externos.' },
        { status: 400 }
      )
    }

    // Calcular fechas: expiresAt = createdAt + 15 días
    const createdAt = new Date()
    const expiresAt = new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000)

    const job = await prisma.jobOffer.create({
      data: {
        title,
        category,
        description,
        location,
        jobType,
        hourlyRate,
        email:        email        ?? null,
        phone:        phone        ?? null,
        externalLink: externalLink ?? null,
        createdAt,
        expiresAt,
        user: { connect: { id: userId } },
      },
    })

    return NextResponse.json(
      { success: true, data: job },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error in POST /api/jobs', { error })
    return NextResponse.json(
      { success: false, error: 'No se pudo crear la oferta de empleo.' },
      { status: 500 }
    )
  }
}
