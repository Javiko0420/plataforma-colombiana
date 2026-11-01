'use server'

import { getAuthorizedAdminSession } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@prisma/client'

// Cambiar el Rol de un usuario (Ascensos/Descensos)
export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await getAuthorizedAdminSession()

  // Solo ADMIN puede cambiar roles
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error(
      'Unauthorized: Solo los administradores pueden gestionar roles.',
    )
  }

  if (!Object.values(UserRole).includes(newRole)) {
    return { success: false, error: 'Rol inválido.' }
  }

  // Protección: No puedes cambiar tu propio rol
  if (userId === session.user.id) {
    return {
      success: false,
      error: 'No puedes cambiar tu propio rol por seguridad.',
    }
  }

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { role: newRole } }),
      prisma.auditLog.create({
        data: {
          action: 'USER_ROLE_CHANGE', resource: 'User', resourceId: userId,
          userId: session.user.id, newValues: { role: newRole },
        },
      }),
    ])

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error) {
    console.error('Error updating role:', error)
    return { success: false, error: 'Error al actualizar el rol.' }
  }
}

// Banear / Desbanear Usuario
export async function toggleUserBan(userId: string, currentStatus: boolean) {
  const session = await getAuthorizedAdminSession()

  // Solo ADMIN puede banear (ban global es delicado)
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  if (userId === session.user.id) {
    return { success: false, error: 'No puedes banearte a ti mismo.' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUnique({
        where: { id: userId }, select: { isBanned: true },
      })
      if (!current || current.isBanned !== currentStatus) {
        throw new Error('Account state changed; reload before retrying')
      }
      const newStatus = !current.isBanned
      const changed = await tx.user.updateMany({
        where: { id: userId, isBanned: current.isBanned }, data: { isBanned: newStatus },
      })
      if (!changed.count) throw new Error('Account state changed; reload before retrying')
      if (newStatus) {
        await tx.mobileRefreshToken.updateMany({
          where: { userId, isRevoked: false }, data: { isRevoked: true },
        })
      }
      await tx.auditLog.create({
        data: {
          action: newStatus ? 'USER_BAN' : 'USER_UNBAN',
          resource: 'User', resourceId: userId, userId: session.user.id,
          oldValues: { isBanned: current.isBanned }, newValues: { isBanned: newStatus },
        },
      })
    })

    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error) {
    console.error('Error toggling ban:', error)
    return { success: false, error: 'Error al cambiar estado de bloqueo.' }
  }
}
