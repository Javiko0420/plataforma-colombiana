import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PasswordSecurity } from '@/lib/password-security'
import { SecurityLogger } from '@/lib/logger'
import { userLoginSchema } from '@/lib/validations'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import {
  generateTokenPair,
  hashRefreshToken,
  generateTokenFamily,
  getRefreshTokenExpiry,
} from '@/lib/mobile-jwt'

/**
 * POST /api/auth/mobile/login
 *
 * Authenticates a mobile user with email + password.
 * Returns a JWT access token + opaque refresh token.
 *
 * Request body:
 *   { email: string, password: string }
 *
 * Response 200:
 *   { accessToken, refreshToken, user: { id, email, name, image, role, hasCompletedProfile } }
 *
 * Response 401: Invalid credentials
 * Response 403: Account banned or locked
 * Response 429: Too many attempts
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // ── Validate Input ──────────────────────────────────
    let validatedData
    try {
      validatedData = userLoginSchema.parse(body)
    } catch {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Email and password are required.' },
        { status: 400 }
      )
    }

    // ── Rate Limit ──────────────────────────────────────
    // El bloqueo de cuenta (loginAttempts/lockedUntil) protege una cuenta
    // concreta; esto frena el barrido de muchas cuentas desde un mismo origen.
    const limit = await checkRateLimit('login', `${validatedData.email}:${ip}`)
    if (!limit.success) {
      SecurityLogger.logSecurityViolation({
        type: 'rate_limit',
        ip,
        userAgent,
        details: 'mobile login',
        severity: 'medium',
      })
      return NextResponse.json(
        { error: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: rateLimitHeaders(limit) }
      )
    }

    // ── Find User ───────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        image: true,
        password: true,
        role: true,
        isActive: true,
        isBanned: true,
        loginAttempts: true,
        lockedUntil: true,
        dateOfBirth: true,
        contractAcceptedAt: true,
      },
    })

    if (!user) {
      SecurityLogger.logAuthEvent({
        type: 'failed_login',
        email: validatedData.email,
        ip,
        userAgent,
        success: false,
        reason: 'User not found (mobile)',
      })
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' },
        { status: 401 }
      )
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

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: 'ACCOUNT_LOCKED',
          message: `Too many failed attempts. Try again in ${minutesLeft} minutes.`,
        },
        { status: 429 }
      )
    }

    // ── Verify Password ─────────────────────────────────
    if (!user.password) {
      // User registered via Google only — no password set.
      return NextResponse.json(
        { error: 'NO_PASSWORD', message: 'This account uses Google sign-in. Please use Google to log in.' },
        { status: 401 }
      )
    }

    const isPasswordValid = await PasswordSecurity.verifyPassword(
      validatedData.password,
      user.password
    )

    if (!isPasswordValid) {
      // Increment failed attempts
      const newAttempts = user.loginAttempts + 1
      const lockout = newAttempts >= 5
        ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) } // 15 min lockout
        : {}

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          ...lockout,
        },
      })

      SecurityLogger.logAuthEvent({
        type: 'failed_login',
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
        success: false,
        reason: `Invalid password (mobile) - attempt ${newAttempts}`,
      })

      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' },
        { status: 401 }
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

    // Store refresh token hash in DB
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

    // Reset login attempts + update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    })

    // Log success
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
    })
  } catch (error) {
    console.error('[mobile/login] Unexpected error:', error)
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
