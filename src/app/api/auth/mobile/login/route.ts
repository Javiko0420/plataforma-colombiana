import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateCredentials } from '@/lib/credential-auth'
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

    const result = await authenticateCredentials(validatedData.email, validatedData.password)
    if (!result.success) {
      SecurityLogger.logAuthEvent({
        type: 'failed_login', ip, userAgent, success: false,
        reason: 'Invalid credentials or unavailable account',
      })
      if (result.reason === 'banned' || result.reason === 'inactive') {
        return NextResponse.json(
          {
            error: result.reason === 'banned' ? 'ACCOUNT_BANNED' : 'ACCOUNT_INACTIVE',
            message: 'Your account is unavailable.',
          },
          { status: 403 }
        )
      }
      if (result.reason === 'locked') {
        return NextResponse.json(
          { error: 'ACCOUNT_LOCKED', message: 'Too many failed attempts. Please try again later.' },
          { status: 429, headers: { 'Retry-After': String(result.retryAfter) } }
        )
      }
      return NextResponse.json(
        {
          error: result.reason === 'no-password' ? 'NO_PASSWORD' : 'INVALID_CREDENTIALS',
          message: result.reason === 'no-password'
            ? 'Use the sign-in provider associated with this account.'
            : 'Email or password is incorrect.',
        },
        { status: 401 }
      )
    }
    const user = result.user

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
