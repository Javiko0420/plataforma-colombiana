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

    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        eventDate: true,
        location: true,
        imageUrl: true,
        ticketPrice: true,
        isHidden: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: events })
  } catch (error) {
    logger.error('Error in GET /api/events/mine', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading events.' },
      { status: 500 }
    )
  }
}
