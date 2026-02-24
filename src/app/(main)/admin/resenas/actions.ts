'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Acción para APROBAR una reseña (se vuelve visible, reportes descartados)
export async function approveReview(reviewId: string) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    throw new Error('Unauthorized')
  }

  try {
    // 1. Aprobar reseña: restaurar visibilidad y resetear contador de reportes
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'VISIBLE',
        reportCount: 0,
      },
    })

    // 2. Descartar todos los reportes pendientes de esta reseña
    await prisma.report.updateMany({
      where: { reviewId, status: 'PENDING' },
      data: {
        status: 'DISMISSED',
        reviewedBy: session.user.id,
        reviewNote: 'Reseña aprobada por moderador: falso positivo',
      },
    })

    // 3. Crear Log de Moderación
    await prisma.moderationLog.create({
      data: {
        action: 'RESTORE',
        reason: 'Manual approval by moderator',
        reviewId: reviewId,
        moderatorId: session.user.id,
      },
    })

    // 4. Actualizar la UI inmediatamente
    revalidatePath('/admin/resenas')
    return { success: true }
  } catch (error) {
    console.error('Error approving review:', error)
    return { success: false, error: 'Failed to approve review' }
  }
}

// Acción para OCULTAR/RECHAZAR una reseña (reportes resueltos)
export async function hideReview(reviewId: string, reason: string) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    throw new Error('Unauthorized')
  }

  try {
    // 1. Ocultar reseña y resetear contador
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'HIDDEN',
        reportCount: 0,
      },
    })

    // 2. Resolver todos los reportes pendientes de esta reseña
    await prisma.report.updateMany({
      where: { reviewId, status: 'PENDING' },
      data: {
        status: 'RESOLVED',
        reviewedBy: session.user.id,
        reviewNote: reason,
      },
    })

    // 3. Crear Log de Moderación
    await prisma.moderationLog.create({
      data: {
        action: 'HIDE',
        reason: reason,
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
