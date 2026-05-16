/**
 * Icecast / SHOUTcast in-stream metadata reader.
 *
 * How it works (Icy protocol):
 *  1. Client sends `Icy-MetaData: 1` header on the GET request.
 *  2. Server responds with `icy-metaint: <N>` header. Audio bytes are
 *     interleaved with metadata blocks: every N bytes of audio are followed
 *     by a 1-byte length prefix L; if L > 0, the next L * 16 bytes are an
 *     ASCII metadata payload like `StreamTitle='Artist - Title';`.
 *
 * This implementation reads only enough bytes to capture the first metadata
 * block, then aborts the request. That keeps bandwidth minimal (~one block)
 * and prevents the proxy from accidentally streaming audio.
 *
 * Security considerations:
 *  - SSRF protection: refuses non-HTTPS URLs, private IP literals, and
 *    common loopback hostnames.
 *  - Hard timeout (default 4s) on the upstream request.
 *  - Caps total bytes read so a malicious server can't make us spin forever.
 */

const DEFAULT_TIMEOUT_MS = 4000
const MAX_BYTES_READ = 64 * 1024 // 64 KiB is enough to capture the first metadata block from any sane icy-metaint.
const USER_AGENT = 'LatinTerritory/1.0 (https://latinterritory.com)'

export type StreamMetadata = {
  title?: string
  artist?: string
}

/**
 * Parses an Icy metadata payload of the form:
 *   StreamTitle='Artist - Title';StreamUrl='...';
 * Tolerates double-quoted variants and trailing NULs (padding to L*16).
 */
export function parseIcyMetadataBlock(block: string): StreamMetadata {
  const cleaned = block.replace(/\0+$/u, '').trim()
  if (!cleaned) return {}

  // Capture value between matching single or double quotes after `StreamTitle=`.
  const titleMatch = cleaned.match(/StreamTitle=(['"])([\s\S]*?)\1\s*;/u)
  const raw = titleMatch?.[2]?.trim()
  if (!raw) return {}

  // Common encodings: "Artist - Title" or "Artist – Title" (en/em dashes).
  const splitMatch = raw.match(/^(.+?)\s+[-–—]\s+(.+)$/u)
  if (splitMatch) {
    return { artist: splitMatch[1].trim(), title: splitMatch[2].trim() }
  }
  return { title: raw }
}

/**
 * Scans a buffer collected from an icy stream for the first metadata block.
 * Returns null if no complete block was captured in the provided bytes.
 *
 * The Icy framing alternates audio (metaInt bytes) and metadata blocks:
 *   [audio…N bytes][len byte L][meta payload L*16 bytes][audio…N bytes]…
 */
export function extractFirstMetadataBlock(
  buffer: Uint8Array,
  metaInt: number
): string | null {
  if (metaInt <= 0 || buffer.length <= metaInt) return null
  const lengthByte = buffer[metaInt]
  const metaLen = lengthByte * 16
  if (metaLen === 0) return ''
  const start = metaInt + 1
  const end = start + metaLen
  if (buffer.length < end) return null
  return decodeIcyText(buffer.slice(start, end))
}

/**
 * Decode an Icy metadata byte slice. The original Icy protocol mandated
 * latin-1, but most modern Icecast/SHOUTcast servers emit UTF-8. Try UTF-8
 * strictly first; only fall back to latin-1 when the bytes are not valid
 * UTF-8 (mojibake protection).
 */
function decodeIcyText(bytes: Uint8Array): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder('latin1').decode(bytes)
  }
}

/**
 * Loopback / private network blocklist. Conservative on purpose:
 *  - rejects literal IPv4 in RFC1918 ranges and 127/8
 *  - rejects ::1 and link-local literals
 *  - rejects common metadata service hostnames
 *
 * Public DNS is intentionally NOT resolved here to keep the function pure.
 * For an extra layer, deploy this behind an egress allowlist or use a
 * dedicated worker with restricted networking.
 */
export function isSafeStreamHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (!h || h === 'localhost' || h.endsWith('.localhost')) return false
  if (h === '::1' || h.startsWith('[::1')) return false
  if (h === 'metadata.google.internal') return false
  if (h === '169.254.169.254') return false // AWS / GCP metadata

  // IPv4 literal check.
  const ipv4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/u)
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number)
    if (a === 10) return false
    if (a === 127) return false
    if (a === 0) return false
    if (a === 169 && b === 254) return false
    if (a === 172 && b >= 16 && b <= 31) return false
    if (a === 192 && b === 168) return false
  }
  return true
}

export type FetchMetadataOptions = {
  timeoutMs?: number
  maxBytes?: number
}

/**
 * Fetches the first Icy metadata block from a stream URL. Returns null when
 * the stream does not expose Icy metadata (missing icy-metaint header) or
 * when no metadata block is captured within the byte budget.
 *
 * Throws on network errors, timeouts, refused hosts and non-HTTPS URLs;
 * callers should catch and degrade gracefully (metadata is best-effort).
 */
export async function fetchIcyMetadata(
  streamUrl: string,
  opts: FetchMetadataOptions = {}
): Promise<StreamMetadata | null> {
  let url: URL
  try {
    url = new URL(streamUrl)
  } catch {
    throw new Error('Invalid stream URL')
  }
  if (url.protocol !== 'https:') {
    throw new Error('Only HTTPS stream URLs are allowed')
  }
  if (!isSafeStreamHost(url.hostname)) {
    throw new Error('Refused private/loopback host')
  }

  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const maxBytes = Math.min(opts.maxBytes ?? MAX_BYTES_READ, MAX_BYTES_READ)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': USER_AGENT,
        Accept: '*/*',
      },
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!res.ok) throw new Error(`Upstream returned ${res.status}`)
    const metaIntHeader = res.headers.get('icy-metaint')
    if (!metaIntHeader) return null
    const metaInt = parseInt(metaIntHeader, 10)
    if (!Number.isFinite(metaInt) || metaInt <= 0) return null

    const body = res.body
    if (!body) return null
    const reader = body.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    let scanOffset = 0
    try {
      while (total < maxBytes) {
        const { done, value } = await reader.read()
        if (done || !value) break
        chunks.push(value)
        total += value.byteLength

        // Walk every metadata boundary captured so far. Many SHOUTcast servers
        // emit an empty block (length byte 0 = "no change") in between songs,
        // so we keep scanning subsequent blocks until we capture a real title
        // or run out of bytes.
        const merged = mergeChunks(chunks, total)
        while (scanOffset + metaInt + 1 <= merged.length) {
          const lengthByte = merged[scanOffset + metaInt]
          const metaLen = lengthByte * 16
          const blockEnd = scanOffset + metaInt + 1 + metaLen
          if (blockEnd > merged.length) break
          if (metaLen > 0) {
            const slice = merged.slice(scanOffset + metaInt + 1, blockEnd)
            const text = decodeIcyText(slice)
            const parsed = parseIcyMetadataBlock(text)
            if (parsed.title) return parsed
          }
          // Skip past this audio+meta frame and try the next one.
          scanOffset = blockEnd
        }
      }
      return null
    } finally {
      try { await reader.cancel() } catch { /* ignore */ }
    }
  } finally {
    clearTimeout(timer)
  }
}

function mergeChunks(chunks: Uint8Array[], total: number): Uint8Array {
  if (chunks.length === 1) return chunks[0]
  const merged = new Uint8Array(total)
  let offset = 0
  for (const c of chunks) {
    merged.set(c, offset)
    offset += c.byteLength
  }
  return merged
}
