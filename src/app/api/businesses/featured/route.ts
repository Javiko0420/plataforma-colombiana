/**
 * Featured Businesses API
 * GET /api/businesses/featured - Home carousel slots (paid + organic fallback)
 */

import { NextRequest, NextResponse } from 'next/server'
import { Prisma, type BusinessPlan } from '@prisma/client'
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
  plan: true,
  // Solo reseñas visibles influyen en el rating público (excluye HIDDEN/FLAGGED).
  reviews: { where: { status: 'VISIBLE' as const }, select: { rating: true } },
} as const

type RawBusiness = Prisma.BusinessGetPayload<{ select: typeof businessSelect }>

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
  plan: BusinessPlan
  rating: number | null
  reviewCount: number
}

/** Aplana un negocio crudo: calcula el rating promedio y descarta el array de reseñas. */
function toFeatured(business: RawBusiness): FeaturedBusiness {
  const { reviews, ...rest } = business
  const reviewCount = reviews.length
  const rating =
    reviewCount > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount) * 10) / 10
      : null
  return { ...rest, rating, reviewCount }
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
 * Each business includes its commercial `plan` (drives the "Destacado" badge)
 * and its real review `rating` (average) + `reviewCount`.
 *
 * Query params:
 *   - limit: number (default 10, max 10)
 *
 * Response 200:
 *   { success, data: FeaturedBusiness[] }
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
      const { ranking, ...rest } = business
      if (ranking >= 1 && ranking <= limit && !paidBySlot.has(ranking)) {
        const featured = toFeatured(rest)
        paidBySlot.set(ranking, featured)
        paidIds.add(featured.id)
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
        data.push(toFeatured(organics[organicIndex]))
        organicIndex += 1
      }
    }

    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      {
        // CDN cache: los slots del home cambian poco; SWR evita esperas en frío.
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
      }
    )
  } catch (error) {
    logger.error('Error in GET /api/businesses/featured', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading featured businesses.' },
      { status: 500 }
    )
  }
}
