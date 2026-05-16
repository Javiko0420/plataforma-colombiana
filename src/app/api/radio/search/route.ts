import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { searchStations } from '@/lib/radio-browser'
import { logger } from '@/lib/logger'

export const runtime = 'edge'

const querySchema = z.object({
  q: z.string().trim().max(120).optional(),
  country: z.string().trim().max(80).optional(),
  countryCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/u, 'countryCode must be ISO 3166-1 alpha-2')
    .optional(),
  language: z.string().trim().max(40).optional(),
  tag: z.string().trim().max(40).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).max(1000).optional(),
  order: z.enum(['votes', 'clickcount', 'name', 'random']).optional(),
})

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid query', issues: parsed.error.issues },
      { status: 400 }
    )
  }

  const params = parsed.data

  // Require at least one filter to avoid arbitrarily large unfiltered scans.
  const hasFilter = Boolean(
    params.q || params.country || params.countryCode || params.language || params.tag
  )
  if (!hasFilter) {
    return NextResponse.json(
      { success: false, error: 'At least one of q/country/countryCode/language/tag is required' },
      { status: 400 }
    )
  }

  try {
    const stations = await searchStations({
      query: params.q,
      country: params.country,
      countryCode: params.countryCode,
      language: params.language,
      tag: params.tag,
      limit: params.limit ?? 30,
      offset: params.offset ?? 0,
      order: params.order ?? 'votes',
      hidebroken: true,
    })
    return NextResponse.json(
      { success: true, data: { stations } },
      {
        headers: {
          // Allow CDN/edge caching for 5 minutes; clients revalidate after 30s.
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    logger.error('Radio Browser search failed', {
      error: error instanceof Error ? error.message : String(error),
      params,
    })
    return NextResponse.json(
      { success: false, error: 'Radio search failed' },
      { status: 502 }
    )
  }
}
