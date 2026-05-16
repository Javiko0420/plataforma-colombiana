/**
 * Radio Browser API client.
 *
 * Radio Browser (https://www.radio-browser.info/) is a community-maintained, free
 * directory of radio stations worldwide. It does not require an API key, but asks
 * clients to identify themselves through a descriptive User-Agent.
 *
 * Why a server-side client (instead of calling the API from the browser):
 *  - Avoid CORS friction and hide the chosen mirror server from the client.
 *  - Apply HTTPS-only and codec filters to prevent mixed-content failures
 *    when the site is served over HTTPS (e.g. Vercel).
 *  - Cache responses to reduce latency and lower load on the public API.
 */

export type RadioBrowserStation = {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  homepage: string
  favicon: string
  tags: string
  country: string
  countrycode: string
  language: string
  codec: string
  bitrate: number
  votes: number
  clickcount: number
  lastcheckok: number
}

export type NormalizedStation = {
  id: string
  name: string
  streamUrl: string
  homepage?: string
  logoUrl?: string
  country?: string
  countryCode?: string
  language?: string
  codec?: string
  bitrate?: number
  tags?: string[]
  votes?: number
  clickCount?: number
}

export type SearchRadioOptions = {
  query?: string
  country?: string
  countryCode?: string
  language?: string
  tag?: string
  limit?: number
  offset?: number
  order?: 'votes' | 'clickcount' | 'name' | 'random'
  hidebroken?: boolean
}

const USER_AGENT = 'LatinTerritory/1.0 (https://latinterritory.com)'

// Conservative fallback mirror list. Used when dynamic discovery (below)
// is unavailable or fails. The list can become stale: as of 2026 several
// historical mirrors (at1, nl1) are offline, so we rely on discovery first
// and only fall back here as a last resort.
const STATIC_MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
  'https://fi1.api.radio-browser.info',
] as const

const SERVERS_DISCOVERY_URL = 'https://all.api.radio-browser.info/json/servers'
const MIRROR_TTL_MS = 60 * 60 * 1000 // refresh discovery hourly

type MirrorState = {
  pool: string[]
  resolvedAt: number
}
let mirrorState: MirrorState | null = null
let lastPicked: string | null = null

/**
 * Resolve the current pool of healthy Radio Browser mirrors. The official
 * registry lives at all.api.radio-browser.info/json/servers and returns the
 * list of currently-known nodes; we cache for an hour to minimize lookups.
 *
 * Falls back to the curated STATIC_MIRRORS list when discovery fails so the
 * feature continues working even if the registry itself is degraded.
 */
async function getMirrorPool(): Promise<string[]> {
  const now = Date.now()
  if (mirrorState && now - mirrorState.resolvedAt < MIRROR_TTL_MS) {
    return mirrorState.pool
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(SERVERS_DISCOVERY_URL, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (res.ok) {
      const json = (await res.json()) as Array<{ name?: string }>
      const pool = Array.from(
        new Set(
          json
            .map(s => (typeof s.name === 'string' ? s.name.trim() : ''))
            .filter(Boolean)
            .map(name => `https://${name}`)
        )
      )
      if (pool.length > 0) {
        mirrorState = { pool, resolvedAt: now }
        return pool
      }
    }
  } catch {
    // Discovery failed → fall through to static list.
  }
  mirrorState = { pool: [...STATIC_MIRRORS], resolvedAt: now }
  return mirrorState.pool
}

function rememberPicked(url: string): string {
  lastPicked = url
  return url
}

// In-memory response cache. Edge/server runtime memory is per-instance; this
// keeps p95 latency low for repeated searches without external infra.
type CacheEntry = { ts: number; value: NormalizedStation[] }
const responseCache = new Map<string, CacheEntry>()
const RESPONSE_TTL_MS = 5 * 60 * 1000 // 5 min

function cacheKey(opts: SearchRadioOptions): string {
  return JSON.stringify({
    q: (opts.query || '').toLowerCase().trim(),
    c: (opts.country || '').toLowerCase().trim(),
    cc: (opts.countryCode || '').toUpperCase().trim(),
    l: (opts.language || '').toLowerCase().trim(),
    t: (opts.tag || '').toLowerCase().trim(),
    lim: Math.min(opts.limit ?? 30, 100),
    off: Math.max(opts.offset ?? 0, 0),
    ord: opts.order ?? 'votes',
    hb: opts.hidebroken ?? true,
  })
}

/**
 * Map a raw Radio Browser station to the normalized shape the UI consumes.
 * - Prefers url_resolved over url (already follows redirects).
 * - Drops favicon when empty so the UI can render a fallback.
 */
export function normalizeStation(raw: RadioBrowserStation): NormalizedStation {
  const tags = (raw.tags || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  return {
    id: raw.stationuuid,
    name: raw.name?.trim() || 'Unknown',
    streamUrl: raw.url_resolved || raw.url,
    homepage: raw.homepage || undefined,
    logoUrl: raw.favicon || undefined,
    country: raw.country || undefined,
    countryCode: raw.countrycode || undefined,
    language: raw.language || undefined,
    codec: raw.codec || undefined,
    bitrate: typeof raw.bitrate === 'number' ? raw.bitrate : undefined,
    tags: tags.length ? tags : undefined,
    votes: typeof raw.votes === 'number' ? raw.votes : undefined,
    clickCount: typeof raw.clickcount === 'number' ? raw.clickcount : undefined,
  }
}

/**
 * Filter out stations that cannot be played safely from an HTTPS page.
 * - HTTP streams trigger mixed-content blocking in modern browsers.
 * - Empty stream URLs are dropped.
 * - Unknown codecs are kept; the <audio> element will simply error if unsupported.
 */
export function filterPlayable(stations: NormalizedStation[]): NormalizedStation[] {
  return stations.filter(s => {
    if (!s.streamUrl) return false
    try {
      const url = new URL(s.streamUrl)
      return url.protocol === 'https:'
    } catch {
      return false
    }
  })
}

const REQUEST_TIMEOUT_MS = 8000
const MAX_RETRIES = 4

async function callMirror(path: string, init?: RequestInit): Promise<Response> {
  // Try up to MAX_RETRIES distinct mirrors. Two factors make this important:
  //  1. The public mirror pool churns (nodes go offline without notice).
  //  2. Rapid typing in the search box triggers many requests; a single
  //     misbehaving node should not poison the user experience.
  const pool = await getMirrorPool()
  if (pool.length === 0) throw new Error('Radio Browser: no mirrors available')

  const tried = new Set<string>()
  // Bias the first attempt toward the most recently successful mirror,
  // then shuffle the rest for load distribution.
  const ordered = pool.slice()
  if (lastPicked) {
    const idx = ordered.indexOf(lastPicked)
    if (idx > 0) {
      ordered.splice(idx, 1)
      ordered.unshift(lastPicked)
    }
  }
  // Lightweight shuffle for the tail so consecutive requests rotate.
  for (let i = ordered.length - 1; i > 1; i--) {
    const j = 1 + Math.floor(Math.random() * (i))
    ;[ordered[i], ordered[j]] = [ordered[j], ordered[i]]
  }

  let lastError: unknown
  for (const base of ordered) {
    if (tried.size >= MAX_RETRIES) break
    if (tried.has(base)) continue
    tried.add(base)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(`${base}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
          ...(init?.headers || {}),
        },
      })
      if (res.ok) {
        rememberPicked(base)
        return res
      }
      lastError = new Error(`Radio Browser mirror ${base} returned ${res.status}`)
    } catch (err) {
      lastError = err
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error('Radio Browser: all mirrors failed')
}

/**
 * Search stations via Radio Browser. Results are normalized, deduped by id,
 * filtered to playable HTTPS streams, and cached in-memory for 5 minutes.
 */
export async function searchStations(opts: SearchRadioOptions): Promise<NormalizedStation[]> {
  const key = cacheKey(opts)
  const now = Date.now()
  const cached = responseCache.get(key)
  if (cached && now - cached.ts < RESPONSE_TTL_MS) {
    return cached.value
  }

  const params = new URLSearchParams()
  if (opts.query) params.set('name', opts.query)
  if (opts.country) params.set('country', opts.country)
  if (opts.countryCode) params.set('countrycode', opts.countryCode.toUpperCase())
  if (opts.language) params.set('language', opts.language)
  if (opts.tag) params.set('tag', opts.tag)
  params.set('limit', String(Math.min(opts.limit ?? 30, 100)))
  params.set('offset', String(Math.max(opts.offset ?? 0, 0)))
  params.set('order', opts.order ?? 'votes')
  params.set('reverse', 'true')
  params.set('hidebroken', String(opts.hidebroken ?? true))

  const res = await callMirror(`/json/stations/search?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`Radio Browser error: ${res.status}`)
  }
  const data = (await res.json()) as RadioBrowserStation[]
  const normalized = data.map(normalizeStation)
  const seen = new Set<string>()
  const deduped = normalized.filter(s => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })
  const playable = filterPlayable(deduped)
  responseCache.set(key, { ts: now, value: playable })
  return playable
}

/**
 * Fire-and-forget click counter. Radio Browser tracks station popularity via
 * the /url/:uuid endpoint. We do not await the response — it is purely
 * telemetry to help the community ranking.
 */
export async function registerClick(stationUuid: string): Promise<void> {
  try {
    await callMirror(`/json/url/${encodeURIComponent(stationUuid)}`)
  } catch {
    // Telemetry is best-effort. Never let it break user playback.
  }
}
