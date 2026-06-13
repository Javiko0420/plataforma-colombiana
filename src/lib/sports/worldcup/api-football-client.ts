import type { ZodSchema } from 'zod'
import { API_FOOTBALL_BASE_URL } from './constants'
import { ApiFootballError } from './errors'
import { wcLogger } from './logger'

function getApiKey(): string {
  const key = process.env.API_FOOTBALL_KEY
  if (!key) {
    throw new ApiFootballError(
      'MISSING_API_KEY',
      'API_FOOTBALL_KEY environment variable is not set'
    )
  }
  return key
}

function buildHeaders(): HeadersInit {
  return {
    'x-apisports-key': getApiKey(),
    accept: 'application/json',
  }
}

function hasErrors(errors: unknown): boolean {
  if (!errors) return false
  if (typeof errors === 'string') return errors.length > 0
  if (Array.isArray(errors)) return errors.length > 0
  if (typeof errors === 'object') return Object.keys(errors as object).length > 0
  return false
}

/**
 * Generic fetch wrapper for API-Football v3.
 *
 * - Validates the response envelope with the provided Zod schema.
 * - Throws typed ApiFootballError for upstream errors, timeouts, empty
 *   responses, and Zod validation failures.
 * - Logs outgoing requests and results without ever logging the API key.
 * - Set allowEmptyResponse: true for endpoints where results:0 is valid
 *   (e.g. fixtures filtered by date with no matches scheduled).
 */
export async function fetchApiFootball<T>(
  endpoint: string,
  params: Record<string, string>,
  schema: ZodSchema<T>,
  options?: { allowEmptyResponse?: boolean }
): Promise<T> {
  const qs = new URLSearchParams(params).toString()
  const url = `${API_FOOTBALL_BASE_URL}/${endpoint}?${qs}`

  wcLogger.info(`request: ${endpoint}`, { params })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8_000)
  const start = Date.now()

  let res: Response
  try {
    res = await fetch(url, {
      headers: buildHeaders(),
      cache: 'no-store',
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    const isAbort =
      err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'))
    if (isAbort) {
      wcLogger.error(`timeout: ${endpoint}`, { params, durationMs: Date.now() - start })
      throw new ApiFootballError('TIMEOUT', `Request to ${endpoint} timed out after 8 s`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }

  if (!res.ok) {
    wcLogger.error(`http error: ${endpoint}`, { status: res.status })
    throw new ApiFootballError(
      'HTTP_ERROR',
      `API-Football responded with HTTP ${res.status} for ${endpoint}`
    )
  }

  const json = (await res.json()) as {
    errors?: unknown
    results?: number
    response?: unknown
  }

  if (hasErrors(json.errors)) {
    wcLogger.error(`upstream error: ${endpoint}`, { errors: json.errors })
    throw new ApiFootballError(
      'UPSTREAM_ERROR',
      `API-Football returned errors for ${endpoint}`,
      json.errors
    )
  }

  const results = json.results ?? (Array.isArray(json.response) ? json.response.length : 0)
  const isEmpty = results === 0 || !json.response || (Array.isArray(json.response) && json.response.length === 0)
  if (isEmpty && !options?.allowEmptyResponse) {
    wcLogger.warn(`empty response: ${endpoint}`, { params })
    throw new ApiFootballError('EMPTY_RESPONSE', `API-Football returned no results for ${endpoint}`)
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    wcLogger.error(`validation error: ${endpoint}`, { issues: parsed.error.issues })
    throw new ApiFootballError(
      'VALIDATION_ERROR',
      `Response from ${endpoint} failed schema validation`,
      parsed.error.issues
    )
  }

  const durationMs = Date.now() - start
  wcLogger.info(`success: ${endpoint}`, { results, durationMs })

  return parsed.data
}
