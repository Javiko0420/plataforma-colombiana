import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  parseIcyMetadataBlock,
  extractFirstMetadataBlock,
  isSafeStreamHost,
  fetchIcyMetadata,
} from '@/lib/icecast-metadata'

describe('parseIcyMetadataBlock', () => {
  it('parses Artist - Title format', () => {
    expect(parseIcyMetadataBlock("StreamTitle='Shakira - Waka Waka';")).toEqual({
      artist: 'Shakira',
      title: 'Waka Waka',
    })
  })

  it('parses double-quoted variant', () => {
    expect(parseIcyMetadataBlock('StreamTitle="Juanes - La Camisa Negra";')).toEqual({
      artist: 'Juanes',
      title: 'La Camisa Negra',
    })
  })

  it('handles en-dash separator', () => {
    expect(parseIcyMetadataBlock("StreamTitle='Carlos Vives – La Tierra del Olvido';")).toEqual({
      artist: 'Carlos Vives',
      title: 'La Tierra del Olvido',
    })
  })

  it('falls back to title-only when no dash is present', () => {
    expect(parseIcyMetadataBlock("StreamTitle='Programa Despierta Cali';")).toEqual({
      title: 'Programa Despierta Cali',
    })
  })

  it('returns empty object on missing StreamTitle', () => {
    expect(parseIcyMetadataBlock("StreamUrl='https://example.com';")).toEqual({})
  })

  it('returns empty object on empty payload', () => {
    expect(parseIcyMetadataBlock('')).toEqual({})
    expect(parseIcyMetadataBlock('\u0000\u0000')).toEqual({})
  })

  it('ignores trailing fields after StreamTitle', () => {
    expect(
      parseIcyMetadataBlock(
        "StreamTitle='Karol G - Tusa';StreamUrl='https://example.com/song';"
      )
    ).toEqual({ artist: 'Karol G', title: 'Tusa' })
  })
})

describe('extractFirstMetadataBlock', () => {
  function buildStream(audio: Uint8Array, payload: string): Uint8Array {
    // Pad the metadata payload to a multiple of 16 bytes; length byte = bytes/16.
    const encoder = new TextEncoder()
    const raw = encoder.encode(payload)
    const blocks = Math.ceil(raw.length / 16)
    const padded = new Uint8Array(blocks * 16)
    padded.set(raw, 0)
    const buf = new Uint8Array(audio.length + 1 + padded.length)
    buf.set(audio, 0)
    buf[audio.length] = blocks
    buf.set(padded, audio.length + 1)
    return buf
  }

  it('extracts payload at the metaInt boundary', () => {
    const audio = new Uint8Array(64).fill(0x55)
    const buf = buildStream(audio, "StreamTitle='Bomba Estéreo - Soy Yo';")
    const block = extractFirstMetadataBlock(buf, 64)
    expect(block).not.toBeNull()
    expect(parseIcyMetadataBlock(block!)).toEqual({
      artist: 'Bomba Estéreo',
      title: 'Soy Yo',
    })
  })

  it('returns null when not enough bytes for a full block', () => {
    const buf = new Uint8Array(50)
    expect(extractFirstMetadataBlock(buf, 64)).toBeNull()
  })

  it('returns empty string when length byte is zero (no metadata yet)', () => {
    const buf = new Uint8Array(64 + 1)
    buf.fill(0x55, 0, 64)
    buf[64] = 0
    expect(extractFirstMetadataBlock(buf, 64)).toBe('')
  })

  it('returns null for invalid metaInt', () => {
    expect(extractFirstMetadataBlock(new Uint8Array(10), 0)).toBeNull()
    expect(extractFirstMetadataBlock(new Uint8Array(10), -5)).toBeNull()
  })

  it('falls back to latin-1 when bytes are not valid UTF-8', () => {
    // "Estéreo" encoded as latin-1: é = 0xE9, which is invalid as a UTF-8
    // continuation byte without a leading byte, so UTF-8 decoding fails
    // and the fallback path kicks in.
    const audio = new Uint8Array(16).fill(0xaa)
    const payload = new Uint8Array([
      0x53, 0x74, 0x72, 0x65, 0x61, 0x6d, 0x54, 0x69, 0x74, 0x6c, 0x65, 0x3d, 0x27, // StreamTitle='
      0x45, 0x73, 0x74, 0xe9, 0x72, 0x65, 0x6f, // Estéreo (latin-1)
      0x27, 0x3b, // ';
    ])
    const blocks = Math.ceil(payload.length / 16)
    const padded = new Uint8Array(blocks * 16)
    padded.set(payload, 0)
    const buf = new Uint8Array(audio.length + 1 + padded.length)
    buf.set(audio, 0)
    buf[audio.length] = blocks
    buf.set(padded, audio.length + 1)

    const block = extractFirstMetadataBlock(buf, 16)
    expect(block).not.toBeNull()
    expect(parseIcyMetadataBlock(block!)).toEqual({ title: 'Estéreo' })
  })
})

describe('isSafeStreamHost', () => {
  it('accepts public hostnames', () => {
    expect(isSafeStreamHost('tupanel.info')).toBe(true)
    expect(isSafeStreamHost('streamtheworld.com')).toBe(true)
    expect(isSafeStreamHost('1.1.1.1')).toBe(true)
  })

  it('rejects loopback and metadata services', () => {
    expect(isSafeStreamHost('localhost')).toBe(false)
    expect(isSafeStreamHost('app.localhost')).toBe(false)
    expect(isSafeStreamHost('127.0.0.1')).toBe(false)
    expect(isSafeStreamHost('::1')).toBe(false)
    expect(isSafeStreamHost('169.254.169.254')).toBe(false)
    expect(isSafeStreamHost('metadata.google.internal')).toBe(false)
  })

  it('rejects RFC1918 private ranges', () => {
    expect(isSafeStreamHost('10.0.0.5')).toBe(false)
    expect(isSafeStreamHost('192.168.1.1')).toBe(false)
    expect(isSafeStreamHost('172.16.0.1')).toBe(false)
    expect(isSafeStreamHost('172.31.255.255')).toBe(false)
    expect(isSafeStreamHost('172.15.0.1')).toBe(true) // outside RFC1918
  })

  it('rejects empty hostname', () => {
    expect(isSafeStreamHost('')).toBe(false)
  })
})

describe('fetchIcyMetadata', () => {
  const realFetch = global.fetch
  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    global.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('rejects non-HTTPS urls', async () => {
    await expect(fetchIcyMetadata('http://example.com/stream')).rejects.toThrow(/HTTPS/i)
  })

  it('rejects loopback urls', async () => {
    await expect(fetchIcyMetadata('https://localhost/stream')).rejects.toThrow(/private/i)
    await expect(fetchIcyMetadata('https://10.0.0.1/stream')).rejects.toThrow(/private/i)
  })

  it('returns null when upstream omits icy-metaint header', async () => {
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: new Headers({}),
      body: new ReadableStream(),
    })
    const out = await fetchIcyMetadata('https://example.com/stream')
    expect(out).toBeNull()
  })

  it('parses metadata when icy-metaint header is present', async () => {
    const audio = new Uint8Array(32).fill(0xaa)
    const encoder = new TextEncoder()
    const payload = encoder.encode("StreamTitle='Marc Anthony - Vivir Mi Vida';")
    const blocks = Math.ceil(payload.length / 16)
    const padded = new Uint8Array(blocks * 16)
    padded.set(payload, 0)
    const streamBytes = new Uint8Array(audio.length + 1 + padded.length)
    streamBytes.set(audio, 0)
    streamBytes[audio.length] = blocks
    streamBytes.set(padded, audio.length + 1)

    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(streamBytes)
        controller.close()
      },
    })

    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'icy-metaint': '32' }),
      body,
    })

    const out = await fetchIcyMetadata('https://example.com/stream')
    expect(out).toEqual({ artist: 'Marc Anthony', title: 'Vivir Mi Vida' })
  })
})
