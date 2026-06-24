/**
 * Archived Forums ("Foros anteriores")
 * Read-only listing of past daily forums within the retention window,
 * grouped by the day they closed.
 */

import React, { Suspense } from 'react';
import Link from 'next/link';
import { getArchivedForums, type ForumWithPosts } from '@/lib/forum';
import { getServerLocale } from '@/lib/i18n-server';
import { translate, type SupportedLocale } from '@/lib/i18n';
import { Archive } from 'lucide-react';
import { PageHeader } from '@/components/lh/PageHeader';
import { EmptyState } from '@/components/lh/EmptyState';
import { RetryButton } from '@/components/ui/retry-button';
import { ArchivedForumCard } from '@/components/foros/archived-forum-card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Day key (YYYY-MM-DD) in Brisbane time, so forums group by their local day. */
function brisbaneDayKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Brisbane',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** Parse a YYYY-MM-DD key as a UTC midnight date for whole-day differences. */
function dayKeyToUtc(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}

interface DayGroup {
  key: string;
  daysAgo: number;
  date: Date;
  forums: ForumWithPosts[];
}

/** Group archived forums (already sorted endDate desc) by their closing day. */
function groupByDay(forums: ForumWithPosts[]): DayGroup[] {
  const todayKey = brisbaneDayKey(new Date());
  const groups: DayGroup[] = [];

  for (const forum of forums) {
    const key = brisbaneDayKey(new Date(forum.endDate));
    let group = groups.find((g) => g.key === key);
    if (!group) {
      const daysAgo = Math.round(
        (dayKeyToUtc(todayKey).getTime() - dayKeyToUtc(key).getTime()) / 86_400_000
      );
      group = { key, daysAgo, date: new Date(forum.endDate), forums: [] };
      groups.push(group);
    }
    group.forums.push(forum);
  }

  return groups;
}

async function ArchiveList({ locale }: { locale: SupportedLocale }) {
  const t = (k: string) => translate(k, { locale });

  try {
    const forums = await getArchivedForums(30);

    if (forums.length === 0) {
      return (
        <EmptyState
          icon={<Archive size={26} />}
          title={t('forums.archive.empty')}
          description={t('forums.archive.subtitle')}
        />
      );
    }

    const groups = groupByDay(forums);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {groups.map((group) => (
          <section key={group.key}>
            <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 15, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--lh-fg2)', textTransform: 'capitalize', margin: '0 0 14px' }}>
              {group.daysAgo === 0
                ? t('forums.archive.today')
                : group.daysAgo === 1
                ? t('forums.archive.yesterday')
                : group.date.toLocaleString(locale, { weekday: 'long', day: '2-digit', month: 'short', timeZone: 'Australia/Brisbane' })}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              {group.forums.map((forum, i) => (
                <ArchivedForumCard key={forum.id} forum={forum} colorIdx={i} locale={locale} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading archived forums:', error);
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ marginBottom: 16, fontWeight: 500, color: 'var(--lh-terra)' }}>{t('forums.error')}</p>
        <RetryButton className="lh-btn lh-btn--md lh-btn--primary">
          {t('forums.retry')}
        </RetryButton>
      </div>
    );
  }
}

export default async function ArchivedForumsPage() {
  const locale = await getServerLocale();
  const t = (k: string) => translate(k, { locale });

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>

      <PageHeader
        eyebrow="Foros & comunidad"
        title={t('forums.archive.title')}
        subtitle={t('forums.archive.subtitle')}
        accent="var(--lh-warm)"
      />

      <main className="lh-container" style={{ maxWidth: 1100, paddingTop: 40, paddingBottom: 64 }}>

        {/* Breadcrumb (coherente con el del foro individual) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 24 }} aria-label="Miga de pan">
          <Link href="/foros" style={{ fontWeight: 500, color: 'var(--lh-fg2)' }}>
            {t('forums.title')}
          </Link>
          <span style={{ color: 'var(--lh-fg3)' }}>/</span>
          <span style={{ fontWeight: 600, color: 'var(--lh-fg)' }}>{t('forums.archive.title')}</span>
        </nav>

        <Suspense
          fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
              <span className="animate-spin" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--lh-border)', borderTopColor: 'var(--lh-accent)', marginBottom: 16 }} aria-hidden="true" />
              <p style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>{t('forums.loading')}</p>
            </div>
          }
        >
          <ArchiveList locale={locale} />
        </Suspense>
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Foros anteriores | Latin Territory',
  description: 'Revive las conversaciones de los foros diarios de los días pasados.',
};
