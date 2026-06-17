'use client'

import { useState, useTransition } from 'react'
import { updateForumDetails } from '@/app/(main)/admin/foros/actions'
import { Button } from '@/components/lh/Button'
import { MessageSquare, Inbox, Pencil } from 'lucide-react'

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

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

export function ForumSettingsPanel({ forums }: ForumSettingsPanelProps) {
  return (
    <div className="space-y-4">
      {forums.length === 0 ? (
        <div className="lh-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
          <Inbox size={44} style={{ color: 'var(--lh-fg3)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--lh-fg2)', fontWeight: 500, margin: 0 }}>
            No hay foros activos en este momento.
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--lh-fg3)', marginTop: 4 }}>
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
    <div className="lh-card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header con badge del topic */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 20px', background: 'var(--lh-surface2)', borderBottom: '1px solid var(--lh-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: tint('var(--lh-accent)'), color: 'var(--lh-accent)', fontSize: 11.5, fontWeight: 600 }}>
            <MessageSquare size={13} /> {topicLabel}
          </span>
          <span style={{ fontSize: 12, color: 'var(--lh-fg3)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            slug:
            <code style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', padding: '2px 6px', borderRadius: 6, color: 'var(--lh-fg2)' }}>{forum.slug}</code>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>
            {forum.postsCount} publicaciones
          </span>
          {!isEditing && (
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil size={14} /> Editar
            </Button>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Feedback message */}
        {message && (
          <div
            style={{
              padding: '10px 14px', borderRadius: 10, fontSize: 13.5, fontWeight: 500,
              border: `1px solid ${message.type === 'success' ? 'color-mix(in oklch, var(--lh-green) 35%, transparent)' : 'color-mix(in oklch, var(--lh-terra) 35%, transparent)'}`,
              background: message.type === 'success' ? tint('var(--lh-green)') : tint('var(--lh-terra)'),
              color: message.type === 'success' ? 'var(--lh-green)' : 'var(--lh-terra)',
            }}
          >
            {message.text}
          </div>
        )}

        {isEditing ? (
          <>
            {/* Editable name */}
            <div>
              <label htmlFor={`forum-name-${forum.id}`} className="lh-label">
                Título del foro
              </label>
              <input
                id={`forum-name-${forum.id}`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                className="lh-input"
                placeholder="Ej: Emprendimiento digital en Colombia"
              />
              <p style={{ marginTop: 6, fontSize: 12, color: 'var(--lh-fg3)' }}>{name.length}/100 caracteres</p>
            </div>

            {/* Editable description */}
            <div>
              <label htmlFor={`forum-desc-${forum.id}`} className="lh-label">
                Descripción / tema del día
              </label>
              <textarea
                id={`forum-desc-${forum.id}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={3}
                className="lh-input"
                style={{ resize: 'none' }}
                placeholder="Ej: Hoy discutimos estrategias de marketing digital para PYMEs colombianas…"
              />
              <p style={{ marginTop: 6, fontSize: 12, color: 'var(--lh-fg3)' }}>{description.length}/300 caracteres</p>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
              <Button variant="secondary" size="sm" onClick={handleCancel} disabled={isPending}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isPending || !hasChanges}>
                {isPending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Read-only display */}
            <div>
              <p className="lh-label">Título del foro</p>
              <p style={{ fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>
                {forum.name}
              </p>
            </div>
            <div>
              <p className="lh-label">Descripción / tema del día</p>
              <p style={{ fontSize: 14, color: 'var(--lh-fg2)', lineHeight: 1.6, margin: 0 }}>
                {forum.description}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
