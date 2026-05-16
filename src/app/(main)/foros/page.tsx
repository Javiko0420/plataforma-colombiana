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
import { MessageSquare, Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { RetryButton } from '@/components/ui/retry-button';
import { DateDisplay } from '@/components/ui/date-display';
import { ForumGuidelinesBanner } from '@/components/foros/forum-guidelines-banner';
import { SunMotif } from '@/components/lt/SunMotif';
import { LeafSprig } from '@/components/lt/LeafSprig';
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline';
import { LtCard, LtCardBody } from '@/components/lt/Card';
import { LtBadge } from '@/components/lt/Badge';
import { Squiggle } from '@/components/lt/Squiggle';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const INFO_CARDS = [
  {
    icon: MessageSquare,
    title: 'Conversaciones Diarias',
    desc: 'Los foros se renuevan cada día para mantener las conversaciones frescas y relevantes.',
    tone: 'terracota' as const,
  },
  {
    icon: Users,
    title: 'Comunidad Moderada',
    desc: 'Sistema de moderación automática y reportes comunitarios para mantener un ambiente respetuoso.',
    tone: 'verde' as const,
  },
  {
    icon: Calendar,
    title: 'Sistema de Reputación',
    desc: 'Gana reputación participando activamente y recibiendo likes en tus publicaciones.',
    tone: 'sun' as const,
  },
];

async function ForumsList() {
  const locale = await getServerLocale();
  const t = (k: string) => translate(k, { locale });

  try {
    const forums = await getActiveForums();

    if (forums.length === 0) {
      return (
        <div
          className="flex flex-col items-center py-16 text-center rounded-[var(--lt-radius-lg)] border-[2px] border-dashed border-[var(--lt-ink)]"
          style={{ background: 'var(--lt-paper)' }}
        >
          <div aria-hidden="true" className="mb-4 opacity-30">
            <SunMotif size={64} />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('forums.empty.posts')}
          </h3>
          <p className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
            {t('forums.subtitle')}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-8 md:grid-cols-2">
        {forums.map((forum, i) => (
          <ForumGuidelinesBanner key={forum.id} targetUrl={`/foros/${forum.slug}`}>
            <LtCard index={i} shadow="md" className="h-full cursor-pointer group">
              <LtCardBody className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-2xl font-bold mb-2 group-hover:text-[var(--lt-terracota)] transition-colors"
                      style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                    >
                      {forum.name}
                    </h3>
                    <p className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
                      {forum.description}
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0 ml-3"
                    style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                    aria-hidden="true"
                  >
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <LtBadge tone="neutral" rotate={-1}>
                    <Calendar className="w-3 h-3" aria-hidden="true" />
                    {t('forums.activeUntil')}:{' '}
                    <DateDisplay
                      date={forum.endDate}
                      locale={locale}
                      options={{ hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Brisbane' }}
                    />
                  </LtBadge>
                  <LtBadge tone="sun" rotate={1}>
                    <Users className="w-3 h-3" aria-hidden="true" />
                    {forum.postsCount} {t('forums.postsCount')}
                  </LtBadge>
                </div>

                <span
                  className="mt-auto block w-full py-3 px-4 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-center font-semibold text-sm transition-all group-hover:-translate-y-0.5"
                  style={{
                    background: 'var(--lt-ink)',
                    color: 'var(--lt-paper)',
                    boxShadow: 'var(--lt-shadow-sticker)',
                  }}
                >
                  {t('forums.enter')}
                </span>
              </LtCardBody>
            </LtCard>
          </ForumGuidelinesBanner>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error loading forums:', error);
    const locale = await getServerLocale();
    const t = (k: string) => translate(k, { locale });
    return (
      <div
        className="text-center py-12 rounded-[var(--lt-radius-lg)] border-[2px] border-dashed border-[var(--lt-ink)]"
        style={{ background: 'var(--lt-paper)' }}
      >
        <p className="mb-4 font-medium" style={{ color: 'var(--lt-terracota)' }}>{t('forums.error')}</p>
        <RetryButton
          className="px-5 py-2.5 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] font-semibold text-sm transition-all hover:-translate-y-0.5 [background:var(--lt-terracota)] [color:var(--lt-paper)] [box-shadow:var(--lt-shadow-sticker)]"
        >
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
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden border-b-[2px] border-[var(--lt-ink)] py-16 px-4"
        style={{ background: 'var(--lt-paper)' }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <SunMotif size={300} className="absolute opacity-[0.07]" style={{ top: '-50px', right: '-30px' }} />
          <LeafSprig size={100} className="absolute opacity-20" style={{ bottom: '10px', left: '16px', transform: 'rotate(-18deg)' }} />
        </div>
        <div className="relative max-w-6xl mx-auto text-center space-y-4">
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('forums.title')}
          </h1>
          <div className="flex justify-center" aria-hidden="true">
            <HandDrawnUnderline width={200} color="var(--lt-sun-core)" thickness={3} />
          </div>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            {t('forums.subtitle')}
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-10 max-w-6xl">

        {/* Auth notice */}
        {!session && (
          <div
            className="mb-8 p-4 rounded-[var(--lt-radius-md)] border-[1.6px] border-[var(--lt-ink)] text-center"
            style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
          >
            <p className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
              {t('forums.auth.required')}{' '}
              <Link
                href="/api/auth/signin"
                className="font-semibold underline focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
                style={{ color: 'var(--lt-terracota)' }}
              >
                {t('forums.auth.login')}
              </Link>
            </p>
          </div>
        )}

        {/* Lista de foros */}
        <Suspense
          fallback={
            <div className="flex flex-col items-center py-12">
              <SunMotif size={56} className="animate-spin mb-4 opacity-60" style={{ animationDuration: '1.4s' }} />
              <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>{t('forums.loading')}</p>
            </div>
          }
        >
          <ForumsList />
        </Suspense>

        {/* Info cards */}
        <div className="mt-14">
          <div className="flex justify-center mb-8" aria-hidden="true">
            <Squiggle width={160} color="var(--lt-terracota)" amplitude={4} />
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {INFO_CARDS.map(({ icon: Icon, title, desc, tone }, i) => (
              <LtCard key={title} index={i + 3} shadow="sm" noRotate>
                <LtCardBody className="p-6">
                  <div
                    className="w-12 h-12 rounded-[var(--lt-radius-sm)] flex items-center justify-center border-[1.6px] border-[var(--lt-ink)] mb-4"
                    style={{
                      background: `var(--lt-${tone})`,
                      color: tone === 'sun' ? 'var(--lt-ink)' : 'var(--lt-paper)',
                      boxShadow: 'var(--lt-shadow-sticker)',
                    }}
                    aria-hidden="true"
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3
                    className="text-lg font-bold mb-2"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
                    {desc}
                  </p>
                </LtCardBody>
              </LtCard>
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
