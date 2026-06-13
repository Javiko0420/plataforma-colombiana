import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { ApiFootballError } from '../errors'

// --- Module mocks (hoisted before imports) ---

vi.mock('../api-football-client', () => ({
  fetchApiFootball: vi.fn(),
}))

vi.mock('../cache', () => {
  let store: Record<string, unknown> = {}
  return {
    worldcupCache: {
      get: vi.fn((key: string) => store[key] ?? null),
      set: vi.fn((key: string, value: unknown) => { store[key] = value }),
      _reset: () => { store = {} },
    },
  }
})

import { GET } from '@/app/api/sports/worldcup/fixtures/route'
import { fetchApiFootball } from '../api-football-client'
import { worldcupCache } from '../cache'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(params?: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/sports/worldcup/fixtures')
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  return new NextRequest(url)
}

const MOCK_FIXTURE = {
  fixture: {
    id: 1001,
    date: '2026-06-11T18:00:00+00:00',
    timestamp: 1749650400,
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    venue: { id: 550, name: 'SoFi Stadium', city: 'Los Angeles' },
  },
  league: { round: 'Group Stage - 1' },
  teams: {
    home: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png', winner: null },
    away: { id: 24, name: 'Croatia', logo: 'https://example.com/cro.png', winner: null },
  },
  goals: { home: null, away: null },
}

const MOCK_ENVELOPE_ONE = { errors: {}, results: 1, response: [MOCK_FIXTURE] }
const MOCK_ENVELOPE_EMPTY = { errors: {}, results: 0, response: [] }

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GET /api/sports/worldcup/fixtures', () => {
  beforeEach(() => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    ;(worldcupCache as unknown as { _reset: () => void })._reset?.()
    vi.mocked(fetchApiFootball).mockReset()
  })

  // ── Upstream call params ───────────────────────────────────────────────────

  it('calls upstream with only league and season when no query params', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_ONE)
    await GET(makeRequest())
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures',
      { league: '1', season: '2026' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  it('includes round when provided', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_ONE)
    await GET(makeRequest({ round: 'Group Stage - 1' }))
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures',
      { league: '1', season: '2026', round: 'Group Stage - 1' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  it('includes team (coerced to string) when provided', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_ONE)
    await GET(makeRequest({ team: '6' }))
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures',
      { league: '1', season: '2026', team: '6' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  it('includes date when provided', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_ONE)
    await GET(makeRequest({ date: '2026-06-11' }))
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures',
      { league: '1', season: '2026', date: '2026-06-11' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  it('includes all three filters when all are provided', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_ONE)
    await GET(makeRequest({ round: 'Group Stage - 2', team: '24', date: '2026-06-15' }))
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures',
      { league: '1', season: '2026', round: 'Group Stage - 2', team: '24', date: '2026-06-15' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  // ── 200 success ────────────────────────────────────────────────────────────

  it('returns 200 with mapped fixtures on cache miss', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_ONE)
    const res = await GET(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.fixtures).toHaveLength(1)
    expect(body.fixtures[0].id).toBe(1001)
    expect(body.fixtures[0].round).toBe('Group Stage - 1') // promoted from league.round
    expect(typeof body.cachedAt).toBe('string')
  })

  it('returns 200 with fixtures:[] when upstream returns empty array (valid, no matches that day)', async () => {
    vi.mocked(fetchApiFootball).mockResolvedValue(MOCK_ENVELOPE_EMPTY)
    const res = await GET(makeRequest({ date: '2026-06-10' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.fixtures).toEqual([])
    expect(typeof body.cachedAt).toBe('string')
    // Verify upstream WAS called (not treated as error)
    expect(fetchApiFootball).toHaveBeenCalled()
  })

  // ── Cache hit ──────────────────────────────────────────────────────────────

  it('returns cached data without calling upstream when cache is warm', async () => {
    const cachedPayload = { fixtures: [{ id: 999, round: 'Final' }], cachedAt: '2026-01-01T00:00:00.000Z' }
    vi.mocked(worldcupCache.get).mockReturnValue(cachedPayload)
    const res = await GET(makeRequest())
    expect(fetchApiFootball).not.toHaveBeenCalled()
    const body = await res.json()
    expect(body.cachedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  // ── 400 validation errors ──────────────────────────────────────────────────

  it('returns 400 for date in wrong format (DD/MM/YYYY)', async () => {
    const res = await GET(makeRequest({ date: '11/06/2026' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error.code).toBe('VALIDATION_ERROR')
    expect(fetchApiFootball).not.toHaveBeenCalled()
  })

  it('returns 400 for date with invalid month (2026-13-45)', async () => {
    const res = await GET(makeRequest({ date: '2026-13-45' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for team that is not a number', async () => {
    const res = await GET(makeRequest({ team: 'morocco' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for team = 0 (not positive)', async () => {
    const res = await GET(makeRequest({ team: '0' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  it('returns 400 for negative team id', async () => {
    const res = await GET(makeRequest({ team: '-5' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR')
  })

  // ── Upstream errors ────────────────────────────────────────────────────────

  it('returns 502 on UPSTREAM_ERROR', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('UPSTREAM_ERROR', 'Plan limit reached')
    )
    const res = await GET(makeRequest())
    expect(res.status).toBe(502)
    expect((await res.json()).error.code).toBe('UPSTREAM_ERROR')
  })

  it('returns 504 on TIMEOUT', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('TIMEOUT', 'Request timed out')
    )
    const res = await GET(makeRequest())
    expect(res.status).toBe(504)
    expect((await res.json()).error.code).toBe('TIMEOUT')
  })

  it('returns 500 on VALIDATION_ERROR from upstream', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(
      new ApiFootballError('VALIDATION_ERROR', 'Schema mismatch')
    )
    const res = await GET(makeRequest())
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 on unexpected non-ApiFootballError exceptions', async () => {
    vi.mocked(fetchApiFootball).mockRejectedValue(new Error('network blip'))
    const res = await GET(makeRequest())
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })
})
