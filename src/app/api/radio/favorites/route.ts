import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/get-auth-user'
import {
  addFavorite,
  bulkAddFavorites,
  listFavorites,
} from '@/lib/radio-favorites-server'
import {
  bulkFavoritesSchema,
  favoriteStationInputSchema,
} from '@/lib/validations/radio-favorite'
import { logger } from '@/lib/logger'

// Forces the Node.js runtime because Prisma needs it; the edge runtime used
// by /api/radio/search is not compatible with the Prisma binary engine.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request)
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }
  try {
    const stations = await listFavorites(userId)
    return NextResponse.json({ success: true, data: { stations } })
  } catch (error) {
    logger.error('Error in GET /api/radio/favorites', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to load favorites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request)
  if (!userId) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  // Accept either a single station object or { stations: [...] } for bulk
  // import (used by the post-login local→DB migration flow).
  const isBulk = typeof payload === 'object' && payload !== null && 'stations' in payload

  try {
    if (isBulk) {
      const parsed = bulkFavoritesSchema.safeParse(payload)
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: 'Invalid body', issues: parsed.error.issues },
          { status: 400 }
        )
      }
      const stations = await bulkAddFavorites(userId, parsed.data.stations)
      return NextResponse.json({ success: true, data: { stations } }, { status: 201 })
    }

    const parsed = favoriteStationInputSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid body', issues: parsed.error.issues },
        { status: 400 }
      )
    }
    const station = await addFavorite(userId, parsed.data)
    return NextResponse.json({ success: true, data: { station } }, { status: 201 })
  } catch (error) {
    logger.error('Error in POST /api/radio/favorites', { error })
    return NextResponse.json(
      { success: false, error: 'Failed to save favorite' },
      { status: 500 }
    )
  }
}
