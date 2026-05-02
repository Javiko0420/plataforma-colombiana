/**
 * Job Detail API
 * GET /api/jobs/[id] - Get job offer detail
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs/[id]
 *
 * Returns full job offer detail including contact info.
 *
 * Response 200:
 *   { success, data: JobDetail }
 *
 * Response 404:
 *   { success: false, error: 'Job not found' }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required.' },
        { status: 400 }
      )
    }

    const job = await prisma.jobOffer.findUnique({
      where: { id },
    })

    if (!job || job.deletedAt !== null || job.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Job not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        category: job.category,
        description: job.description,
        location: job.location,
        jobType: job.jobType,
        hourlyRate: job.hourlyRate,
        email: job.email,
        phone: job.phone,
        externalLink: job.externalLink,
        isVerified: job.isVerified,
        createdAt: job.createdAt,
        expiresAt: job.expiresAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error in GET /api/jobs/[id]', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading job.' },
      { status: 500 }
    )
  }
}
