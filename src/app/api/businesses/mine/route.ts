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

    const businesses = await prisma.business.findMany({
      where: { ownerId: userId, isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        city: true,
        state: true,
        images: true,
        isVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: businesses })
  } catch (error) {
    logger.error('Error in GET /api/businesses/mine', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading businesses.' },
      { status: 500 }
    )
  }
}
