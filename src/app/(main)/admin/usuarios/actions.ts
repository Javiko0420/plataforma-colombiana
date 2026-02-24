'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@prisma/client'

// Cambiar el Rol de un usuario (Ascensos/Descensos)
export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await getServerSession(authOptions)

  // Solo ADMIN puede cambiar roles
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error(
      'Unauthorized: Solo los administradores pueden gestionar roles.',
    )
  }

  // Protección: No puedes cambiar tu propio rol
  if (userId === session.user.id) {
    return {
      success: false,
      error: 'No puedes cambiar tu propio rol por seguridad.',
    }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    })

    // Log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'USER_ROLE_CHANGE',
        resource: 'User',
        resourceId: userId,
        userId: session.user.id,
        newValues: { role: newRole },
      },
    })

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error) {
    console.error('Error updating role:', error)
    return { success: false, error: 'Error al actualizar el rol.' }
  }
}

// Banear / Desbanear Usuario
export async function toggleUserBan(userId: string, currentStatus: boolean) {
  const session = await getServerSession(authOptions)

  // Solo ADMIN puede banear (ban global es delicado)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  if (userId === session.user.id) {
    return { success: false, error: 'No puedes banearte a ti mismo.' }
  }

  try {
    const newStatus = !currentStatus
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: newStatus },
    })

    await prisma.auditLog.create({
      data: {
        action: newStatus ? 'USER_BAN' : 'USER_UNBAN',
        resource: 'User',
        resourceId: userId,
        userId: session.user.id,
        oldValues: { isBanned: currentStatus },
        newValues: { isBanned: newStatus },
      },
    })

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error) {
    console.error('Error toggling ban:', error)
    return { success: false, error: 'Error al cambiar estado de bloqueo.' }
  }
}
