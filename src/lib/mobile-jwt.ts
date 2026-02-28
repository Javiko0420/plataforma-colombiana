import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// ── Types ─────────────────────────────────────────────────

export interface MobileTokenPayload {
  sub: string          // userId
  email: string
  role: string
  hasCompletedProfile: boolean
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresAt: Date       // When the access token expires
}

// ── Configuration ─────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET!
const ACCESS_TOKEN_TTL = '15m'           // 15 minutes
const REFRESH_TOKEN_TTL_DAYS = 30

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for mobile auth.')
}

// ── Access Token (JWT) ────────────────────────────────────

/**
 * Signs a short-lived JWT access token for mobile clients.
 * Contains user identity + role for stateless auth.
 */
export function signAccessToken(payload: Omit<MobileTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
    issuer: 'latinterritory',
    audience: 'mobile',
  })
}

/**
 * Verifies and decodes a mobile access token.
 * Throws if expired, tampered, or invalid.
 */
export function verifyAccessToken(token: string): MobileTokenPayload {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'latinterritory',
    audience: 'mobile',
  }) as MobileTokenPayload
}

// ── Refresh Token (Opaque) ────────────────────────────────

/**
 * Generates a cryptographically secure random refresh token.
 * This is NOT a JWT — it's an opaque string stored hashed in DB.
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex')
}

/**
 * Hashes a refresh token with SHA-256 for safe DB storage.
 * We never store the raw token — only the hash.
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Generates a family ID for token rotation tracking.
 * All tokens in a rotation chain share the same family.
 */
export function generateTokenFamily(): string {
  return crypto.randomUUID()
}

/**
 * Returns the expiration date for a new refresh token.
 */
export function getRefreshTokenExpiry(): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_TTL_DAYS)
  return expiry
}

// ── Token Pair Generation ─────────────────────────────────

/**
 * Generates a complete access + refresh token pair.
 */
export function generateTokenPair(
  payload: Omit<MobileTokenPayload, 'iat' | 'exp'>
): TokenPair {
  const accessToken = signAccessToken(payload)
  const refreshToken = generateRefreshToken()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 min

  return { accessToken, refreshToken, expiresAt }
}
