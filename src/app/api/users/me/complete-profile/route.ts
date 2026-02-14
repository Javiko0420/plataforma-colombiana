/**
 * POST /api/users/me/complete-profile
 *
 * Endpoint for Google OAuth users to complete their profile
 * with date of birth and legal contract acceptance.
 * Records full audit trail (IP, User-Agent) for legal compliance.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { calculateAge, MIN_AGE, MAX_AGE } from '@/lib/legal'

const completeProfileSchema = z.object({
  dateOfBirth: z.string().refine((dateString) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return false
    if (date > new Date()) return false
    const age = calculateAge(date)
    return age >= MIN_AGE && age <= MAX_AGE
  }, {
    message: `Debes tener al menos ${MIN_AGE} años para usar esta plataforma (legislación australiana).`,
  }),
  contractAcceptedAt: z.string().datetime(),
  contractVersion: z.string().min(1),
  termsVersion: z.string().min(1),
  privacyVersion: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Autenticación requerida' },
        { status: 401 }
      )
    }

    // Prevent double-completion
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { dateOfBirth: true, contractAcceptedAt: true }
    })

    if (existingUser?.dateOfBirth && existingUser?.contractAcceptedAt) {
      return NextResponse.json(
        { error: 'El perfil ya está completo' },
        { status: 400 }
      )
    }

    const body = await req.json()

    let validatedData
    try {
      validatedData = completeProfileSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.issues[0].message },
          { status: 400 }
        )
      }
      throw error
    }

    // Capture IP and User-Agent for legal audit trail
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Update user with DOB and legal acceptance in a single transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          dateOfBirth: new Date(validatedData.dateOfBirth),
          contractAcceptedAt: new Date(validatedData.contractAcceptedAt),
          contractVersion: validatedData.contractVersion,
          termsVersion: validatedData.termsVersion,
          privacyVersion: validatedData.privacyVersion,
          acceptanceIp: ip,
          acceptanceUa: userAgent,
        },
      })

      // Audit log for legal compliance (same format as register endpoint)
      await tx.auditLog.create({
        data: {
          action: 'COMPLETE_PROFILE',
          resource: 'User',
          resourceId: session.user.id,
          userId: session.user.id,
          newValues: {
            dateOfBirth: validatedData.dateOfBirth,
            legalAcceptance: {
              contractAcceptedAt: validatedData.contractAcceptedAt,
              contractVersion: validatedData.contractVersion,
              termsVersion: validatedData.termsVersion,
              privacyVersion: validatedData.privacyVersion,
            },
          },
          ip,
          userAgent,
        },
      })
    })

    logger.info('User profile completed (Google OAuth onboarding)', {
      userId: session.user.id,
      email: session.user.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Perfil completado exitosamente',
    })
  } catch (error) {
    logger.error('Error completing profile', { error })
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
