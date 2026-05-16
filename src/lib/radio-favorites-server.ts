import { prisma } from '@/lib/prisma'
import type { Station } from '@/components/providers/audio-provider'

/**
 * Server-side service layer for FavoriteStation. Keeps Prisma usage out of
 * route handlers so it can be unit-tested with a mock client.
 *
 * Storage size is capped at MAX_PER_USER to prevent unbounded growth from a
 * compromised account or runaway client; the oldest entry is evicted when
 * the limit is reached.
 */

const MAX_PER_USER = 200

export type FavoriteStationInput = {
  stationId: string
  name: string
  streamUrl: string
  homepage?: string | null
  logoUrl?: string | null
  country?: string | null
  countryCode?: string | null
  language?: string | null
  codec?: string | null
  bitrate?: number | null
  tags?: string[]
}

type FavoriteRow = {
  id: string
  stationId: string
  name: string
  streamUrl: string
  homepage: string | null
  logoUrl: string | null
  country: string | null
  countryCode: string | null
  language: string | null
  codec: string | null
  bitrate: number | null
  tags: string[]
  createdAt: Date
}

/**
 * Map a Prisma row to the public `Station` shape used by the audio provider.
 * Nulls are stripped to keep the JSON contract clean for the client.
 */
export function rowToStation(row: FavoriteRow): Station {
  return {
    id: row.stationId,
    name: row.name,
    streamUrl: row.streamUrl,
    homepage: row.homepage ?? undefined,
    logoUrl: row.logoUrl ?? undefined,
    country: row.country ?? undefined,
    countryCode: row.countryCode ?? undefined,
    language: row.language ?? undefined,
    codec: row.codec ?? undefined,
    bitrate: row.bitrate ?? undefined,
    tags: row.tags?.length ? row.tags : undefined,
  }
}

export async function listFavorites(userId: string): Promise<Station[]> {
  const rows = await prisma.favoriteStation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: MAX_PER_USER,
  })
  return rows.map(rowToStation)
}

/**
 * Idempotent upsert: re-adding an existing favorite refreshes its metadata
 * (useful when station info changes upstream) without throwing.
 * If the user is at the cap, the oldest entry is removed first.
 */
export async function addFavorite(
  userId: string,
  input: FavoriteStationInput
): Promise<Station> {
  const count = await prisma.favoriteStation.count({ where: { userId } })
  if (count >= MAX_PER_USER) {
    const oldest = await prisma.favoriteStation.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    if (oldest) {
      await prisma.favoriteStation.delete({ where: { id: oldest.id } })
    }
  }

  const row = await prisma.favoriteStation.upsert({
    where: { userId_stationId: { userId, stationId: input.stationId } },
    create: {
      userId,
      stationId: input.stationId,
      name: input.name,
      streamUrl: input.streamUrl,
      homepage: input.homepage ?? null,
      logoUrl: input.logoUrl ?? null,
      country: input.country ?? null,
      countryCode: input.countryCode ?? null,
      language: input.language ?? null,
      codec: input.codec ?? null,
      bitrate: input.bitrate ?? null,
      tags: input.tags ?? [],
    },
    update: {
      name: input.name,
      streamUrl: input.streamUrl,
      homepage: input.homepage ?? null,
      logoUrl: input.logoUrl ?? null,
      country: input.country ?? null,
      countryCode: input.countryCode ?? null,
      language: input.language ?? null,
      codec: input.codec ?? null,
      bitrate: input.bitrate ?? null,
      tags: input.tags ?? [],
    },
  })
  return rowToStation(row)
}

/**
 * Idempotent delete: returns true when a row was removed, false when the
 * favorite did not exist (so the route can answer 204 either way).
 */
export async function removeFavorite(userId: string, stationId: string): Promise<boolean> {
  const result = await prisma.favoriteStation.deleteMany({
    where: { userId, stationId },
  })
  return result.count > 0
}

/**
 * Bulk import used when a logged-in user has local-only favorites that
 * need to be reconciled with the server (post-login migration).
 * Skips duplicates silently and respects the per-user cap.
 */
export async function bulkAddFavorites(
  userId: string,
  inputs: FavoriteStationInput[]
): Promise<Station[]> {
  if (!inputs.length) return listFavorites(userId)
  for (const input of inputs.slice(0, MAX_PER_USER)) {
    await addFavorite(userId, input)
  }
  return listFavorites(userId)
}
