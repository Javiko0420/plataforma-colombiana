import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { ForumThreadRow } from '@/components/foros/forum-thread-row'
import { forumColor, forumChip } from '@/components/foros/forum-palette'
import { formatRelativeTime, getInitials } from '@/lib/forum-format'
import { getHomeThreads, type HomeThread } from '@/lib/home-data'
import { logger } from '@/lib/logger'

/*
 * Server Component: los hilos trending llegan en el HTML inicial.
 * ForumThreadRow sigue siendo client (leaf) y recibe props serializables.
 */

/* ─── Widget de foros (async server): datos cacheados 1 min ─── */
export async function ForumsWidget() {
  let threads: HomeThread[]
  try {
    threads = await getHomeThreads()
  } catch (error) {
    logger.error('Error loading home trending threads', { error })
    return (
      <p style={{ fontSize: 14.5, color: 'var(--lh-fg2)', padding: '8px 2px' }}>
        No pudimos cargar las conversaciones en este momento. Intenta recargar la página.
      </p>
    )
  }

  // Vacío (aún no hay posts en los foros del día)
  if (threads.length === 0) {
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

/* ─── Skeleton (fallback de Suspense, misma forma que ForumThreadRow) ─── */
export function ForumsWidgetSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '17px 19px', borderRadius: 15, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)' }}>
          <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: 'var(--lh-surface2)' }} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ width: '70%', height: 15, borderRadius: 6, background: 'var(--lh-surface2)' }} />
            <div style={{ width: '40%', height: 12, borderRadius: 6, background: 'var(--lh-surface2)' }} />
          </div>
          <span style={{ width: 36, height: 16, borderRadius: 6, background: 'var(--lh-surface2)', flexShrink: 0 }} />
        </div>
      ))}
    </>
  )
}
