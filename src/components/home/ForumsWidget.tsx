'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { ForumThreadRow } from '@/components/foros/forum-thread-row'
import { forumColor, forumChip } from '@/components/foros/forum-palette'
import { formatRelativeTime, getInitials } from '@/lib/forum-format'

/* Solo los campos que la vitrina necesita; createdAt llega como string ISO
   desde el JSON de la API (mismo criterio que RecentJobs / UpcomingEvents). */
interface TrendingThread {
  id: string
  forumSlug: string
  forumName: string
  displayTitle: string
  authorNickname: string
  createdAt: string
  likesCount: number
  commentsCount: number
  colorIdx: number
}

/* ─── Widget de foros: conversaciones reales más activas (trending) ─── */
export function ForumsWidget() {
  const [threads, setThreads] = useState<TrendingThread[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/forums/trending?limit=3')
      .then(res => res.json())
      .then(json => {
        if (!active) return
        if (json?.success && Array.isArray(json.data)) setThreads(json.data)
        else setError(true)
      })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  // Carga
  if (threads === null && !error) {
    return <>{Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}</>
  }

  // Error de red / API
  if (error) {
    return (
      <p style={{ fontSize: 14.5, color: 'var(--lh-fg2)', padding: '8px 2px' }}>
        No pudimos cargar las conversaciones en este momento. Intenta recargar la página.
      </p>
    )
  }

  // Vacío (aún no hay posts en los foros del día)
  if (!threads || threads.length === 0) {
    return (
      <div style={{ padding: '32px 24px', textAlign: 'center', borderRadius: 15, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)' }}>
        <MessageCircle size={28} style={{ color: 'var(--lh-fg3)', opacity: 0.5 }} aria-hidden="true" />
        <p style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--lh-fg)', margin: '10px 0 4px' }}>
          Aún no hay conversaciones
        </p>
        <p style={{ fontSize: 13.5, color: 'var(--lh-fg2)', margin: '0 0 16px' }}>
          Sé el primero en abrir un tema en los foros del día.
        </p>
        <Link
          href="/foros"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12, background: 'var(--lh-accent)', color: '#fff', fontSize: 14.5, fontWeight: 600, textDecoration: 'none' }}
        >
          Ir a los foros
        </Link>
      </div>
    )
  }

  // Lista de conversaciones más comentadas
  return (
    <>
      {threads.map(thread => (
        <ForumThreadRow
          key={thread.id}
          title={thread.displayTitle}
          author={thread.authorNickname}
          time={formatRelativeTime(thread.createdAt, 'es')}
          replies={thread.commentsCount}
          avatar={getInitials(thread.authorNickname)}
          colorIdx={thread.colorIdx}
          href={`/foros/${thread.forumSlug}`}
          badge={
            <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, color: forumColor(thread.colorIdx), background: forumChip(thread.colorIdx), padding: '2px 8px', borderRadius: 99 }}>
              {thread.forumName}
            </span>
          }
        />
      ))}
    </>
  )
}

/* ─── Skeleton de carga (misma forma que ForumThreadRow) ─── */
function SkeletonRow() {
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '17px 19px', borderRadius: 15, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)' }}>
      <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: 'var(--lh-surface2)' }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ width: '70%', height: 15, borderRadius: 6, background: 'var(--lh-surface2)' }} />
        <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'var(--lh-surface2)' }} />
      </div>
      <span style={{ width: 36, height: 16, borderRadius: 6, background: 'var(--lh-surface2)', flexShrink: 0 }} />
    </div>
  )
}
