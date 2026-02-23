'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const EVENT_POSTING_TERMS_VERSION = '2026-02-17'

export async function acceptEventPostingTerms() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return { error: 'Acceso denegado: Debes iniciar sesión.' }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        eventPostingTermsAcceptedAt: new Date(),
        eventPostingTermsVersion: EVENT_POSTING_TERMS_VERSION,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error al registrar aceptación de términos de eventos:', error)
    return { error: 'Error al registrar la aceptación. Intenta de nuevo.' }
  }
}

export async function hasAcceptedEventPostingTerms(): Promise<boolean> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) return false

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        eventPostingTermsAcceptedAt: true,
        eventPostingTermsVersion: true,
      },
    })

    return (
      !!user?.eventPostingTermsAcceptedAt &&
      user?.eventPostingTermsVersion === EVENT_POSTING_TERMS_VERSION
    )
  } catch {
    return false
  }
}
