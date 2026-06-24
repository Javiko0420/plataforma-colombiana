/**
 * Forums Trending — "Lo más comentado ahora" strip.
 * Server Component: a flat list of the most-commented posts across all active
 * forums, each row tagged with a small forum-name chip in its meta line.
 */

import { TrendingUp } from 'lucide-react'
import { translate, type SupportedLocale } from '@/lib/i18n'
import { formatRelativeTime, getInitials } from '@/lib/forum-format'
import type { ForumHubThread } from '@/lib/forum'
import { ForumThreadRow } from './forum-thread-row'
import { forumColor, forumChip } from './forum-palette'

interface ForumsTrendingProps {
  trending: ForumHubThread[]
  locale: SupportedLocale
}

export function ForumsTrending({ trending, locale }: ForumsTrendingProps) {
  if (trending.length === 0) return null
  const t = (k: string) => translate(k, { locale })

  return (
    <section aria-labelledby="forums-trending-title" style={{ marginTop: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span aria-hidden="true" style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: forumChip(0), color: forumColor(0) }}>
          <TrendingUp size={18} />
        </span>
        <h2 id="forums-trending-title" style={{ fontFamily: 'var(--lh-font)', fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>
          {t('forums.trending.title')}
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {trending.map((thread) => (
          <ForumThreadRow
            key={thread.id}
            title={thread.displayTitle}
            author={thread.authorNickname}
            time={formatRelativeTime(thread.createdAt, locale)}
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
      </div>
    </section>
  )
}
