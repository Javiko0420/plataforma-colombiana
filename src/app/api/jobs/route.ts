/**
 * Jobs API
 * GET /api/jobs - List active job offers with optional filters
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

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
