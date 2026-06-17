'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { moderateForumContent } from '@/app/(main)/admin/foros/actions'
import { CalendarDays, Pin, MessageSquare, Flag, Trash2, ShieldCheck } from 'lucide-react'

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

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`
const chip = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99,
  background: tint(color), color, fontSize: 11.5, fontWeight: 600, width: 'fit-content',
})

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

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
    border: '1px solid transparent', transition: 'all .15s ease',
    background: active ? 'var(--lh-surface)' : 'transparent',
    color: active ? 'var(--lh-accent)' : 'var(--lh-fg3)',
    borderColor: active ? 'var(--lh-border)' : 'transparent',
    boxShadow: active ? 'var(--lh-shadow-sm)' : 'none',
  })

  return (
    <div className="space-y-6">
      {/* Tabs de Navegación */}
      <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 11, background: 'var(--lh-surface2)', border: '1px solid var(--lh-border)' }}>
        <button onClick={() => setActiveTab('posts')} style={tabBtn(activeTab === 'posts')}>
          Publicaciones ({posts.length})
        </button>
        <button onClick={() => setActiveTab('comments')} style={tabBtn(activeTab === 'comments')}>
          Comentarios ({comments.length})
        </button>
      </div>

      {/* Lista de Contenido */}
      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="lh-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <ShieldCheck size={44} style={{ color: 'var(--lh-green)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--lh-fg2)', fontWeight: 500, margin: 0 }}>
              No hay {activeTab === 'posts' ? 'publicaciones' : 'comentarios'} reportados.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="lh-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="flex flex-col md:flex-row">
                {/* Información del Autor y Contexto */}
                <div className="md:w-1/4" style={{ padding: 20, background: 'var(--lh-surface2)', borderBottom: '1px solid var(--lh-border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--lh-accent),var(--lh-accent-ink))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                      {item.author.name?.[0] || '?'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p className="truncate" style={{ fontSize: 14, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>
                        {item.author.name || 'Anónimo'}
                      </p>
                      <p className="truncate" style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: 0 }}>
                        {item.author.email}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--lh-fg3)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <CalendarDays size={13} />
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es })}
                    </span>
                    {item.forumName && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Pin size={13} /> Foro: <span style={{ fontWeight: 500, color: 'var(--lh-fg)' }}>{item.forumName}</span>
                      </span>
                    )}
                    {item.postTitle && (
                      <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 6 }}>
                        <MessageSquare size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                        <span className="truncate" style={{ fontWeight: 500, color: 'var(--lh-fg)' }}>{item.postTitle}</span>
                      </span>
                    )}
                  </div>

                  <span style={chip('var(--lh-terra)')}>
                    <Flag size={13} /> {item.reportsCount} reportes
                  </span>
                </div>

                {/* Contenido y Acciones */}
                <div className="md:w-3/4" style={{ padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ background: 'var(--lh-surface2)', padding: 14, borderRadius: 12, border: '1px solid var(--lh-border)' }}>
                    <p style={{ color: 'var(--lh-fg)', fontSize: 13.5, whiteSpace: 'pre-wrap', fontFamily: 'var(--lh-mono)', lineHeight: 1.6, margin: 0 }}>
                      {item.content}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleDecision(item.id, 'delete')}
                      disabled={processingId === item.id}
                      className="lh-btn lh-btn--sm lh-btn--secondary"
                      style={{ color: 'var(--lh-terra)', borderColor: 'color-mix(in oklch, var(--lh-terra) 35%, transparent)', opacity: processingId === item.id ? 0.6 : 1 }}
                    >
                      <Trash2 size={15} /> Eliminar y penalizar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(item.id, 'approve')}
                      disabled={processingId === item.id}
                      className="lh-btn lh-btn--sm"
                      style={{ background: 'var(--lh-green)', color: '#fff', opacity: processingId === item.id ? 0.6 : 1 }}
                    >
                      <ShieldCheck size={15} /> Mantener (falso reporte)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
