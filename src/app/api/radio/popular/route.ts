import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { searchStations } from '@/lib/radio-browser'
import { logger } from '@/lib/logger'

export const runtime = 'edge'

const querySchema = z.object({
  countryCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/u, 'countryCode must be ISO 3166-1 alpha-2')
    .optional(),
  language: z.string().trim().max(40).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
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

  try {
    const stations = await searchStations({
      countryCode: parsed.data.countryCode,
      language: parsed.data.language,
      limit: parsed.data.limit ?? 12,
      order: 'clickcount',
      hidebroken: true,
    })
    return NextResponse.json(
      { success: true, data: { stations } },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
        },
      }
    )
  } catch (error) {
    logger.error('Radio Browser popular fetch failed', {
      error: error instanceof Error ? error.message : String(error),
      params: parsed.data,
    })
    return NextResponse.json(
      { success: false, error: 'Radio popular fetch failed' },
      { status: 502 }
    )
  }
}
