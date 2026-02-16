'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/** Verifica que el usuario tenga rol ADMIN o MODERATOR */
async function verifyAdmin() {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')
  ) {
    throw new Error('Acceso denegado: No tienes privilegios de administrador.')
  }

  return session
}

/** Lista todas las ofertas activas, priorizando las más reportadas */
export async function getAdminJobOffers() {
  await verifyAdmin()

  try {
    const jobs = await prisma.jobOffer.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: [
        { reportCount: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return { success: true, data: jobs }
  } catch (error) {
    console.error('Error fetching admin jobs:', error)
    return {
      success: false,
      error: 'Fallo al obtener las ofertas de empleo.',
    }
  }
}

/** Soft-delete de una oferta de empleo (conserva registro para auditoría) */
export async function adminDeleteJobOffer(jobId: string) {
  const session = await verifyAdmin()

  try {
    const previous = await prisma.jobOffer.findUnique({
      where: { id: jobId },
      select: { title: true, deletedAt: true },
    })

    await prisma.jobOffer.update({
      where: { id: jobId },
      data: { deletedAt: new Date() },
    })

    await prisma.auditLog.create({
      data: {
        action: 'JOB_OFFER_DELETE',
        resource: 'JobOffer',
        resourceId: jobId,
        userId: session.user.id,
        oldValues: { deletedAt: previous?.deletedAt },
        newValues: { deletedAt: new Date().toISOString() },
      },
    })

    revalidatePath('/admin/empleos')
    return { success: true }
  } catch (error) {
    console.error('Error deleting job:', error)
    return { success: false, error: 'No se pudo eliminar la oferta.' }
  }
}

/** Reinicia el contador de reportes (falso positivo confirmado) */
export async function clearJobReports(jobId: string) {
  const session = await verifyAdmin()

  try {
    const previous = await prisma.jobOffer.findUnique({
      where: { id: jobId },
      select: { reportCount: true },
    })

    await prisma.jobOffer.update({
      where: { id: jobId },
      data: { reportCount: 0 },
    })

    await prisma.auditLog.create({
      data: {
        action: 'JOB_OFFER_REPORTS_CLEARED',
        resource: 'JobOffer',
        resourceId: jobId,
        userId: session.user.id,
        oldValues: { reportCount: previous?.reportCount },
        newValues: { reportCount: 0 },
      },
    })

    revalidatePath('/admin/empleos')
    return { success: true }
  } catch (error) {
    console.error('Error clearing reports:', error)
    return { success: false, error: 'No se pudieron limpiar los reportes.' }
  }
}
