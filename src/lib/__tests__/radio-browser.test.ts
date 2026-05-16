import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  filterPlayable,
  normalizeStation,
  searchStations,
  type RadioBrowserStation,
} from '@/lib/radio-browser'

function makeRaw(overrides: Partial<RadioBrowserStation> = {}): RadioBrowserStation {
  return {
    stationuuid: '11111111-2222-3333-4444-555555555555',
    name: 'Test FM',
    url: 'https://example.com/stream.mp3',
    url_resolved: 'https://example.com/stream.mp3',
    homepage: 'https://example.com',
    favicon: 'https://example.com/icon.png',
    tags: 'salsa,latin',
    country: 'Colombia',
    countrycode: 'CO',
    language: 'spanish',
    codec: 'MP3',
    bitrate: 128,
    votes: 100,
    clickcount: 250,
    lastcheckok: 1,
    ...overrides,
  }
}

describe('normalizeStation', () => {
  it('maps raw fields and splits tags', () => {
    const s = normalizeStation(makeRaw())
    expect(s.id).toBe('11111111-2222-3333-4444-555555555555')
    expect(s.name).toBe('Test FM')
    expect(s.streamUrl).toBe('https://example.com/stream.mp3')
    expect(s.tags).toEqual(['salsa', 'latin'])
    expect(s.country).toBe('Colombia')
    expect(s.codec).toBe('MP3')
    expect(s.bitrate).toBe(128)
  })

  it('prefers url_resolved over url', () => {
    const s = normalizeStation(makeRaw({ url: 'https://a/x', url_resolved: 'https://b/y' }))
    expect(s.streamUrl).toBe('https://b/y')
  })

  it('omits empty favicon and tags', () => {
    const s = normalizeStation(makeRaw({ favicon: '', tags: '' }))
    expect(s.logoUrl).toBeUndefined()
    expect(s.tags).toBeUndefined()
  })

  it('handles missing name with safe fallback', () => {
    const s = normalizeStation(makeRaw({ name: '' as unknown as string }))
    expect(s.name).toBe('Unknown')
  })
})

describe('filterPlayable', () => {
  it('drops http streams (mixed content)', () => {
    const list = [
      normalizeStation(makeRaw({ stationuuid: 'a', url_resolved: 'http://insecure/x' })),
      normalizeStation(makeRaw({ stationuuid: 'b', url_resolved: 'https://secure/x' })),
    ]
    const playable = filterPlayable(list)
    expect(playable).toHaveLength(1)
    expect(playable[0].id).toBe('b')
  })

  it('drops invalid or empty urls', () => {
    const list = [
      normalizeStation(makeRaw({ stationuuid: 'a', url: '', url_resolved: '' })),
      normalizeStation(makeRaw({ stationuuid: 'b', url_resolved: 'not a url' })),
      normalizeStation(makeRaw({ stationuuid: 'c', url_resolved: 'https://ok/x' })),
    ]
    const playable = filterPlayable(list)
    expect(playable.map(s => s.id)).toEqual(['c'])
  })
})

describe('searchStations', () => {
  const realFetch = global.fetch

  // Builds a fetch mock that resolves /json/servers to a fixed mirror list
  // and forwards station search calls to the provided handler.
  function makeFetchMock(
    searchHandler: (url: string) => Promise<Response> | Response
  ) {
    const fn = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.endsWith('/json/servers')) {
        return new Response(
          JSON.stringify([
            { name: 'mirror-a.test' },
            { name: 'mirror-b.test' },
            { name: 'mirror-c.test' },
          ]),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      return searchHandler(url)
    })
    return fn
  }

  beforeEach(() => {
    global.fetch = vi.fn()
  })
  afterEach(() => {
    global.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('calls Radio Browser with mapped params and caches results', async () => {
    const responseBody = [
      makeRaw({ stationuuid: '11111111-2222-3333-4444-555555555555' }),
      makeRaw({ stationuuid: '22222222-3333-4444-5555-666666666666', url_resolved: 'http://insecure/x' }),
    ]
    const fetchMock = makeFetchMock(async () => {
      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const first = await searchStations({ query: 'tropic-' + Date.now(), countryCode: 'co', limit: 30 })
    expect(first).toHaveLength(1)
    expect(first[0].id).toBe('11111111-2222-3333-4444-555555555555')

    const second = await searchStations({ query: first[0].id ? 'tropic-' + first[0].id : 'tropic', countryCode: 'co', limit: 30 })
    expect(second.length).toBeGreaterThanOrEqual(1)

    // Verify the search URL carries the expected query string.
    const searchCall = fetchMock.mock.calls.find(c =>
      String(c[0]).includes('/json/stations/search')
    )
    expect(searchCall).toBeDefined()
    const searchUrl = String(searchCall![0])
    expect(searchUrl).toContain('countrycode=CO')
    expect(searchUrl).toContain('hidebroken=true')
  })

  it('throws after retrying all mirrors on non-ok responses', async () => {
    const fetchMock = makeFetchMock(async () => {
      return new Response('{}', { status: 500 })
    })
    global.fetch = fetchMock as unknown as typeof fetch

    await expect(
      searchStations({ query: 'unique-query-' + Date.now(), limit: 10 })
    ).rejects.toThrow(/Radio Browser mirror .* returned 500/)

    // 1 discovery call + several search retries.
    const searchAttempts = fetchMock.mock.calls.filter(c =>
      String(c[0]).includes('/json/stations/search')
    )
    expect(searchAttempts.length).toBeGreaterThanOrEqual(2)
  })

  it('retries on a different mirror when the first attempt fails', async () => {
    const responseBody = [
      makeRaw({ stationuuid: '33333333-4444-5555-6666-777777777777' }),
    ]
    let searchAttempts = 0
    const fetchMock = makeFetchMock(async () => {
      searchAttempts++
      if (searchAttempts === 1) {
        return new Response('{}', { status: 503 })
      }
      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const out = await searchStations({
      query: 'flaky-' + Date.now(),
      countryCode: 'CO',
      limit: 10,
    })
    expect(out).toHaveLength(1)

    const searchCalls = fetchMock.mock.calls.filter(c =>
      String(c[0]).includes('/json/stations/search')
    )
    expect(searchCalls.length).toBe(2)
    const firstHost = new URL(String(searchCalls[0][0])).hostname
    const secondHost = new URL(String(searchCalls[1][0])).hostname
    expect(firstHost).not.toBe(secondHost)
  })
})
