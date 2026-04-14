/**
 * Business Detail API (by slug)
 * GET /api/businesses/slug/[slug] - Get business detail with reviews
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

/**
 * GET /api/businesses/slug/[slug]
 *
 * Returns full business detail including owner info and reviews.
 * Uses slug instead of ID to match web URL structure.
 *
 * Response 200:
 *   { success, data: BusinessDetail }
 *
 * Response 404:
 *   { success: false, error: 'Business not found' }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required.' },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reviews: {
          where: {
            status: 'VISIBLE',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        products: {
          where: { active: true },
          orderBy: { featured: 'desc' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            currency: true,
            image: true,
            featured: true,
          },
        },
      },
    })

    if (!business || !business.isActive) {
      return NextResponse.json(
        { success: false, error: 'Business not found.' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const averageRating =
      business.reviews.length > 0
        ? business.reviews.reduce((acc, r) => acc + r.rating, 0) /
          business.reviews.length
        : null

    return NextResponse.json({
      success: true,
      data: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        description: business.description,
        category: business.category,
        city: business.city,
        state: business.state,
        address: business.address,
        phone: business.phone,
        email: business.email,
        website: business.website,
        whatsapp: business.whatsapp,
        instagram: business.instagram,
        facebook: business.facebook,
        tiktok: business.tiktok,
        images: business.images,
        logoUrl: business.logoUrl,
        isVerified: business.isVerified,
        plan: business.plan,
        owner: business.owner,
        reviews: business.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          user: r.user,
        })),
        reviewsCount: business.reviews.length,
        averageRating: averageRating ? parseFloat(averageRating.toFixed(1)) : null,
        products: business.products,
        createdAt: business.createdAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error in GET /api/businesses/slug/[slug]', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading business.' },
      { status: 500 }
    )
  }
}
