import { Suspense, type ReactNode } from 'react'
import { getServerLocale } from '@/lib/i18n-server'
import { translate } from '@/lib/i18n'
import { getWorldcupLive } from '@/lib/sports/worldcup/service'
import WorldcupHero from './components/WorldcupHero'
import WorldcupLiveSection from './components/WorldcupLiveSection'
import WorldcupFixturesSection from './components/WorldcupFixturesSection'
import WorldcupBracket from './components/WorldcupBracket'
import WorldcupTeamsGrid from './components/WorldcupTeamsGrid'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="lh-skeleton" style={{ height: 64, borderRadius: 14 }} />
      ))}
    </div>
  )
}

function SectionTitle({ id, title, badge }: { id: string; title: string; badge?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div aria-hidden="true" className="flex-none" style={{ width: 4, height: 26, borderRadius: 99, background: 'var(--lh-green)' }} />
      <h2 id={id} style={{ fontFamily: 'var(--lh-font)', fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>
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
      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1"
      style={{ background: 'var(--lh-terra)', color: '#fff', borderRadius: 99 }}
    >
      <span className="animate-pulse leading-none">●</span>
      EN VIVO
    </span>
  ) : undefined

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100dvh', fontFamily: 'var(--lh-font)' }}>
      <WorldcupHero locale={locale} />

      <main className="lh-container" style={{ maxWidth: 980, paddingTop: 40, paddingBottom: 56, display: 'flex', flexDirection: 'column', gap: 56 }}>

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

        <section aria-labelledby="wc-bracket-title">
          <SectionTitle id="wc-bracket-title" title={t('sports.worldcup.bracket')} />
          <Suspense fallback={<SectionSkeleton rows={3} />}>
            <WorldcupBracket locale={locale} />
          </Suspense>
        </section>

        <section aria-labelledby="wc-teams-title">
          <SectionTitle id="wc-teams-title" title={t('sports.worldcup.teams')} />
          <Suspense
            fallback={
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="lh-skeleton" style={{ height: 96, borderRadius: 16 }} />
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
