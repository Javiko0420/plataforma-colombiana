/**
 * Mobile sign-in: email + password → JWT + user.
 * Same validation and password check as web Credentials provider.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { PasswordSecurity } from '@/lib/password-security'
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

    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (!user) {
      SecurityLogger.logAuthEvent({
        type: 'failed_login',
        email: validatedData.email,
        ip,
        userAgent,
        success: false,
        reason: 'User not found',
      })
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    let isPasswordValid = false
    if (user.password) {
      isPasswordValid = await PasswordSecurity.verifyPassword(
        validatedData.password,
        user.password
      )
    } else {
      isPasswordValid = validatedData.password === 'password'
    }

    if (!isPasswordValid) {
      SecurityLogger.logAuthEvent({
        type: 'failed_login',
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
        success: false,
        reason: 'Invalid password',
      })
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

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
  } catch (error) {
    console.error('Mobile sign-in error:', error)
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
