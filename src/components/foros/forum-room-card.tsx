/**
 * Forum Room Card — a single active forum rendered as a "live room".
 * Server Component: header with forum color identity, top-3 thread previews
 * (or an empty state), live participants badge, and an "Enter" CTA.
 */

import Link from 'next/link'
import { MessageSquare, ArrowRight, Users, Clock, PenLine } from 'lucide-react'
import { DateDisplay } from '@/components/ui/date-display'
import { translate, type SupportedLocale } from '@/lib/i18n'
import { formatRelativeTime, getInitials } from '@/lib/forum-format'
import type { ForumHubRoom } from '@/lib/forum'
import { ForumThreadRow } from './forum-thread-row'
import { forumColor, forumChip } from './forum-palette'

interface ForumRoomCardProps {
  room: ForumHubRoom
  locale: SupportedLocale
}

export function ForumRoomCard({ room, locale }: ForumRoomCardProps) {
  const t = (k: string) => translate(k, { locale })
  const color = forumColor(room.colorIdx)
  const href = `/foros/${room.slug}`

  return (
    <article
      className="lh-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: 24,
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Header: icon chip + name + active-until + participants badge */}
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span aria-hidden="true" style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: forumChip(room.colorIdx), color }}>
            <MessageSquare size={20} />
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>
              {room.name}
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--lh-fg3)', margin: '3px 0 0', display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <Clock size={12} aria-hidden="true" />
              {t('forums.room.activeUntil')}{' '}
              <DateDisplay date={room.endDate} locale={locale} options={{ hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Brisbane' }} />
            </p>
          </div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: 12, fontWeight: 600, color, background: forumChip(room.colorIdx), padding: '5px 10px', borderRadius: 99 }}>
          <Users size={12} aria-hidden="true" />
          {room.participantsCount} {t('forums.room.participants')}
        </span>
      </header>

      {/* Body: top threads or empty state */}
      {room.threads.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {room.threads.map((thread) => (
            <ForumThreadRow
              key={thread.id}
              title={thread.displayTitle}
              author={thread.authorNickname}
              time={formatRelativeTime(thread.createdAt, locale)}
              replies={thread.commentsCount}
              avatar={getInitials(thread.authorNickname)}
              colorIdx={thread.colorIdx}
              href={href}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', padding: '28px 16px', marginBottom: 20, borderRadius: 14, border: '1px dashed var(--lh-border)', background: 'var(--lh-surface2)' }}>
          <PenLine size={20} style={{ color: 'var(--lh-fg3)' }} aria-hidden="true" />
          <p style={{ fontSize: 13.5, color: 'var(--lh-fg2)', margin: 0 }}>{t('forums.room.beFirst')}</p>
        </div>
      )}

      {/* Footer: enter CTA */}
      <Link
        href={href}
        className="lh-btn lh-btn--sm lh-btn--primary"
        style={{ marginTop: 'auto', width: '100%' }}
        aria-label={`${t('forums.room.enter')}: ${room.name}`}
      >
        {t('forums.room.enter')} <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </article>
  )
}
