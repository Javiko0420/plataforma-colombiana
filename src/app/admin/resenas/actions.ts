'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Acción para APROBAR una reseña (se vuelve visible)
export async function approveReview(reviewId: string) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    throw new Error('Unauthorized')
  }

  try {
    // 1. Actualizar estado de la reseña
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'VISIBLE',
        // Opcional: Podríamos resetear reportCount si decidimos que es un falso positivo
        // reportCount: 0
      },
    })

    // 2. Crear Log de Moderación (Vital para auditoría)
    await prisma.moderationLog.create({
      data: {
        action: 'RESTORE',
        reason: 'Manual approval by moderator',
        reviewId: reviewId,
        moderatorId: session.user.id,
      },
    })

    // 3. Actualizar la UI inmediatamente
    revalidatePath('/admin/resenas')
    return { success: true }
  } catch (error) {
    console.error('Error approving review:', error)
    return { success: false, error: 'Failed to approve review' }
  }
}

// Acción para OCULTAR/RECHAZAR una reseña
export async function hideReview(reviewId: string, reason: string) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    throw new Error('Unauthorized')
  }

  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { status: 'HIDDEN' },
    })

    await prisma.moderationLog.create({
      data: {
        action: 'HIDE',
        reason: reason, // Ej: "Lenguaje ofensivo", "Spam"
        reviewId: reviewId,
        moderatorId: session.user.id,
      },
    })

    revalidatePath('/admin/resenas')
    return { success: true }
  } catch (error) {
    console.error('Error hiding review:', error)
    return { success: false, error: 'Failed to hide review' }
  }
}
