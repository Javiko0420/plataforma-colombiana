'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Verificar un negocio (Check Azul)
export async function verifyBusiness(businessId: string) {
  const session = await getServerSession(authOptions)

  // Solo Admins pueden verificar (Moderadores quizás solo revisan)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Only Admins can verify businesses')
  }

  try {
    await prisma.business.update({
      where: { id: businessId },
      data: { isVerified: true },
    })

    // Log de auditoría (Importante para saber quién verificó a quién)
    await prisma.auditLog.create({
      data: {
        action: 'BUSINESS_VERIFY',
        resource: 'Business',
        resourceId: businessId,
        userId: session.user.id,
        newValues: { isVerified: true },
      },
    })

    revalidatePath('/admin/negocios')
    return { success: true }
  } catch (error) {
    console.error('Error verifying business:', error)
    return { success: false, error: 'Failed to verify business' }
  }
}

// Descartar reportes de un negocio (falso positivo)
export async function dismissBusinessReport(
  businessId: string,
  reportIds: string[],
) {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')
  ) {
    throw new Error('Unauthorized')
  }

  try {
    // Marcar reportes como revisados/descartados
    await prisma.report.updateMany({
      where: { id: { in: reportIds } },
      data: {
        status: 'DISMISSED',
        reviewedBy: session.user.id,
        reviewNote: 'Descartado por moderador: contenido verificado',
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'BUSINESS_REPORTS_DISMISSED',
        resource: 'Business',
        resourceId: businessId,
        userId: session.user.id,
        newValues: { dismissedReports: reportIds.length },
      },
    })

    revalidatePath('/admin/negocios')
    return { success: true }
  } catch (error) {
    console.error('Error dismissing business reports:', error)
    return { success: false, error: 'Failed to dismiss reports' }
  }
}

// Desactivar un negocio reportado y resolver los reportes
export async function deactivateReportedBusiness(businessId: string) {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')
  ) {
    throw new Error('Unauthorized')
  }

  try {
    // Desactivar el negocio y resolver todos sus reportes pendientes
    await prisma.$transaction([
      prisma.business.update({
        where: { id: businessId },
        data: { isActive: false },
      }),
      prisma.report.updateMany({
        where: { businessId, status: 'PENDING' },
        data: {
          status: 'RESOLVED',
          reviewedBy: session.user.id,
          reviewNote: 'Negocio desactivado por reportes de la comunidad',
        },
      }),
    ])

    await prisma.auditLog.create({
      data: {
        action: 'BUSINESS_DEACTIVATE',
        resource: 'Business',
        resourceId: businessId,
        userId: session.user.id,
        newValues: { isActive: false, reason: 'community_reports' },
      },
    })

    revalidatePath('/admin/negocios')
    return { success: true }
  } catch (error) {
    console.error('Error deactivating reported business:', error)
    return { success: false, error: 'Failed to deactivate business' }
  }
}

// Desactivar/Activar un negocio (Soft Ban)
export async function toggleBusinessStatus(
  businessId: string,
  currentStatus: boolean,
) {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')
  ) {
    throw new Error('Unauthorized')
  }

  try {
    const newStatus = !currentStatus
    await prisma.business.update({
      where: { id: businessId },
      data: { isActive: newStatus },
    })

    await prisma.auditLog.create({
      data: {
        action: newStatus ? 'BUSINESS_ACTIVATE' : 'BUSINESS_DEACTIVATE',
        resource: 'Business',
        resourceId: businessId,
        userId: session.user.id,
        oldValues: { isActive: currentStatus },
        newValues: { isActive: newStatus },
      },
    })

    revalidatePath('/admin/negocios')
    return { success: true, newStatus }
  } catch (error) {
    console.error('Error toggling business status:', error)
    return { success: false, error: 'Failed to update business status' }
  }
}
