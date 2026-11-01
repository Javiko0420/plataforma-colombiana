import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken, MobileTokenPayload } from '@/lib/mobile-jwt'
import { getCurrentAccount, hasCompletedProfile } from '@/lib/account-policy'

/**
 * Verifies the mobile JWT from the Authorization header.
 *
 * Usage in any protected API route:
 *
 * ```ts
 * import { withMobileAuth } from '@/lib/mobile-auth-middleware'
 *
 * export async function GET(req: NextRequest) {
 *   const auth = await withMobileAuth(req)
 *   if (auth instanceof NextResponse) return auth  // 401 error
 *
 *   // auth is now MobileTokenPayload
 *   const userId = auth.sub
 *   // ... your logic
 * }
 * ```
 */
export async function withMobileAuth(
  req: NextRequest
): Promise<MobileTokenPayload | NextResponse> {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Missing or invalid authorization header.' },
      { status: 401 }
    )
  }

  const token = authHeader.slice(7) // Remove "Bearer "

  try {
    const payload = verifyAccessToken(token)
    const user = await getCurrentAccount(payload.sub)
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Account unavailable.' }, { status: 401 })
    }
    return {
      ...payload,
      sub: user.id,
      email: user.email,
      role: user.role,
      hasCompletedProfile: hasCompletedProfile(user),
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.name === 'TokenExpiredError'
        ? 'Access token has expired.'
        : 'Invalid access token.'

    return NextResponse.json(
      { error: 'UNAUTHORIZED', message },
      { status: 401 }
    )
  }
}
