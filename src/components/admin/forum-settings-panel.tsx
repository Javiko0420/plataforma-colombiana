'use client'

import { useState, useTransition } from 'react'
import { updateForumDetails } from '@/app/(main)/admin/foros/actions'
import { LtPanel, LtBadge, LtButton } from '@/components/lt'

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
        <LtPanel className="text-center py-8 border-dashed" shadow="sm">
          <span className="text-4xl">📭</span>
          <p className="mt-2 text-[var(--lt-ink-soft)]">
            No hay foros activos en este momento.
          </p>
          <p className="text-xs text-[var(--lt-ink-soft)] opacity-80 mt-1">
            Los foros se crean automáticamente cada día por el cron job.
          </p>
        </LtPanel>
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
    <LtPanel className="overflow-hidden p-0" shadow="md">
      {/* Header con badge del topic */}
      <div className="flex items-center justify-between px-6 py-3 bg-[var(--lt-bg)] border-b-[2.2px] border-[var(--lt-ink)]">
        <div className="flex items-center gap-3">
          <LtBadge tone="accent">
            💬 {topicLabel}
          </LtBadge>
          <span className="text-xs text-[var(--lt-ink-soft)]">
            slug: <code className="bg-[var(--lt-paper)] border-[1.6px] border-[var(--lt-ink)] px-1.5 py-0.5 rounded text-[11px]">{forum.slug}</code>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--lt-ink-soft)]">
            {forum.postsCount} publicaciones
          </span>
          {!isEditing && (
            <LtButton
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Editar
            </LtButton>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-4">
        {/* Feedback message */}
        {message && (
          <div
            className={`px-4 py-2 rounded-[var(--lt-radius-sm)] text-sm font-medium border-[2.2px] ${
              message.type === 'success'
                ? 'bg-[var(--lt-bg)] text-[var(--lt-verde)] border-[var(--lt-verde)]'
                : 'bg-[var(--lt-bg)] text-[var(--lt-terracota)] border-[var(--lt-terracota)]'
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
                className="lt-label uppercase tracking-wider text-xs"
              >
                Título del Foro
              </label>
              <input
                id={`forum-name-${forum.id}`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="lt-input"
                placeholder="Ej: Emprendimiento Digital en Colombia"
              />
              <p className="mt-1 text-xs text-[var(--lt-ink-soft)]">{name.length}/100 caracteres</p>
            </div>

            {/* Editable description */}
            <div>
              <label
                htmlFor={`forum-desc-${forum.id}`}
                className="lt-label uppercase tracking-wider text-xs"
              >
                Descripción / Tema del Día
              </label>
              <textarea
                id={`forum-desc-${forum.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={3}
                className="lt-input resize-none"
                placeholder="Ej: Hoy discutimos estrategias de marketing digital para PYMEs colombianas..."
              />
              <p className="mt-1 text-xs text-[var(--lt-ink-soft)]">{description.length}/300 caracteres</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <LtButton
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isPending}
              >
                Cancelar
              </LtButton>
              <LtButton
                variant="sticker"
                tone="accent"
                size="sm"
                onClick={handleSave}
                disabled={isPending || !hasChanges}
                loading={isPending}
                loadingText="Guardando..."
              >
                Guardar Cambios
              </LtButton>
            </div>
          </>
        ) : (
          <>
            {/* Read-only display */}
            <div>
              <p className="lt-label uppercase tracking-wider text-xs mb-1">
                Título del Foro
              </p>
              <p
                className="text-lg font-bold text-[var(--lt-ink)]"
                style={{ fontFamily: 'var(--lt-font-serif)' }}
              >
                {forum.name}
              </p>
            </div>
            <div>
              <p className="lt-label uppercase tracking-wider text-xs mb-1">
                Descripción / Tema del Día
              </p>
              <p className="text-sm text-[var(--lt-ink-soft)]">
                {forum.description}
              </p>
            </div>
          </>
        )}
      </div>
    </LtPanel>
  )
}
