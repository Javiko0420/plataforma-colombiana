import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateTokenPair,
  hashRefreshToken,
  getRefreshTokenExpiry,
} from '@/lib/mobile-jwt'

/**
 * POST /api/auth/mobile/refresh
 *
 * Rotates a refresh token: invalidates the old one and issues a new pair.
 *
 * Security: If a revoked token is presented (replay attack), the entire
 * token family is invalidated, forcing re-login on ALL devices that
 * share that family chain.
 *
 * Request body:
 *   { refreshToken: string }
 *
 * Response 200:
 *   { accessToken, refreshToken }
 *
 * Response 401: Invalid, expired, or revoked token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { refreshToken } = body

    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json(
        { error: 'MISSING_TOKEN', message: 'Refresh token is required.' },
        { status: 400 }
      )
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // ── Find Token by Hash ──────────────────────────────
    const tokenHash = hashRefreshToken(refreshToken)

    const storedToken = await prisma.mobileRefreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
            image: true,
            role: true,
            isActive: true,
            isBanned: true,
            dateOfBirth: true,
            contractAcceptedAt: true,
          },
        },
      },
    })

    // ── Token Not Found ─────────────────────────────────
    if (!storedToken) {
      return NextResponse.json(
        { error: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token.' },
        { status: 401 }
      )
    }

    // ── Replay Attack Detection ─────────────────────────
    // If token was already revoked, someone is reusing a stolen token.
    // Invalidate the ENTIRE family to protect the user.
    if (storedToken.isRevoked) {
      await prisma.mobileRefreshToken.updateMany({
        where: { family: storedToken.family },
        data: { isRevoked: true },
      })

      console.warn(
        `[mobile/refresh] REPLAY ATTACK DETECTED — family ${storedToken.family}, ` +
        `user ${storedToken.userId}, ip ${ip}`
      )

      return NextResponse.json(
        { error: 'TOKEN_REUSE_DETECTED', message: 'Security violation detected. Please log in again.' },
        { status: 401 }
      )
    }

    // ── Token Expired ───────────────────────────────────
    if (storedToken.expiresAt < new Date()) {
      // Revoke the expired token
      await prisma.mobileRefreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      })

      return NextResponse.json(
        { error: 'TOKEN_EXPIRED', message: 'Refresh token has expired. Please log in again.' },
        { status: 401 }
      )
    }

    // ── Check User Status ───────────────────────────────
    if (storedToken.user.isBanned || !storedToken.user.isActive) {
      // Revoke all tokens for this user
      await prisma.mobileRefreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true },
      })

      return NextResponse.json(
        { error: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended.' },
        { status: 403 }
      )
    }

    // ── Rotate: Revoke Old, Issue New ───────────────────
    const user = storedToken.user
    const hasCompletedProfile = !!(user.dateOfBirth && user.contractAcceptedAt)

    const newTokenPair = generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      hasCompletedProfile,
    })

    // Transaction: revoke old + create new atomically
    await prisma.$transaction([
      // Mark old token as revoked
      prisma.mobileRefreshToken.update({
        where: { id: storedToken.id },
        data: {
          isRevoked: true,
          lastUsedAt: new Date(),
        },
      }),
      // Create new token in the same family
      prisma.mobileRefreshToken.create({
        data: {
          tokenHash: hashRefreshToken(newTokenPair.refreshToken),
          family: storedToken.family,   // Same family for rotation tracking
          userId: user.id,
          expiresAt: getRefreshTokenExpiry(),
          ip,
          userAgent,
        },
      }),
    ])

    // ── Return New Pair ─────────────────────────────────
    return NextResponse.json({
      accessToken: newTokenPair.accessToken,
      refreshToken: newTokenPair.refreshToken,
    })
  } catch (error) {
    console.error('[mobile/refresh] Unexpected error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
