import { prisma } from '@/lib/prisma'
import { ForumModerationView } from '@/components/admin/forum-moderation-view'
import { ForumSettingsPanel } from '@/components/admin/forum-settings-panel'

export const dynamic = 'force-dynamic'

export default async function ForumModerationPage() {
  // 0. Obtener foros activos para gestión de títulos/descripciones
  const activeForums = await prisma.forum.findMany({
    where: { isActive: true },
    include: { _count: { select: { posts: true } } },
    orderBy: { topic: 'asc' },
  })

  const forumsForSettings = activeForums.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    topic: f.topic,
    slug: f.slug,
    postsCount: f._count.posts,
  }))

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
    <div className="space-y-8">
      {/* Sección 1: Configuración de Foros Activos */}
      <section>
        <div className="flex justify-between items-end mb-4 gap-4">
          <div>
            <h1 className="lh-h2" style={{ fontSize: 'clamp(22px,3.4vw,28px)', margin: 0 }}>Gestión de foros</h1>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '4px 0 0' }}>
              Configura los títulos y temas del día para los foros activos.
            </p>
          </div>
          <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: '5px 11px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-accent) 14%, transparent)', color: 'var(--lh-accent)', fontSize: 12.5, fontWeight: 600 }}>
            {forumsForSettings.length} activos
          </span>
        </div>

        <ForumSettingsPanel forums={forumsForSettings} />
      </section>

      {/* Separador visual */}
      <hr style={{ border: 0, borderTop: '1px solid var(--lh-border)' }} />

      {/* Sección 2: Moderación de Contenido Reportado */}
      <section>
        <div className="flex justify-between items-end mb-4 gap-4">
          <div>
            <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>Moderación de contenido</h2>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '4px 0 0' }}>
              Revisa y gestiona el contenido reportado por la comunidad.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 11px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)', color: 'var(--lh-terra)', fontSize: 12.5, fontWeight: 600 }}>
              {formattedPosts.length} Posts
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 11px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-warm) 14%, transparent)', color: 'var(--lh-warm)', fontSize: 12.5, fontWeight: 600 }}>
              {formattedComments.length} Comentarios
            </span>
          </div>
        </div>

        <ForumModerationView
          posts={formattedPosts}
          comments={formattedComments}
        />
      </section>
    </div>
  )
}
