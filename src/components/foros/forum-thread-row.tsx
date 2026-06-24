'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { forumColor } from './forum-palette'

export interface ForumThreadRowProps {
  /** Texto principal del hilo (en posts reales: content truncado). */
  title: string
  /** Autor visible (nickname o 'Anonymous'). */
  author: string
  /** Tiempo relativo ya formateado (ej. "hace 2 h"). */
  time: string
  /** Nº de respuestas/comentarios. */
  replies: number | string
  /** Iniciales para el avatar (2 letras). */
  avatar: string
  /** Índice de color (0=accent, 1=terra, 2=warm, 3=green). */
  colorIdx: number
  /** Destino del hilo (ej. /foros/{slug}). */
  href: string
  /** Chip opcional en la línea meta (ej. nombre del foro en trending). */
  badge?: ReactNode
}

/**
 * Fila de hilo de foro: avatar tintado + título + (autor · tiempo) + contador.
 * Componente presentacional reutilizable (landing, salas y trending).
 * Marcado "use client" únicamente por el hover JS (translateX) que ya tenía la landing.
 */
export function ForumThreadRow({ title, author, time, replies, avatar, colorIdx, href, badge }: ForumThreadRowProps) {
  const c = forumColor(colorIdx)

  return (
    <Link
      href={href}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '17px 19px', borderRadius: 15, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.22s', textDecoration: 'none' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateX(4px)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = '' }}
    >
      <span aria-hidden="true" style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: `linear-gradient(135deg,${c},var(--lh-accent-ink))`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15 }}>{avatar}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-.01em' }}>{title}</div>
        {badge ? (
          <div style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--lh-fg2)' }}>{author} · {time}</span>
            {badge}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: 'var(--lh-fg2)', marginTop: 3 }}>{author} · {time}</div>
        )}
      </div>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lh-fg2)', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
        <MessageCircle size={15} aria-hidden="true" /> {replies}
      </span>
    </Link>
  )
}
