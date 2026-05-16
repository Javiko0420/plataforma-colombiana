import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/get-auth-user'
import { removeFavorite } from '@/lib/radio-favorites-server'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  const userId = await getAuthUserId(request)
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }

  const { stationId } = await params
  if (!stationId || stationId.length > 80) {
    return NextResponse.json(
      { success: false, error: 'Invalid stationId' },
      { status: 400 }
    )
  }

  try {
    const existed = await removeFavorite(userId, stationId)
    // 204 either way: idempotent delete keeps client logic simple.
    return new NextResponse(null, {
      status: 204,
      headers: { 'X-Existed': existed ? '1' : '0' },
    })
  } catch (error) {
    logger.error('Error in DELETE /api/radio/favorites/[stationId]', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
