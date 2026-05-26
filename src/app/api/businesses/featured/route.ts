/**
 * Featured Businesses API
 * GET /api/businesses/featured - Home carousel slots (paid + organic fallback)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

const businessSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  category: true,
  city: true,
  state: true,
  phone: true,
  email: true,
  website: true,
  whatsapp: true,
  instagram: true,
  images: true,
  isVerified: true,
  logoUrl: true,
} as const

type FeaturedBusiness = {
  id: string
  name: string
  slug: string
  description: string
  category: string
  city: string | null
  state: string | null
  phone: string
  email: string
  website: string | null
  whatsapp: string | null
  instagram: string | null
  images: string[]
  isVerified: boolean
  logoUrl: string | null
}

/**
 * GET /api/businesses/featured
 *
 * Returns up to 10 businesses for the home carousel.
 *
 * Slot resolution:
 *   1. Paid/priority slots use Business.ranking (1-10).
 *   2. Empty slots are filled with the oldest active businesses (createdAt ASC).
 *
 * Query params:
 *   - limit: number (default 10, max 10)
 *
 * Response 200:
 *   { success, data: Business[] }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))

    const paidSlots = await prisma.business.findMany({
      where: {
        isActive: true,
        ranking: { gte: 1, lte: limit },
      },
      orderBy: { ranking: 'asc' },
      select: {
        ...businessSelect,
        ranking: true,
      },
    })

    const paidBySlot = new Map<number, FeaturedBusiness>()
    const paidIds = new Set<string>()

    for (const business of paidSlots) {
      const { ranking, ...featuredBusiness } = business
      if (ranking >= 1 && ranking <= limit && !paidBySlot.has(ranking)) {
        paidBySlot.set(ranking, featuredBusiness)
        paidIds.add(featuredBusiness.id)
      }
    }

    const organics = await prisma.business.findMany({
      where: {
        isActive: true,
        ranking: 0,
        id: { notIn: [...paidIds] },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: businessSelect,
    })

    const data: FeaturedBusiness[] = []
    let organicIndex = 0

    for (let slot = 1; slot <= limit; slot++) {
      const paid = paidBySlot.get(slot)
      if (paid) {
        data.push(paid)
        continue
      }

      if (organicIndex < organics.length) {
        data.push(organics[organicIndex])
        organicIndex += 1
      }
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error in GET /api/businesses/featured', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading featured businesses.' },
      { status: 500 }
    )
  }
}
