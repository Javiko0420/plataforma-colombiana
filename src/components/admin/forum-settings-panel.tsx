'use client'

import { useState, useTransition } from 'react'
import { updateForumDetails } from '@/app/admin/foros/actions'

interface ActiveForum {
  id: string
  name: string
  description: string
  topic: string
  slug: string
  postsCount: number
}

interface ForumSettingsPanelProps {
  forums: ActiveForum[]
}

export function ForumSettingsPanel({ forums }: ForumSettingsPanelProps) {
  return (
    <div className="space-y-4">
      {forums.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
          <span className="text-4xl">📭</span>
          <p className="mt-2 text-gray-500">
            No hay foros activos en este momento.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Los foros se crean automáticamente cada día por el cron job.
          </p>
        </div>
      ) : (
        forums.map((forum) => (
          <ForumEditCard key={forum.id} forum={forum} />
        ))
      )}
    </div>
  )
}

function ForumEditCard({ forum }: { forum: ActiveForum }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(forum.name)
  const [description, setDescription] = useState(forum.description)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const topicLabel = forum.topic === 'DAILY_1' ? 'Foro Diario 1' : 'Foro Diario 2'
  const hasChanges = name !== forum.name || description !== forum.description

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await updateForumDetails(forum.id, name, description)
      if (result.success) {
        setMessage({ type: 'success', text: 'Foro actualizado correctamente.' })
        setIsEditing(false)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error desconocido.' })
      }
    })
  }

  const handleCancel = () => {
    setName(forum.name)
    setDescription(forum.description)
    setIsEditing(false)
    setMessage(null)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Header con badge del topic */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            💬 {topicLabel}
          </span>
          <span className="text-xs text-gray-400">
            slug: <code className="bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">{forum.slug}</code>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {forum.postsCount} publicaciones
          </span>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800 transition-colors"
            >
              ✏️ Editar
            </button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Feedback message */}
        {message && (
          <div
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {isEditing ? (
          <>
            {/* Editable name */}
            <div>
              <label
                htmlFor={`forum-name-${forum.id}`}
                className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
              >
                Título del Foro
              </label>
              <input
                id={`forum-name-${forum.id}`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                placeholder="Ej: Emprendimiento Digital en Colombia"
              />
              <p className="mt-1 text-xs text-gray-400">{name.length}/100 caracteres</p>
            </div>

            {/* Editable description */}
            <div>
              <label
                htmlFor={`forum-desc-${forum.id}`}
                className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
              >
                Descripción / Tema del Día
              </label>
              <textarea
                id={`forum-desc-${forum.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={3}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
                placeholder="Ej: Hoy discutimos estrategias de marketing digital para PYMEs colombianas..."
              />
              <p className="mt-1 text-xs text-gray-400">{description.length}/300 caracteres</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCancel}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending || !hasChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Read-only display */}
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Título del Foro
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {forum.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Descripción / Tema del Día
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {forum.description}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
