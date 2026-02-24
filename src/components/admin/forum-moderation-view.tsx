'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { moderateForumContent } from '@/app/(main)/admin/foros/actions'

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
      <div className="flex space-x-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'posts'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Publicaciones ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'comments'
              ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Comentarios ({comments.length})
        </button>
      </div>

      {/* Lista de Contenido */}
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
            <span className="text-4xl">👍</span>
            <p className="mt-2 text-gray-500">
              No hay{' '}
              {activeTab === 'posts' ? 'publicaciones' : 'comentarios'}{' '}
              reportados.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-6"
            >
              {/* Información del Autor y Contexto */}
              <div className="md:w-1/4 space-y-3 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-700 pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                    {item.author.name?.[0] || '?'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">
                      {item.author.name || 'Anónimo'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.author.email}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
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
                      <span className="font-medium">{item.forumName}</span>
                    </p>
                  )}
                  {item.postTitle && (
                    <p>
                      💬 En:{' '}
                      <span className="font-medium truncate block">
                        {item.postTitle}
                      </span>
                    </p>
                  )}
                </div>

                <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded text-xs font-bold inline-flex items-center gap-1">
                  🚩 {item.reportsCount} Reportes
                </div>
              </div>

              {/* Contenido y Acciones */}
              <div className="md:w-3/4 flex flex-col justify-between">
                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-md border border-gray-100 dark:border-slate-700 mb-4">
                  <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap font-mono">
                    {item.content}
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleDecision(item.id, 'delete')}
                    disabled={processingId === item.id}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md border border-red-200 transition-colors disabled:opacity-50"
                  >
                    🗑️ Eliminar y Penalizar
                  </button>
                  <button
                    onClick={() => handleDecision(item.id, 'approve')}
                    disabled={processingId === item.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md shadow-sm transition-colors disabled:opacity-50"
                  >
                    ✅ Mantener (Falso Reporte)
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
