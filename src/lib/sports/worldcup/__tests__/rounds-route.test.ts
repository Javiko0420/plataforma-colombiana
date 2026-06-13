import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiFootballError } from '../errors'

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

import { GET } from '@/app/api/sports/worldcup/rounds/route'
import { fetchApiFootball } from '../api-football-client'
import { worldcupCache } from '../cache'

// ─── Mock data ────────────────────────────────────────────────────────────────

const ALL_ROUNDS = ['Group Stage - 1', 'Group Stage - 2', 'Group Stage - 3', 'Round of 16', 'Final']

const MOCK_ALL_ENVELOPE = { errors: {}, results: ALL_ROUNDS.length, response: ALL_ROUNDS }
const MOCK_CURRENT_ENVELOPE = { errors: {}, results: 1, response: ['Round of 16'] }
const MOCK_EMPTY_ENVELOPE = { errors: {}, results: 0, response: [] }

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/sports/worldcup/rounds', () => {
  beforeEach(() => {
    vi.mocked(worldcupCache.get).mockReturnValue(null)
    ;(worldcupCache as unknown as { _reset: () => void })._reset?.()
    vi.mocked(fetchApiFootball).mockReset()
  })

  // ── 200 — normal response ──────────────────────────────────────────────────

  it('returns 200 with rounds and current round on cache miss', async () => {
    vi.mocked(fetchApiFootball)
      .mockResolvedValueOnce(MOCK_ALL_ENVELOPE)
      .mockResolvedValueOnce(MOCK_CURRENT_ENVELOPE)

    const res = await GET()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.rounds).toEqual(ALL_ROUNDS)
    expect(body.current).toBe('Round of 16')
    expect(typeof body.cachedAt).toBe('string')
  })

  it('returns current: null when the current-round call returns []', async () => {
    vi.mocked(fetchApiFootball)
      .mockResolvedValueOnce(MOCK_ALL_ENVELOPE)
      .mockResolvedValueOnce(MOCK_EMPTY_ENVELOPE)

    const body = await (await GET()).json()
    expect(body.rounds).toEqual(ALL_ROUNDS)
    expect(body.current).toBeNull()
  })

  it('returns rounds: [] when the all-rounds call returns []', async () => {
    vi.mocked(fetchApiFootball)
      .mockResolvedValueOnce(MOCK_EMPTY_ENVELOPE)
      .mockResolvedValueOnce(MOCK_EMPTY_ENVELOPE)

    const res = await GET()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.rounds).toEqual([])
    expect(body.current).toBeNull()
  })

  // ── Both calls are made (parallel intent) ─────────────────────────────────

  it('makes exactly two upstream calls on cache miss', async () => {
    vi.mocked(fetchApiFootball)
      .mockResolvedValueOnce(MOCK_ALL_ENVELOPE)
      .mockResolvedValueOnce(MOCK_CURRENT_ENVELOPE)

    await GET()
    expect(fetchApiFootball).toHaveBeenCalledTimes(2)
  })

  it('calls all-rounds without current param', async () => {
    vi.mocked(fetchApiFootball)
      .mockResolvedValueOnce(MOCK_ALL_ENVELOPE)
      .mockResolvedValueOnce(MOCK_CURRENT_ENVELOPE)

    await GET()
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures/rounds',
      { league: '1', season: '2026' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  it('calls current-round with current: "true"', async () => {
    vi.mocked(fetchApiFootball)
      .mockResolvedValueOnce(MOCK_ALL_ENVELOPE)
      .mockResolvedValueOnce(MOCK_CURRENT_ENVELOPE)

    await GET()
    expect(fetchApiFootball).toHaveBeenCalledWith(
      'fixtures/rounds',
      { league: '1', season: '2026', current: 'true' },
      expect.anything(),
      { allowEmptyResponse: true }
    )
  })

  // ── Cache ──────────────────────────────────────────────────────────────────

  it('returns cached data without calling upstream when cache is warm', async () => {
    const cached: { rounds: string[]; current: string | null; cachedAt: string } = {
      rounds: ALL_ROUNDS,
      current: 'Final',
      cachedAt: '2026-07-15T00:00:00.000Z',
    }
    vi.mocked(worldcupCache.get).mockReturnValue(cached)

    const res = await GET()
    expect(fetchApiFootball).not.toHaveBeenCalled()

    const body = await res.json()
    expect(body.cachedAt).toBe('2026-07-15T00:00:00.000Z')
    expect(body.current).toBe('Final')
  })

  it('stores payload in cache after a successful fetch', async () => {
    vi.mocked(fetchApiFootball)
      .mockResolvedValueOnce(MOCK_ALL_ENVELOPE)
      .mockResolvedValueOnce(MOCK_CURRENT_ENVELOPE)

    await GET()
    expect(worldcupCache.set).toHaveBeenCalledWith(
      'worldcup:rounds',
      expect.objectContaining({ rounds: ALL_ROUNDS, current: 'Round of 16' }),
      expect.any(Number)
    )
  })

  // ── Error propagation ──────────────────────────────────────────────────────

  it('returns 502 when the all-rounds call throws UPSTREAM_ERROR', async () => {
    vi.mocked(fetchApiFootball)
      .mockRejectedValueOnce(new ApiFootballError('UPSTREAM_ERROR', 'Plan limit reached'))
      .mockResolvedValueOnce(MOCK_CURRENT_ENVELOPE)

    const res = await GET()
    expect(res.status).toBe(502)
    expect((await res.json()).error.code).toBe('UPSTREAM_ERROR')
  })

  it('returns 502 when the current-round call throws UPSTREAM_ERROR', async () => {
    vi.mocked(fetchApiFootball)
      .mockResolvedValueOnce(MOCK_ALL_ENVELOPE)
      .mockRejectedValueOnce(new ApiFootballError('UPSTREAM_ERROR', 'Plan limit reached'))

    const res = await GET()
    expect(res.status).toBe(502)
    expect((await res.json()).error.code).toBe('UPSTREAM_ERROR')
  })

  it('returns 504 when either call throws TIMEOUT', async () => {
    vi.mocked(fetchApiFootball)
      .mockResolvedValueOnce(MOCK_ALL_ENVELOPE)
      .mockRejectedValueOnce(new ApiFootballError('TIMEOUT', 'Request timed out'))

    const res = await GET()
    expect(res.status).toBe(504)
    expect((await res.json()).error.code).toBe('TIMEOUT')
  })

  it('returns 500 on VALIDATION_ERROR', async () => {
    vi.mocked(fetchApiFootball)
      .mockRejectedValueOnce(new ApiFootballError('VALIDATION_ERROR', 'Schema mismatch'))
      .mockResolvedValueOnce(MOCK_CURRENT_ENVELOPE)

    const res = await GET()
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })

  it('returns 500 on unexpected non-ApiFootballError exception', async () => {
    vi.mocked(fetchApiFootball)
      .mockRejectedValueOnce(new Error('network blip'))
      .mockResolvedValueOnce(MOCK_CURRENT_ENVELOPE)

    const res = await GET()
    expect(res.status).toBe(500)
    expect((await res.json()).error.code).toBe('INTERNAL_ERROR')
  })
})
