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
