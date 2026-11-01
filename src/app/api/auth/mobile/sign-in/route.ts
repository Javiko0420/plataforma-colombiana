/**
 * Mobile sign-in: email + password → JWT + user.
 * Same validation and password check as web Credentials provider.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateCredentials } from '@/lib/credential-auth'
import { checkRateLimit, rateLimitHeaders } from '@/lib/rate-limit'
import { SecurityLogger } from '@/lib/logger'
import { userLoginSchema } from '@/lib/validations'
import { encodeMobileToken, JWT_MAX_AGE } from '@/lib/mobile-auth'

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Cuerpo de la petición inválido' },
        { status: 400 }
      )
    }

    let validatedData: { email: string; password: string }
    try {
      validatedData = userLoginSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Datos de login inválidos',
            details: error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
          { status: 400 }
        )
      }
      throw error
    }

    const limit = await checkRateLimit('login', `${validatedData.email}:${ip}`)
    if (!limit.success) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Inténtalo más tarde.' },
        { status: 429, headers: rateLimitHeaders(limit) }
      )
    }

    const result = await authenticateCredentials(validatedData.email, validatedData.password)
    if (!result.success) {
      SecurityLogger.logAuthEvent({
        type: 'failed_login', ip, userAgent, success: false,
        reason: 'Invalid credentials or unavailable account',
      })
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }
    const user = result.user

    SecurityLogger.logAuthEvent({
      type: 'login',
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      success: true,
    })

    const hasCompletedProfile = !!(
      user.dateOfBirth &&
      user.contractAcceptedAt
    )

    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'Configuración del servidor incompleta' },
        { status: 500 }
      )
    }

    const accessToken = await encodeMobileToken(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasCompletedProfile,
        lastLogin: Date.now(),
      },
      secret
    )

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        expiresIn: JWT_MAX_AGE,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          hasCompletedProfile,
        },
      },
    })
  } catch {
    console.error('Mobile sign-in failed')
    SecurityLogger.logAuthEvent({
      type: 'failed_login',
      email: '',
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      success: false,
      reason: 'Server error',
    })
    return NextResponse.json(
      {
        success: false,
        error: 'Error al iniciar sesión. Por favor intente nuevamente.',
      },
      { status: 500 }
    )
  }
}
