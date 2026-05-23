import { prisma } from '@/lib/prisma'
import type { SimpleStanding } from '@/lib/football'

const DEFAULT_FRESH_MS = 6 * 60 * 60 * 1000 // 6 hours
const DEFAULT_STALE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function readFreshMs(): number {
  const raw = process.env.SPORTS_STANDINGS_FRESH_MS
  if (raw && /^\d+$/.test(raw)) return Number(raw)
  return DEFAULT_FRESH_MS
}

function readStaleMs(): number {
  const raw = process.env.SPORTS_STANDINGS_STALE_MS
  if (raw && /^\d+$/.test(raw)) return Number(raw)
  return DEFAULT_STALE_MS
}

function isStandingRow(value: unknown): value is SimpleStanding {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<SimpleStanding>
  return (
    typeof row.rank === 'number' &&
    row.team != null &&
    typeof row.team.id === 'number' &&
    typeof row.team.name === 'string' &&
    typeof row.points === 'number'
  )
}

export function parseStandingsPayload(data: unknown): SimpleStanding[] {
  if (!Array.isArray(data)) return []
  return data.filter(isStandingRow)
}

export async function getCachedStandings(
  leagueId: number,
  season: number,
  opts: { maxAgeMs?: number } = {}
): Promise<{ rows: SimpleStanding[]; fetchedAt: Date } | null> {
  if (!Number.isFinite(leagueId) || leagueId <= 0) return null
  if (!Number.isFinite(season) || season <= 0) return null

  try {
    const row = await prisma.sportsStandingsCache.findUnique({
      where: { leagueId_season: { leagueId, season } },
      select: { data: true, fetchedAt: true },
    })
    if (!row) return null

    const maxAgeMs = opts.maxAgeMs ?? readStaleMs()
    if (Date.now() - row.fetchedAt.getTime() > maxAgeMs) return null

    const rows = parseStandingsPayload(row.data)
    if (rows.length === 0) return null

    return { rows, fetchedAt: row.fetchedAt }
  } catch (err) {
    console.warn(`[sports-cache] read failed league=${leagueId} season=${season}:`, err)
    return null
  }
}

export async function getFreshCachedStandings(
  leagueId: number,
  season: number
): Promise<SimpleStanding[] | null> {
  const cached = await getCachedStandings(leagueId, season, { maxAgeMs: readFreshMs() })
  return cached?.rows ?? null
}

export async function saveCachedStandings(
  leagueId: number,
  season: number,
  rows: SimpleStanding[]
): Promise<void> {
  if (rows.length === 0) return
  if (!Number.isFinite(leagueId) || leagueId <= 0) return
  if (!Number.isFinite(season) || season <= 0) return

  try {
    await prisma.sportsStandingsCache.upsert({
      where: { leagueId_season: { leagueId, season } },
      create: {
        leagueId,
        season,
        data: rows,
      },
      update: {
        data: rows,
        fetchedAt: new Date(),
      },
    })
  } catch (err) {
    console.warn(`[sports-cache] write failed league=${leagueId} season=${season}:`, err)
  }
}
