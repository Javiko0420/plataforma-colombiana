import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { Station } from '@/components/providers/audio-provider'

const STORAGE_KEY = 'radio_favorites_v1'

// Mutable mock so individual tests can toggle session state.
const sessionMock = { status: 'unauthenticated' as 'authenticated' | 'unauthenticated' | 'loading' }

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: sessionMock.status }),
}))

// Import after mock setup so `useSession` resolves to the mock.
const { useRadioFavorites } = await import('@/components/providers/radio-favorites')

const stationA: Station = {
  id: 'aaaa-1111',
  name: 'Test A',
  streamUrl: 'https://example.com/a.mp3',
}
const stationB: Station = {
  id: 'bbbb-2222',
  name: 'Test B',
  streamUrl: 'https://example.com/b.mp3',
}

describe('useRadioFavorites (anonymous)', () => {
  beforeEach(() => {
    sessionMock.status = 'unauthenticated'
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('hydrates from empty storage', () => {
    const { result } = renderHook(() => useRadioFavorites())
    expect(result.current.favorites).toEqual([])
    expect(result.current.hydrated).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('adds, detects and removes a favorite locally', () => {
    const { result } = renderHook(() => useRadioFavorites())
    act(() => {
      result.current.add(stationA)
    })
    expect(result.current.favorites).toHaveLength(1)
    expect(result.current.isFavorite('aaaa-1111')).toBe(true)
    act(() => {
      result.current.remove('aaaa-1111')
    })
    expect(result.current.favorites).toHaveLength(0)
  })

  it('toggle adds and removes', () => {
    const { result } = renderHook(() => useRadioFavorites())
    act(() => {
      result.current.toggle(stationA)
    })
    expect(result.current.isFavorite('aaaa-1111')).toBe(true)
    act(() => {
      result.current.toggle(stationA)
    })
    expect(result.current.isFavorite('aaaa-1111')).toBe(false)
  })

  it('does not duplicate the same station id', () => {
    const { result } = renderHook(() => useRadioFavorites())
    act(() => {
      result.current.add(stationA)
      result.current.add(stationA)
      result.current.add(stationB)
    })
    expect(result.current.favorites.map(s => s.id)).toEqual(['bbbb-2222', 'aaaa-1111'])
  })

  it('persists changes to localStorage', () => {
    const { result, unmount } = renderHook(() => useRadioFavorites())
    act(() => {
      result.current.add(stationA)
    })
    unmount()
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].id).toBe('aaaa-1111')
  })

  it('clear empties the list', () => {
    const { result } = renderHook(() => useRadioFavorites())
    act(() => {
      result.current.add(stationA)
      result.current.add(stationB)
    })
    act(() => {
      result.current.clear()
    })
    expect(result.current.favorites).toHaveLength(0)
  })
})

describe('useRadioFavorites (authenticated)', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    sessionMock.status = 'authenticated'
    window.localStorage.clear()
  })

  afterEach(() => {
    global.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('migrates local favorites to server on mount and loads server list', async () => {
    // Seed local copy that should be uploaded.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([stationA]))

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === '/api/radio/favorites' && init?.method === 'POST') {
        // Bulk upload OK.
        return new Response(
          JSON.stringify({ success: true, data: { stations: [stationA] } }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      }
      if (url === '/api/radio/favorites' && (!init || init.method === undefined)) {
        return new Response(
          JSON.stringify({ success: true, data: { stations: [stationA, stationB] } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected fetch ${init?.method ?? 'GET'} ${url}`)
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const { result } = renderHook(() => useRadioFavorites())

    await waitFor(() => {
      expect(result.current.favorites.map(s => s.id)).toEqual(['aaaa-1111', 'bbbb-2222'])
    })
    // Local copy is cleared once the server becomes the source of truth.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
    // Two fetches: bulk POST + GET.
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('add triggers POST to server', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === '/api/radio/favorites' && (!init || init.method === undefined)) {
        return new Response(
          JSON.stringify({ success: true, data: { stations: [] } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      if (url === '/api/radio/favorites' && init?.method === 'POST') {
        return new Response(
          JSON.stringify({ success: true, data: { station: stationA } }),
          { status: 201, headers: { 'Content-Type': 'application/json' } }
        )
      }
      throw new Error(`Unexpected fetch ${init?.method ?? 'GET'} ${url}`)
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const { result } = renderHook(() => useRadioFavorites())
    await waitFor(() => {
      expect(result.current.favorites).toEqual([])
    })

    act(() => {
      result.current.add(stationA)
    })
    // Optimistic update visible synchronously.
    expect(result.current.isFavorite('aaaa-1111')).toBe(true)

    await waitFor(() => {
      const postCall = fetchMock.mock.calls.find(c => c[1]?.method === 'POST')
      expect(postCall).toBeDefined()
      const body = JSON.parse((postCall![1] as RequestInit).body as string)
      expect(body.stationId).toBe('aaaa-1111')
    })
  })

  it('remove triggers DELETE to server', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url === '/api/radio/favorites' && (!init || init.method === undefined)) {
        return new Response(
          JSON.stringify({ success: true, data: { stations: [stationA] } }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
      }
      if (url.startsWith('/api/radio/favorites/') && init?.method === 'DELETE') {
        return new Response(null, { status: 204 })
      }
      throw new Error(`Unexpected fetch ${init?.method ?? 'GET'} ${url}`)
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const { result } = renderHook(() => useRadioFavorites())
    await waitFor(() => {
      expect(result.current.favorites).toHaveLength(1)
    })

    act(() => {
      result.current.remove('aaaa-1111')
    })

    expect(result.current.favorites).toHaveLength(0)
    await waitFor(() => {
      const del = fetchMock.mock.calls.find(c => (c[1] as RequestInit | undefined)?.method === 'DELETE')
      expect(del).toBeDefined()
      expect(del![0]).toBe('/api/radio/favorites/aaaa-1111')
    })
  })
})
