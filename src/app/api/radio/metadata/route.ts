import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchIcyMetadata, type StreamMetadata } from '@/lib/icecast-metadata'

// Node runtime: edge cannot stream raw bytes from arbitrary upstreams
// reliably (needed for Icy-MetaData byte-interleaved framing).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const querySchema = z.object({
  url: z
    .string()
    .trim()
    .url()
    .refine(v => v.startsWith('https://'), 'url must be HTTPS')
    .max(2048),
})

// In-memory cache. Icy metadata is fairly stable within a song (≥30s typically)
// so a 15s TTL keeps the average user latency near zero without going stale.
type CacheEntry = { ts: number; value: StreamMetadata | null }
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 15 * 1000
const MAX_CACHE_ENTRIES = 500

function cacheGet(key: string): StreamMetadata | null | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    cache.delete(key)
    return undefined
  }
  return entry.value
}

function cacheSet(key: string, value: StreamMetadata | null) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    // Drop the oldest entry to bound memory growth.
    const oldestKey = cache.keys().next().value
    if (oldestKey) cache.delete(oldestKey)
  }
  cache.set(key, { ts: Date.now(), value })
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const parsed = querySchema.safeParse({ url: url.searchParams.get('url') ?? '' })
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid url query parameter' },
      { status: 400 }
    )
  }

  const target = parsed.data.url
  const cached = cacheGet(target)
  if (cached !== undefined) {
    return NextResponse.json(
      { success: true, data: { metadata: cached, cached: true } },
      { headers: { 'Cache-Control': 'public, max-age=10' } }
    )
  }

  try {
    const meta = await fetchIcyMetadata(target)
    cacheSet(target, meta)
    return NextResponse.json(
      { success: true, data: { metadata: meta, cached: false } },
      { headers: { 'Cache-Control': 'public, max-age=10' } }
    )
  } catch {
    // Metadata is best-effort. Cache a null result briefly to avoid
    // hammering a broken upstream from the polling clients.
    cacheSet(target, null)
    return NextResponse.json(
      { success: true, data: { metadata: null, cached: false } },
      { headers: { 'Cache-Control': 'public, max-age=10' } }
    )
  }
}
