'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Tipo de contenido a moderar
type ForumContentType = 'post' | 'comment'
type ModerationDecision = 'approve' | 'delete'

export async function moderateForumContent(
  contentId: string,
  type: ForumContentType,
  decision: ModerationDecision,
) {
  const session = await getServerSession(authOptions)

  // Solo Admins y Moderadores
  if (
    !session ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')
  ) {
    throw new Error('Unauthorized')
  }

  try {
    const isDelete = decision === 'delete'

    const resourceName = type === 'post' ? 'ForumPost' : 'ForumComment'

    // Si aprobamos: isFlagged = false, reportsCount = 0 (limpiamos historial)
    // Si borramos: isDeleted = true, isFlagged = false (ya no necesita revisión)
    const updateData = {
      isFlagged: false,
      isDeleted: isDelete,
      reportsCount: isDelete ? undefined : 0,
    }

    if (type === 'post') {
      await prisma.forumPost.update({ where: { id: contentId }, data: updateData })
    } else {
      await prisma.forumComment.update({ where: { id: contentId }, data: updateData })
    }

    // Registro de Auditoría
    await prisma.auditLog.create({
      data: {
        action: isDelete ? 'FORUM_CONTENT_DELETE' : 'FORUM_CONTENT_APPROVE',
        resource: resourceName,
        resourceId: contentId,
        userId: session.user.id,
        newValues: { decision, type },
      },
    })

    revalidatePath('/admin/foros')
    return { success: true }
  } catch (error) {
    console.error('Error moderating forum content:', error)
    return { success: false, error: 'Failed to process moderation request' }
  }
}

/**
 * Actualizar nombre y descripción de un foro activo.
 * Solo ADMIN puede modificar la configuración de foros.
 */
export async function updateForumDetails(
  forumId: string,
  name: string,
  description: string,
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  // Validación de inputs
  const trimmedName = name.trim()
  const trimmedDescription = description.trim()

  if (trimmedName.length < 3 || trimmedName.length > 100) {
    return { success: false, error: 'El nombre debe tener entre 3 y 100 caracteres.' }
  }

  if (trimmedDescription.length < 3 || trimmedDescription.length > 300) {
    return { success: false, error: 'La descripción debe tener entre 3 y 300 caracteres.' }
  }

  try {
    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
      select: { id: true, name: true, description: true, isActive: true },
    })

    if (!forum) {
      return { success: false, error: 'Foro no encontrado.' }
    }

    if (!forum.isActive) {
      return { success: false, error: 'Solo se pueden editar foros activos.' }
    }

    const oldValues = { name: forum.name, description: forum.description }

    await prisma.forum.update({
      where: { id: forumId },
      data: { name: trimmedName, description: trimmedDescription },
    })

    // Registro de Auditoría
    await prisma.auditLog.create({
      data: {
        action: 'FORUM_DETAILS_UPDATE',
        resource: 'Forum',
        resourceId: forumId,
        userId: session.user.id,
        oldValues,
        newValues: { name: trimmedName, description: trimmedDescription },
      },
    })

    revalidatePath('/admin/foros')
    revalidatePath('/foros')
    return { success: true }
  } catch (error) {
    console.error('Error updating forum details:', error)
    return { success: false, error: 'Error al actualizar el foro.' }
  }
}
