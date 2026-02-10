import { prisma } from '@/lib/prisma'
import { ForumModerationView } from '@/components/admin/forum-moderation-view'

export const dynamic = 'force-dynamic'

export default async function ForumModerationPage() {
  // 1. Obtener Publicaciones Reportadas
  const flaggedPosts = await prisma.forumPost.findMany({
    where: {
      isDeleted: false,
      OR: [{ isFlagged: true }, { reportsCount: { gt: 0 } }],
    },
    include: {
      author: { select: { name: true, email: true, image: true } },
      forum: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 2. Obtener Comentarios Reportados
  const flaggedComments = await prisma.forumComment.findMany({
    where: {
      isDeleted: false,
      OR: [{ isFlagged: true }, { reportsCount: { gt: 0 } }],
    },
    include: {
      author: { select: { name: true, email: true, image: true } },
      post: { select: { content: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // 3. Mapear datos para la vista unificada
  const formattedPosts = flaggedPosts.map((p) => ({
    id: p.id,
    content: p.content,
    createdAt: p.createdAt,
    author: p.author,
    reportsCount: p.reportsCount,
    isFlagged: p.isFlagged,
    forumName: p.forum.name,
  }))

  const formattedComments = flaggedComments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    author: c.author,
    reportsCount: c.reportsCount,
    isFlagged: c.isFlagged,
    postTitle: c.post.content.slice(0, 50) + '...',
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Moderación de Foros
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Revisa y gestiona el contenido generado por la comunidad.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-medium">
            {formattedPosts.length} Posts
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-medium">
            {formattedComments.length} Comentarios
          </span>
        </div>
      </div>

      <ForumModerationView
        posts={formattedPosts}
        comments={formattedComments}
      />
    </div>
  )
}
