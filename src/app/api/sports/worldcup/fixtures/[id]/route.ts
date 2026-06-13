import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { TTL } from '@/lib/sports/worldcup/constants'
import { fetchApiFootball } from '@/lib/sports/worldcup/api-football-client'
import { worldcupCache } from '@/lib/sports/worldcup/cache'
import { ApiFootballFixtureDetailEnvelopeSchema } from '@/lib/sports/worldcup/schemas'
import { mapFixtureDetail } from '@/lib/sports/worldcup/mappers'
import { ApiFootballError } from '@/lib/sports/worldcup/errors'
import { wcLogger } from '@/lib/sports/worldcup/logger'
import type { CachedFixtureDetail } from '@/lib/sports/worldcup/types'

export const dynamic = 'force-dynamic'

// Statuses that indicate a match is actively in progress — use aggressive TTL.
const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'])

const idSchema = z.coerce.number().int().positive()

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params
  const parsed = idSchema.safeParse(rawId)

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Fixture id must be a positive integer' } },
      { status: 400 }
    )
  }

  const id = parsed.data
  const cacheKey = `worldcup:fixture:${id}`

  const cached = worldcupCache.get<CachedFixtureDetail>(cacheKey)
  if (cached) {
    wcLogger.info('cache hit: fixture detail', { id, cachedAt: cached.cachedAt })
    return NextResponse.json(cached)
  }

  try {
    // No allowEmptyResponse — empty response means the fixture doesn't exist (→ 404).
    const envelope = await fetchApiFootball(
      'fixtures',
      { id: String(id) },
      ApiFootballFixtureDetailEnvelopeSchema
    )

    const raw = envelope.response[0]!
    const mapped = mapFixtureDetail(raw)
    const payload: CachedFixtureDetail = { ...mapped, cachedAt: new Date().toISOString() }

    const isLive = LIVE_STATUSES.has(raw.fixture.status.short)
    worldcupCache.set(cacheKey, payload, isLive ? TTL.LIVE_TTL_ACTIVE_S : TTL.LIVE_TTL_IDLE_S)
    wcLogger.info('fetched and cached fixture detail', {
      id,
      status: raw.fixture.status.short,
      isLive,
    })

    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof ApiFootballError) {
      wcLogger.error('fixture detail endpoint error', { code: err.code, message: err.message })

      if (err.code === 'EMPTY_RESPONSE') {
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Fixture not found' } },
          { status: 404 }
        )
      }

      if (err.code === 'UPSTREAM_ERROR') {
        return NextResponse.json(
          { error: { code: 'UPSTREAM_ERROR', message: err.message } },
          { status: 502 }
        )
      }

      if (err.code === 'TIMEOUT') {
        return NextResponse.json(
          { error: { code: 'TIMEOUT', message: err.message } },
          { status: 504 }
        )
      }

      return NextResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: err.message } },
        { status: 500 }
      )
    }

    wcLogger.error('unexpected error in fixture detail route', { err })
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } },
      { status: 500 }
    )
  }
}
