import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
import { resolveMobileOAuthAccount } from '@/lib/mobile-oauth-account'
import { z } from 'zod'
import { SecurityLogger } from '@/lib/logger'
import {
  generateTokenPair,
  hashRefreshToken,
  generateTokenFamily,
  getRefreshTokenExpiry,
} from '@/lib/mobile-jwt'

/**
 * POST /api/auth/mobile/google
 *
 * Verifies a Google ID token from the Flutter app, then:
 * - If user exists → logs them in
 * - If user is new → creates account + links Google provider
 *
 * Request body:
 *   { idToken: string }
 *
 * Response 200:
 *   { accessToken, refreshToken, user: {...}, isNewUser: boolean }
 *
 * Response 401: Invalid Google token
 */

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { idToken } = body

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'MISSING_TOKEN', message: 'Google ID token is required.' },
        { status: 400 }
      )
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // ── Verify Google ID Token ──────────────────────────
    let googlePayload
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      googlePayload = ticket.getPayload()
    } catch {
      console.error('[mobile/google] Token verification failed')
      return NextResponse.json(
        { error: 'INVALID_GOOGLE_TOKEN', message: 'Google authentication failed.' },
        { status: 401 }
      )
    }

    if (!googlePayload || !googlePayload.sub || !z.email().safeParse(googlePayload.email).success) {
      return NextResponse.json(
        { error: 'INVALID_GOOGLE_TOKEN', message: 'Could not extract email from Google token.' },
        { status: 401 }
      )
    }

    // Only allow verified Google emails
    if (!googlePayload.email_verified) {
      return NextResponse.json(
        { error: 'EMAIL_NOT_VERIFIED', message: 'Google email is not verified.' },
        { status: 401 }
      )
    }

    const resolved = await resolveMobileOAuthAccount({
      provider: 'google',
      subject: googlePayload.sub,
      verifiedEmail: googlePayload.email!,
      name: googlePayload.name,
      image: googlePayload.picture,
    })
    if (!resolved.success) {
      if (resolved.reason === 'link-required') {
        return NextResponse.json(
          {
            error: 'ACCOUNT_LINK_REQUIRED',
            message: 'An account with this email already exists. Sign in with your password.',
          },
          { status: 409 }
        )
      }
      return NextResponse.json(
        {
          error: resolved.reason === 'banned' ? 'ACCOUNT_BANNED' : 'ACCOUNT_INACTIVE',
          message: 'Your account is unavailable.',
        },
        { status: 403 }
      )
    }
    const { user, isNewUser } = resolved

    // ── Generate Tokens ─────────────────────────────────
    const hasCompletedProfile = !!(user.dateOfBirth && user.contractAcceptedAt)

    const tokenPair = generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      hasCompletedProfile,
    })

    // Store refresh token
    const family = generateTokenFamily()
    await prisma.mobileRefreshToken.create({
      data: {
        tokenHash: hashRefreshToken(tokenPair.refreshToken),
        family,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
        ip,
        userAgent,
      },
    })

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Log
    SecurityLogger.logAuthEvent({
      type: 'login',
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      success: true,
    })

    // ── Return Response ─────────────────────────────────
    return NextResponse.json({
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        image: user.image,
        role: user.role,
        hasCompletedProfile,
      },
      isNewUser,
    })
  } catch {
    console.error('[mobile/google] Authentication failed')
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
