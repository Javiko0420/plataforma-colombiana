export type ApiFootballErrorCode =
  | 'UPSTREAM_ERROR'
  | 'TIMEOUT'
  | 'VALIDATION_ERROR'
  | 'EMPTY_RESPONSE'
  | 'MISSING_API_KEY'
  | 'HTTP_ERROR'
  | 'NOT_FOUND'

export class ApiFootballError extends Error {
  constructor(
    public readonly code: ApiFootballErrorCode,
    message: string,
    public readonly detail?: unknown
  ) {
    super(message)
    this.name = 'ApiFootballError'
  }
}
