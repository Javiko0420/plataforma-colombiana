/**
 * Daily Forums Page
 * Main page for the daily forum system
 */

import React, { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActiveForums } from '@/lib/forum';
import { getServerLocale } from '@/lib/i18n-server';
import { translate } from '@/lib/i18n';
import { MessageSquare, Calendar, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { RetryButton } from '@/components/ui/retry-button';
import { DateDisplay } from '@/components/ui/date-display';
import { ForumGuidelinesBanner } from '@/components/foros/forum-guidelines-banner';
import { PageHeader } from '@/components/lh/PageHeader';
import { EmptyState } from '@/components/lh/EmptyState';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`;

const neutralChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontSize: 12, fontWeight: 600, color: 'var(--lh-fg2)',
  background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)',
  padding: '5px 10px', borderRadius: 99,
};

const INFO_CARDS = [
  {
    icon: MessageSquare,
    title: 'Conversaciones diarias',
    desc: 'Los foros se renuevan cada día para mantener las conversaciones frescas y relevantes.',
    color: 'var(--lh-accent)',
  },
  {
    icon: Users,
    title: 'Comunidad moderada',
    desc: 'Sistema de moderación automática y reportes comunitarios para mantener un ambiente respetuoso.',
    color: 'var(--lh-green)',
  },
  {
    icon: Calendar,
    title: 'Sistema de reputación',
    desc: 'Gana reputación participando activamente y recibiendo likes en tus publicaciones.',
    color: 'var(--lh-warm)',
  },
];

async function ForumsList() {
  const locale = await getServerLocale();
  const t = (k: string) => translate(k, { locale });

  try {
    const forums = await getActiveForums();

    if (forums.length === 0) {
      return (
        <EmptyState
          icon={<MessageSquare size={26} />}
          title={t('forums.empty.posts')}
          description={t('forums.subtitle')}
        />
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2">
        {forums.map((forum) => (
          <ForumGuidelinesBanner key={forum.id} targetUrl={`/foros/${forum.slug}`}>
            <div className="lh-card lh-card--interactive group" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 21, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: '0 0 6px' }}>
                    {forum.name}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0 }}>
                    {forum.description}
                  </p>
                </div>
                <span aria-hidden="true" style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tint('var(--lh-accent)'), color: 'var(--lh-accent)' }}>
                  <MessageSquare size={22} />
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                <span style={neutralChip}>
                  <Calendar size={12} aria-hidden="true" />
                  {t('forums.activeUntil')}:{' '}
                  <DateDisplay date={forum.endDate} locale={locale} options={{ hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Brisbane' }} />
                </span>
                <span style={{ ...neutralChip, color: 'var(--lh-accent)', background: tint('var(--lh-accent)'), border: 'none' }}>
                  <Users size={12} aria-hidden="true" />
                  {forum.postsCount} {t('forums.postsCount')}
                </span>
              </div>

              <span className="lh-btn lh-btn--sm lh-btn--primary" style={{ marginTop: 'auto', width: '100%' }}>
                {t('forums.enter')} <ArrowRight size={15} />
              </span>
            </div>
          </ForumGuidelinesBanner>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading forums:', error);
    const locale = await getServerLocale();
    const t = (k: string) => translate(k, { locale });
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

export default async function ForumsPage() {
  const locale = await getServerLocale();
  const t = (k: string) => translate(k, { locale });
  const session = await getServerSession(authOptions);

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>

      <PageHeader
        eyebrow="Foros & comunidad"
        title={t('forums.title')}
        subtitle={t('forums.subtitle')}
        accent="var(--lh-accent)"
      />

      <main className="lh-container" style={{ maxWidth: 1100, paddingTop: 40, paddingBottom: 64 }}>

        {/* Auth notice */}
        {!session && (
          <div style={{ marginBottom: 28, padding: '14px 18px', borderRadius: 14, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: 0 }}>
              {t('forums.auth.required')}{' '}
              <Link href="/api/auth/signin" style={{ fontWeight: 600, color: 'var(--lh-accent)', textDecoration: 'underline' }}>
                {t('forums.auth.login')}
              </Link>
            </p>
          </div>
        )}

        {/* Lista de foros */}
        <Suspense
          fallback={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' }}>
              <span className="animate-spin" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--lh-border)', borderTopColor: 'var(--lh-accent)', marginBottom: 16 }} aria-hidden="true" />
              <p style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>{t('forums.loading')}</p>
            </div>
          }
        >
          <ForumsList />
        </Suspense>

        {/* Info cards */}
        <div style={{ marginTop: 56 }}>
          <div className="grid gap-5 md:grid-cols-3">
            {INFO_CARDS.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="lh-card" style={{ padding: 24 }}>
                <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tint(color), color, marginBottom: 16 }}>
                  <Icon size={22} />
                </span>
                <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 8px' }}>
                  {title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export const metadata = {
  title: 'Foros Diarios | Latin Territory',
  description: 'Participa en conversaciones diarias sobre emprendimiento, negocios y oportunidades en nuestra comunidad latina.',
};
