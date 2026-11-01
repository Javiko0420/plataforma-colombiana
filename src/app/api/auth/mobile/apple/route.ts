import { NextRequest, NextResponse } from 'next/server'
import appleSignin, { type AppleIdTokenType } from 'apple-signin-auth'
import { prisma } from '@/lib/prisma'
import { resolveMobileOAuthAccount } from '@/lib/mobile-oauth-account'
import { z } from 'zod'
import {
  generateTokenPair,
  hashRefreshToken,
  generateTokenFamily,
  getRefreshTokenExpiry,
} from '@/lib/mobile-jwt'

interface AppleUserName {
  firstName?: string
  lastName?: string
}

interface AppleUserPayload {
  name?: AppleUserName
  email?: string
}

interface RequestBody {
  identityToken?: string
  user?: AppleUserPayload
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json()
    const { identityToken, user: appleUserPayload } = body

    if (!identityToken || typeof identityToken !== 'string') {
      return NextResponse.json(
        { error: 'MISSING_TOKEN', message: 'identityToken is required.' },
        { status: 400 }
      )
    }

    // ── Verify Apple identity token ─────────────────────
    let appleUser: AppleIdTokenType
    try {
      appleUser = await appleSignin.verifyIdToken(identityToken, {
        audience: 'com.latinterritory.mobile',
        ignoreExpiration: false,
      })
    } catch {
      return NextResponse.json(
        { error: 'INVALID_TOKEN', message: 'Apple identity token is invalid or expired.' },
        { status: 401 }
      )
    }

    if (!appleUser.sub || typeof appleUser.sub !== 'string') {
      return NextResponse.json({ error: 'INVALID_TOKEN', message: 'Invalid Apple subject.' }, { status: 401 })
    }
    const emailVerified = appleUser.email_verified === true || appleUser.email_verified === 'true'
    const signedEmail = z.email().safeParse(appleUser.email)
    const fullName = appleUserPayload?.name
      ? `${appleUserPayload.name.firstName ?? ''} ${appleUserPayload.name.lastName ?? ''}`.trim() || null
      : null
    const resolved = await resolveMobileOAuthAccount({
      provider: 'apple',
      subject: appleUser.sub,
      // Client-provided user.email is intentionally ignored for identity/linking.
      verifiedEmail: emailVerified && signedEmail.success ? signedEmail.data : undefined,
      name: fullName,
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
      const unverified = resolved.reason === 'unverified-email'
      return NextResponse.json(
        {
          error: unverified ? 'EMAIL_NOT_VERIFIED' : 'ACCOUNT_SUSPENDED',
          message: unverified ? 'A verified Apple email is required to link or create an account.' : 'Your account is unavailable.',
        },
        { status: unverified ? 401 : 403 }
      )
    }
    const dbUser = resolved.user

    // ── Generate tokens ─────────────────────────────────
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const hasCompletedProfile = !!(dbUser.dateOfBirth && dbUser.contractAcceptedAt)

    const tokenPair = generateTokenPair({
      sub: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      hasCompletedProfile,
    })

    const family = generateTokenFamily()
    await prisma.mobileRefreshToken.create({
      data: {
        tokenHash: hashRefreshToken(tokenPair.refreshToken),
        family,
        userId: dbUser.id,
        expiresAt: getRefreshTokenExpiry(),
        ip,
        userAgent,
      },
    })

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { lastLoginAt: new Date() },
    })

    return NextResponse.json({
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        image: dbUser.image,
      },
    })
  } catch {
    console.error('[mobile/apple] Authentication failed')
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
