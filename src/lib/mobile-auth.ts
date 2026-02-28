/**
 * Helpers for mobile auth API: JWT encoding and session from Bearer token.
 * Reuses NextAuth JWT secret and payload shape so tokens work with getToken().
 */

import { getToken, encode, decode } from 'next-auth/jwt'
import type { JWT } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@prisma/client'

const JWT_MAX_AGE = 24 * 60 * 60 // 24 hours, same as authOptions.jwt.maxAge

/**
 * Reads the NextAuth JWT from the request (cookie or Authorization: Bearer).
 * Use in API routes to support both web (cookie) and mobile (Bearer).
 */
export async function getMobileToken(
  req: NextRequest,
  secret: string = process.env.NEXTAUTH_SECRET!
): Promise<JWT | null> {
  return getToken({ req, secret })
}

/**
 * Encodes a JWT with the same format and secret as NextAuth for mobile clients.
 * Payload must match what the jwt() callback produces (sub, email, name, role, hasCompletedProfile, lastLogin).
 */
export async function encodeMobileToken(
  payload: {
    sub: string
    email: string
    name?: string | null
    role: UserRole
    hasCompletedProfile: boolean
    lastLogin?: number
  },
  secret: string = process.env.NEXTAUTH_SECRET!
): Promise<string> {
  return encode({
    token: {
      sub: payload.sub,
      email: payload.email,
      name: payload.name ?? null,
      role: payload.role,
      hasCompletedProfile: payload.hasCompletedProfile,
      lastLogin: payload.lastLogin ?? Date.now(),
    },
    secret,
    maxAge: JWT_MAX_AGE,
  })
}

/**
 * Decodes a raw JWT string (e.g. from Authorization header). Used when we already have the token string.
 */
export async function decodeMobileToken(
  token: string,
  secret: string = process.env.NEXTAUTH_SECRET!
): Promise<JWT | null> {
  return decode({ token, secret })
}

export { JWT_MAX_AGE }
