import { Suspense } from 'react'
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

export default async function WorldcupPage() {
  const locale = await getServerLocale()
  const t = (k: string) => translate(k, { locale })

  // Fetch initial live data to hydrate the client component immediately.
  // On failure we fall back gracefully — the client will poll on its own.
  const initialLiveData = await getWorldcupLive().catch(() => ({
    fixtures: [],
    hasLive: false,
    cachedAt: new Date().toISOString(),
  }))

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh' }}>
      <WorldcupHero locale={locale} />

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">

        {/* Live — Client Component with auto-polling */}
        <section aria-labelledby="wc-live-title">
          <h2
            id="wc-live-title"
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('sports.live')}
          </h2>
          <WorldcupLiveSection initialData={initialLiveData} />
        </section>

        {/* Calendar — async Server Component, independent Suspense boundary */}
        <section aria-labelledby="wc-fixtures-title">
          <h2
            id="wc-fixtures-title"
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('sports.worldcup.fixtures')}
          </h2>
          <Suspense fallback={<SectionSkeleton rows={4} />}>
            <WorldcupFixturesSection locale={locale} />
          </Suspense>
        </section>

        {/* Group standings */}
        <section aria-labelledby="wc-standings-title">
          <h2
            id="wc-standings-title"
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('sports.worldcup.standings')}
          </h2>
          <Suspense fallback={<SectionSkeleton rows={3} />}>
            <WorldcupGroupStandingsGrid locale={locale} />
          </Suspense>
        </section>

        {/* Teams */}
        <section aria-labelledby="wc-teams-title">
          <h2
            id="wc-teams-title"
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('sports.worldcup.teams')}
          </h2>
          <Suspense
            fallback={
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-[var(--lt-radius-md)] animate-pulse"
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
