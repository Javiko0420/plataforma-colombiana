'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { moderateForumContent } from '@/app/(main)/admin/foros/actions'
import { LtPanel, LtBadge, LtButton } from '@/components/lt'

interface FlaggedItem {
  id: string
  content: string
  createdAt: Date
  author: { name: string | null; email: string; image: string | null }
  reportsCount: number
  isFlagged: boolean
  forumName?: string // Para posts
  postTitle?: string // Para comentarios (saber a qué post pertenecen)
}

interface ForumModerationViewProps {
  posts: FlaggedItem[]
  comments: FlaggedItem[]
}

export function ForumModerationView({
  posts,
  comments,
}: ForumModerationViewProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const items = activeTab === 'posts' ? posts : comments

  const handleDecision = async (
    id: string,
    decision: 'approve' | 'delete',
  ) => {
    if (
      decision === 'delete' &&
      !confirm('¿Estás seguro de eliminar este contenido?')
    )
      return

    setProcessingId(id)
    const type = activeTab === 'posts' ? 'post' : 'comment'
    await moderateForumContent(id, type, decision)
    setProcessingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Tabs de Navegación */}
      <div className="flex space-x-1 bg-[var(--lt-bg)] border-[2.2px] border-[var(--lt-ink)] p-1 rounded-[var(--lt-radius-sm)] w-fit">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm font-medium rounded-[var(--lt-radius-sm)] transition-all ${
            activeTab === 'posts'
              ? 'bg-[var(--lt-paper)] text-[var(--lt-accent)] shadow-[var(--lt-shadow-sticker)] border-[2px] border-[var(--lt-ink)]'
              : 'text-[var(--lt-ink-soft)] hover:text-[var(--lt-ink)]'
          }`}
        >
          Publicaciones ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 text-sm font-medium rounded-[var(--lt-radius-sm)] transition-all ${
            activeTab === 'comments'
              ? 'bg-[var(--lt-paper)] text-[var(--lt-accent)] shadow-[var(--lt-shadow-sticker)] border-[2px] border-[var(--lt-ink)]'
              : 'text-[var(--lt-ink-soft)] hover:text-[var(--lt-ink)]'
          }`}
        >
          Comentarios ({comments.length})
        </button>
      </div>

      {/* Lista de Contenido */}
      <div className="grid gap-4">
        {items.length === 0 ? (
          <LtPanel className="text-center py-12 border-dashed" shadow="sm">
            <span className="text-4xl">👍</span>
            <p className="mt-2 text-[var(--lt-ink-soft)]">
              No hay{' '}
              {activeTab === 'posts' ? 'publicaciones' : 'comentarios'}{' '}
              reportados.
            </p>
          </LtPanel>
        ) : (
          items.map((item) => (
            <LtPanel
              key={item.id}
              className="p-6 flex flex-col md:flex-row gap-6"
              shadow="md"
            >
              {/* Información del Autor y Contexto */}
              <div className="md:w-1/4 space-y-3 border-b-[2px] md:border-b-0 md:border-r-[2px] border-[var(--lt-ink)]/20 pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--lt-accent)] border-[2px] border-[var(--lt-ink)] flex items-center justify-center text-[var(--lt-paper)] font-bold shrink-0">
                    {item.author.name?.[0] || '?'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate text-[var(--lt-ink)]">
                      {item.author.name || 'Anónimo'}
                    </p>
                    <p className="text-xs text-[var(--lt-ink-soft)] truncate">
                      {item.author.email}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-[var(--lt-ink-soft)] space-y-1">
                  <p>
                    📅{' '}
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                  {item.forumName && (
                    <p>
                      📌 Foro:{' '}
                      <span className="font-medium text-[var(--lt-ink)]">{item.forumName}</span>
                    </p>
                  )}
                  {item.postTitle && (
                    <p>
                      💬 En:{' '}
                      <span className="font-medium truncate block text-[var(--lt-ink)]">
                        {item.postTitle}
                      </span>
                    </p>
                  )}
                </div>

                <LtBadge tone="terracota">
                  🚩 {item.reportsCount} Reportes
                </LtBadge>
              </div>

              {/* Contenido y Acciones */}
              <div className="md:w-3/4 flex flex-col justify-between">
                <div className="bg-[var(--lt-bg)] p-4 rounded-[var(--lt-radius-sm)] border-[2px] border-[var(--lt-ink)]/20 mb-4">
                  <p className="text-[var(--lt-ink)] text-sm whitespace-pre-wrap font-mono">
                    {item.content}
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <LtButton
                    variant="outline"
                    tone="paper"
                    size="sm"
                    onClick={() => handleDecision(item.id, 'delete')}
                    disabled={processingId === item.id}
                    loading={processingId === item.id}
                    loadingText="..."
                  >
                    🗑️ Eliminar y Penalizar
                  </LtButton>
                  <LtButton
                    variant="sticker"
                    tone="verde"
                    size="sm"
                    onClick={() => handleDecision(item.id, 'approve')}
                    disabled={processingId === item.id}
                    loading={processingId === item.id}
                    loadingText="..."
                  >
                    ✅ Mantener (Falso Reporte)
                  </LtButton>
                </div>
              </div>
            </LtPanel>
          ))
        )}
      </div>
    </div>
  )
}
