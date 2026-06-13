import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { z } from 'zod'
import { fetchApiFootball } from '../api-football-client'
import { ApiFootballError } from '../errors'

const SimpleSchema = z.object({
  errors: z.union([z.record(z.string(), z.string()), z.array(z.string()), z.string()]).optional(),
  results: z.number().optional(),
  response: z.array(z.object({ id: z.number() })),
})

const VALID_RESPONSE = {
  errors: {},
  results: 1,
  response: [{ id: 1 }],
}

function mockFetch(body: unknown, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response)
}

describe('fetchApiFootball', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    process.env.API_FOOTBALL_KEY = 'test-key'
  })

  afterEach(() => {
    global.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('returns parsed data on a successful response', async () => {
    mockFetch(VALID_RESPONSE)
    const result = await fetchApiFootball('leagues', { id: '1' }, SimpleSchema)
    expect(result.response).toHaveLength(1)
    expect(result.response[0]!.id).toBe(1)
  })

  it('throws UPSTREAM_ERROR when errors object is non-empty', async () => {
    mockFetch({ errors: { plan: 'Requests limit reached' }, results: 0, response: [] })
    await expect(fetchApiFootball('leagues', {}, SimpleSchema)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiFootballError && e.code === 'UPSTREAM_ERROR'
    )
  })

  it('throws UPSTREAM_ERROR when errors is a non-empty array', async () => {
    mockFetch({ errors: ['invalid token'], results: 0, response: [] })
    await expect(fetchApiFootball('leagues', {}, SimpleSchema)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiFootballError && e.code === 'UPSTREAM_ERROR'
    )
  })

  it('throws EMPTY_RESPONSE when results === 0', async () => {
    mockFetch({ errors: {}, results: 0, response: [] })
    await expect(fetchApiFootball('leagues', {}, SimpleSchema)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiFootballError && e.code === 'EMPTY_RESPONSE'
    )
  })

  it('throws VALIDATION_ERROR when response shape does not match schema', async () => {
    // response items have wrong shape
    mockFetch({ errors: {}, results: 1, response: [{ wrong: true }] })
    await expect(fetchApiFootball('leagues', {}, SimpleSchema)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiFootballError && e.code === 'VALIDATION_ERROR'
    )
  })

  it('throws HTTP_ERROR on a non-2xx response', async () => {
    mockFetch({}, 503)
    await expect(fetchApiFootball('leagues', {}, SimpleSchema)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiFootballError && e.code === 'HTTP_ERROR'
    )
  })

  it('throws TIMEOUT when fetch is aborted', async () => {
    global.fetch = vi.fn().mockRejectedValue(
      Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
    )
    await expect(fetchApiFootball('leagues', {}, SimpleSchema)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiFootballError && e.code === 'TIMEOUT'
    )
  })

  it('throws MISSING_API_KEY when env var is absent', async () => {
    delete process.env.API_FOOTBALL_KEY
    await expect(fetchApiFootball('leagues', {}, SimpleSchema)).rejects.toSatisfy(
      (e: unknown) => e instanceof ApiFootballError && e.code === 'MISSING_API_KEY'
    )
  })
})
