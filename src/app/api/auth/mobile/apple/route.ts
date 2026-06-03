import { NextRequest, NextResponse } from 'next/server'
import appleSignin from 'apple-signin-auth'
import { prisma } from '@/lib/prisma'
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

    if (!identityToken) {
      return NextResponse.json(
        { error: 'MISSING_TOKEN', message: 'identityToken is required.' },
        { status: 400 }
      )
    }

    // ── Verify Apple identity token ─────────────────────
    let appleUser: { sub: string; email?: string }
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

    const appleId = appleUser.sub
    const appleEmail = appleUser.email ?? appleUserPayload?.email

    // ── Find or create user ─────────────────────────────
    let dbUser: {
      id: string
      email: string
      name: string | null
      nickname: string | null
      image: string | null
      role: string
      dateOfBirth: Date | null
      contractAcceptedAt: Date | null
    }

    const existingAccount = await prisma.account.findUnique({
      where: { provider_providerAccountId: { provider: 'apple', providerAccountId: appleId } },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
            image: true,
            role: true,
            dateOfBirth: true,
            contractAcceptedAt: true,
          },
        },
      },
    })

    if (existingAccount) {
      dbUser = existingAccount.user
    } else {
      // Try to find user by email first to avoid duplicates
      const existingUser = appleEmail
        ? await prisma.user.findUnique({
            where: { email: appleEmail },
            select: {
              id: true,
              email: true,
              name: true,
              nickname: true,
              image: true,
              role: true,
              dateOfBirth: true,
              contractAcceptedAt: true,
            },
          })
        : null

      if (existingUser) {
        dbUser = existingUser
      } else {
        if (!appleEmail) {
          return NextResponse.json(
            { error: 'MISSING_EMAIL', message: 'No email available to create account.' },
            { status: 400 }
          )
        }

        const fullName = appleUserPayload?.name
          ? `${appleUserPayload.name.firstName ?? ''} ${appleUserPayload.name.lastName ?? ''}`.trim() || null
          : null

        dbUser = await prisma.user.create({
          data: {
            email: appleEmail,
            name: fullName,
            emailVerified: new Date(),
          },
          select: {
            id: true,
            email: true,
            name: true,
            nickname: true,
            image: true,
            role: true,
            dateOfBirth: true,
            contractAcceptedAt: true,
          },
        })
      }

      // Link Apple account
      await prisma.account.create({
        data: {
          userId: dbUser.id,
          type: 'oauth',
          provider: 'apple',
          providerAccountId: appleId,
        },
      })
    }

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
  } catch (error) {
    console.error('[mobile/apple] Unexpected error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
