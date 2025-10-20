import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PasswordSecurity } from '@/lib/password-security'
import { SecurityLogger } from '@/lib/logger'
import { userRegistrationSchema } from '@/lib/validations'
import { z } from 'zod'

/**
 * User Registration Endpoint
 * POST /api/auth/register
 * 
 * Registers a new user with email and password
 * Validates input, checks for duplicates, hashes password
 * 
 * @security Rate limited, input sanitized, secure password hashing
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    
    // Get client IP for logging
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Validate input data
    let validatedData
    try {
      validatedData = userRegistrationSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Datos de registro inválidos',
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      // Log failed registration attempt
      SecurityLogger.logAuthEvent({
        type: 'failed_login',
        email: validatedData.email,
        ip,
        userAgent,
        success: false,
        reason: 'Email already exists',
      })

      return NextResponse.json(
        {
          success: false,
          error: 'Este correo electrónico ya está registrado',
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await PasswordSecurity.hashPassword(
      validatedData.password
    )

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'USER',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Log successful registration
    SecurityLogger.logAuthEvent({
      type: 'register',
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      success: true,
    })

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        resource: 'User',
        resourceId: user.id,
        userId: user.id,
        newValues: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
        ip,
        userAgent,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    // Log error
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
        error: 'Error al registrar usuario. Por favor intente nuevamente.',
      },
      { status: 500 }
    )
  }
}

