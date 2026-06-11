/**
 * Categories API
 * GET /api/categories - Fuente de verdad de categorías para el cliente mobile.
 *
 * Devuelve las tres verticales con su clave estable (`value`) y etiqueta
 * legible (`label`). El mobile envía/filtra por `value` y muestra `label`.
 */

import { NextResponse } from 'next/server'
import { BUSINESS_CATEGORIES, EVENT_CATEGORIES, JOB_CATEGORIES } from '@/lib/constants/categories'

// Las categorías solo cambian con un deploy: se pueden cachear con holgura.
export const revalidate = 3600

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      data: {
        businesses: BUSINESS_CATEGORIES,
        events: EVENT_CATEGORIES,
        jobs: JOB_CATEGORIES,
      },
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  )
}
