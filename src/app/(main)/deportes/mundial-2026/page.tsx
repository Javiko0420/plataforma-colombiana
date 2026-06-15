import { Suspense, type ReactNode } from 'react'
import { getServerLocale } from '@/lib/i18n-server'
import { translate } from '@/lib/i18n'
import { getWorldcupLive } from '@/lib/sports/worldcup/service'
import WorldcupHero from './components/WorldcupHero'
import WorldcupLiveSection from './components/WorldcupLiveSection'
import WorldcupFixturesSection from './components/WorldcupFixturesSection'
import WorldcupGroupStandingsGrid from './components/WorldcupGroupStandingsGrid'
import WorldcupTeamsGrid from './components/WorldcupTeamsGrid'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-[var(--lt-radius-sm)] animate-pulse"
          style={{ background: 'var(--lt-paper)', opacity: 0.6 }}
        />
      ))}
    </div>
  )
}

function SectionTitle({ id, title, badge }: { id: string; title: string; badge?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        aria-hidden="true"
        className="w-1 h-7 rounded-full flex-none"
        style={{ background: 'var(--lt-verde)' }}
      />
      <h2
        id={id}
        className="text-xl md:text-2xl font-bold"
        style={{
          fontFamily: 'var(--lt-font-serif)',
          color: 'var(--lt-ink)',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {badge}
    </div>
  )
}

export default async function WorldcupPage() {
  const locale = await getServerLocale()
  const t = (k: string) => translate(k, { locale })

  const initialLiveData = await getWorldcupLive().catch(() => ({
    fixtures: [],
    hasLive: false,
    cachedAt: new Date().toISOString(),
  }))

  const liveBadge = initialLiveData.hasLive ? (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-[var(--lt-radius-sm)]"
      style={{
        background: 'var(--lt-terracota)',
        color: 'var(--lt-paper)',
        boxShadow: '1px 1px 0 var(--lt-ink)',
        fontFamily: 'var(--lt-font-sans)',
      }}
    >
      <span className="animate-pulse leading-none">●</span>
      EN VIVO
    </span>
  ) : undefined

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100dvh' }}>
      <WorldcupHero locale={locale} />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        <section aria-labelledby="wc-live-title">
          <SectionTitle id="wc-live-title" title={t('sports.live')} badge={liveBadge} />
          <WorldcupLiveSection initialData={initialLiveData} />
        </section>

        <section aria-labelledby="wc-fixtures-title">
          <SectionTitle id="wc-fixtures-title" title={t('sports.worldcup.fixtures')} />
          <Suspense fallback={<SectionSkeleton rows={4} />}>
            <WorldcupFixturesSection locale={locale} />
          </Suspense>
        </section>

        <section aria-labelledby="wc-standings-title">
          <SectionTitle id="wc-standings-title" title={t('sports.worldcup.standings')} />
          <Suspense fallback={<SectionSkeleton rows={3} />}>
            <WorldcupGroupStandingsGrid locale={locale} />
          </Suspense>
        </section>

        <section aria-labelledby="wc-teams-title">
          <SectionTitle id="wc-teams-title" title={t('sports.worldcup.teams')} />
          <Suspense
            fallback={
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 rounded-[var(--lt-radius-md)] animate-pulse"
                    style={{ background: 'var(--lt-paper)', opacity: 0.6 }}
                  />
                ))}
              </div>
            }
          >
            <WorldcupTeamsGrid locale={locale} />
          </Suspense>
        </section>

      </main>
    </div>
  )
}
