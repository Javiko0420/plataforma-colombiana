/**
 * World Cup home widget API
 * GET /api/sports/worldcup/widget
 *
 * Devuelve UN partido para el widget del home:
 *   - Si hay partidos del Mundial en vivo → el primero (tal cual la API, sin
 *     filtro por país).
 *   - Si no hay en vivo → el último partido finalizado del Mundial (todo el
 *     torneo, sin filtro por país).
 */

import { NextResponse } from 'next/server'
import { WORLDCUP_LEAGUE_ID, WORLDCUP_SEASON, TTL } from '@/lib/sports/worldcup/constants'
import { fetchApiFootball } from '@/lib/sports/worldcup/api-football-client'
import { worldcupCache } from '@/lib/sports/worldcup/cache'
import { ApiFootballFixturesEnvelopeSchema } from '@/lib/sports/worldcup/schemas'
import { mapFixture } from '@/lib/sports/worldcup/mappers'
import { ApiFootballError } from '@/lib/sports/worldcup/errors'
import { wcLogger } from '@/lib/sports/worldcup/logger'
import type { WorldCupFixture } from '@/lib/sports/worldcup/types'

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'worldcup:widget'
/** Estados de partido finalizado en API-Football. */
const FINISHED = new Set(['FT', 'AET', 'PEN'])

type WidgetPayload = {
  mode: 'live' | 'last'
  fixture: WorldCupFixture | null
  cachedAt: string
}

export async function GET() {
  const cached = worldcupCache.get<WidgetPayload>(CACHE_KEY)
  if (cached) {
    wcLogger.info('cache hit: widget', { mode: cached.mode })
    return NextResponse.json(cached)
  }

  try {
    // 1) Partidos del Mundial en vivo (sin filtro de país, como la sección live).
    const liveEnvelope = await fetchApiFootball(
      'fixtures',
      { live: 'all' },
      ApiFootballFixturesEnvelopeSchema,
      { allowEmptyResponse: true }
    )
    const live = liveEnvelope.response
      .filter((item) => item.league.id === WORLDCUP_LEAGUE_ID)
      .map(mapFixture)

    if (live.length > 0) {
      const payload: WidgetPayload = { mode: 'live', fixture: live[0], cachedAt: new Date().toISOString() }
      worldcupCache.set(CACHE_KEY, payload, TTL.LIVE_TTL_ACTIVE_S)
      wcLogger.info('widget: live fixture', { total: live.length })
      return NextResponse.json(payload)
    }

    // 2) Sin partidos en vivo → último partido finalizado del Mundial (todo el torneo).
    const fixturesEnvelope = await fetchApiFootball(
      'fixtures',
      { league: String(WORLDCUP_LEAGUE_ID), season: String(WORLDCUP_SEASON) },
      ApiFootballFixturesEnvelopeSchema,
      { allowEmptyResponse: true }
    )
    const lastFinished = fixturesEnvelope.response
      .map(mapFixture)
      .filter((f) => FINISHED.has(f.status.short))
      .sort((a, b) => b.timestamp - a.timestamp)[0] ?? null

    const payload: WidgetPayload = { mode: 'last', fixture: lastFinished, cachedAt: new Date().toISOString() }
    worldcupCache.set(CACHE_KEY, payload, TTL.LIVE_TTL_IDLE_S)
    wcLogger.info('widget: last finished fixture', { found: lastFinished !== null })
    return NextResponse.json(payload)
  } catch (err) {
    if (err instanceof ApiFootballError) {
      wcLogger.error('widget endpoint error', { code: err.code, message: err.message })
      const status = err.code === 'UPSTREAM_ERROR' ? 502 : err.code === 'TIMEOUT' ? 504 : 500
      return NextResponse.json({ error: { code: err.code, message: err.message } }, { status })
    }
    wcLogger.error('unexpected error in widget route', { err })
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Unexpected server error' } }, { status: 500 })
  }
}
