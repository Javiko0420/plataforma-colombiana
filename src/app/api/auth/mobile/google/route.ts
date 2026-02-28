import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
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
    } catch (error) {
      console.error('[mobile/google] Token verification failed:', error)
      return NextResponse.json(
        { error: 'INVALID_GOOGLE_TOKEN', message: 'Google authentication failed.' },
        { status: 401 }
      )
    }

    if (!googlePayload || !googlePayload.email) {
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

    const googleEmail = googlePayload.email
    const googleName = googlePayload.name || null
    const googleImage = googlePayload.picture || null
    const googleSub = googlePayload.sub // Google's unique user ID

    // ── Find or Create User ─────────────────────────────
    let user
    let isNewUser = false

    // First, check if there's already a Google account linked
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleSub,
        },
      },
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

    if (existingAccount) {
      // User already has Google linked
      user = existingAccount.user
    } else {
      // Check if a user with this email exists (registered via credentials)
      const existingUser = await prisma.user.findUnique({
        where: { email: googleEmail },
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
      })

      if (existingUser) {
        // Link Google to existing account
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleSub,
            access_token: idToken,
          },
        })
        user = existingUser
      } else {
        // Create new user + link Google account
        const newUser = await prisma.user.create({
          data: {
            email: googleEmail,
            name: googleName,
            image: googleImage,
            emailVerified: new Date(), // Google already verified
            accounts: {
              create: {
                type: 'oauth',
                provider: 'google',
                providerAccountId: googleSub,
                access_token: idToken,
              },
            },
          },
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
        })
        user = newUser
        isNewUser = true
      }
    }

    // ── Check Account Status ────────────────────────────
    if (user.isBanned) {
      return NextResponse.json(
        { error: 'ACCOUNT_BANNED', message: 'Your account has been suspended.' },
        { status: 403 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'ACCOUNT_INACTIVE', message: 'Your account is inactive.' },
        { status: 403 }
      )
    }

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
  } catch (error) {
    console.error('[mobile/google] Unexpected error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
