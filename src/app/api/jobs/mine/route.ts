import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/get-auth-user'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request)
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const jobs = await prisma.jobOffer.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        location: true,
        jobType: true,
        hourlyRate: true,
        email: true,
        phone: true,
        externalLink: true,
        isVerified: true,
        createdAt: true,
        expiresAt: true,
      },
    })

    return NextResponse.json({ success: true, data: jobs })
  } catch (error) {
    logger.error('Error in GET /api/jobs/mine', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading jobs.' },
      { status: 500 }
    )
  }
}
