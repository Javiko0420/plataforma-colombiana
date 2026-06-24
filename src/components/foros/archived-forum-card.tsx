/**
 * Archived Forum Card — a past (closed) forum in the archive view.
 * Server Component. Mirrors ForumRoomCard but in a "muted"/read-only variant:
 * no live badges, an "Archivado" chip, the close date and a "Ver conversación"
 * link into the (read-only) forum.
 */

import Link from 'next/link'
import { Archive, MessageSquare, ArrowRight } from 'lucide-react'
import { translate, type SupportedLocale } from '@/lib/i18n'
import type { ForumWithPosts } from '@/lib/forum'
import { forumColor } from './forum-palette'

interface ArchivedForumCardProps {
  forum: ForumWithPosts
  /** Color identity by order, like the hub — rendered desaturated (historic). */
  colorIdx: number
  locale: SupportedLocale
}

export function ArchivedForumCard({ forum, colorIdx, locale }: ArchivedForumCardProps) {
  const t = (k: string) => translate(k, { locale })
  const href = `/foros/${forum.slug}`
  // Desaturate the forum color toward neutral so it reads as historic.
  const mutedBorder = `color-mix(in oklch, ${forumColor(colorIdx)} 55%, var(--lh-fg3))`
  // Format server-side with an explicit timeZone (deterministic, no flash).
  const endedOn = new Date(forum.endDate).toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    timeZone: 'Australia/Brisbane',
  })

  return (
    <article
      className="lh-card"
      style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 22, borderLeft: `3px solid ${mutedBorder}` }}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: '0 0 6px' }}>
            {forum.name}
          </h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--lh-fg2)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {forum.description}
          </p>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: 11.5, fontWeight: 600, color: 'var(--lh-warm)', background: 'color-mix(in oklch, var(--lh-warm) 13%, transparent)', padding: '4px 9px', borderRadius: 99 }}>
          <Archive size={11} aria-hidden="true" />
          {t('forums.archive.badge')}
        </span>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 'auto', paddingTop: 14 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: 'var(--lh-fg2)' }}>
          <MessageSquare size={13} aria-hidden="true" />
          {forum.postsCount} {t('forums.postsCount')}
        </span>
        <span style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>
          {t('forums.archive.endedOn')} {endedOn}
        </span>
        <Link
          href={href}
          className="lh-btn lh-btn--sm lh-btn--secondary"
          style={{ marginLeft: 'auto' }}
          aria-label={`${t('forums.archive.viewConversation')}: ${forum.name}`}
        >
          {t('forums.archive.viewConversation')} <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
