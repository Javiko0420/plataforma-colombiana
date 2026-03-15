import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyAccessToken } from '@/lib/mobile-jwt'

export interface AuthUser {
  id: string
  role?: string
}

/**
 * Resolves the authenticated user from either:
 * 1. NextAuth session (web — cookie-based)
 * 2. Mobile JWT (Authorization: Bearer header)
 *
 * Returns user id and role when available.
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  // 1. Try NextAuth session first (web clients).
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return { id: session.user.id, role: session.user.role }
  }

  // 2. Fall back to mobile JWT from Authorization header.
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7)
      const payload = verifyAccessToken(token)
      return { id: payload.sub, role: payload.role }
    } catch {
      // Invalid or expired token — fall through to return null.
    }
  }

  return null
}

/**
 * Resolves the authenticated user ID from either:
 * 1. NextAuth session (web — cookie-based)
 * 2. Mobile JWT (Authorization: Bearer header)
 *
 * Usage in any API route:
 *
 * ```ts
 * const userId = await getAuthUserId(request)
 * if (!userId) {
 *   return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
 * }
 * ```
 *
 * This allows endpoints to serve both web and mobile clients
 * without duplicating routes.
 */
export async function getAuthUserId(
  request: NextRequest
): Promise<string | null> {
  const user = await getAuthUser(request)
  return user?.id ?? null
}
