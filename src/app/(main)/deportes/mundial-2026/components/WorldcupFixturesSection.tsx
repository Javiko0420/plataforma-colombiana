import { getWorldcupFixtures } from '@/lib/sports/worldcup/service'
import { translate } from '@/lib/i18n'
import type { WorldCupFixture } from '@/lib/sports/worldcup/types'

const LIVE_STATUSES = new Set(['LIVE', '1H', '2H', 'ET', 'P', 'BT', 'INT'])
const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])
const HALFTIME_STATUSES = new Set(['HT', 'BT'])
const DISRUPTED_STATUSES = new Set(['SUSP', 'PST', 'CANC', 'ABD', 'AWD', 'WO'])

function groupByRound(fixtures: WorldCupFixture[]): Map<string, WorldCupFixture[]> {
  const map = new Map<string, WorldCupFixture[]>()
  for (const fx of fixtures) {
    const bucket = map.get(fx.round)
    if (bucket) bucket.push(fx)
    else map.set(fx.round, [fx])
  }
  return map
}

function formatMatchDate(isoDate: string, locale: 'es' | 'en'): string {
  return new Date(isoDate).toLocaleString(locale === 'es' ? 'es-CO' : 'en-AU', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const pillBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  fontSize: 11, fontWeight: 700, padding: '4px 9px', borderRadius: 99, flexShrink: 0,
  fontVariantNumeric: 'tabular-nums',
}
const tint = (v: string) => `color-mix(in oklch, ${v} 15%, transparent)`

function StatusPill({ status }: { status: WorldCupFixture['status'] }) {
  const { short, elapsed } = status

  if (LIVE_STATUSES.has(short)) {
    return (
      <span style={{ ...pillBase, background: 'var(--lh-terra)', color: '#fff' }}>
        <span className="animate-pulse leading-none" aria-hidden="true">●</span>
        {elapsed != null ? `${elapsed}'` : short}
      </span>
    )
  }

  if (HALFTIME_STATUSES.has(short)) {
    return <span style={{ ...pillBase, background: tint('var(--lh-warm)'), color: 'var(--lh-warm)' }}>HT</span>
  }

  if (FINISHED_STATUSES.has(short)) {
    return <span style={{ ...pillBase, background: tint('var(--lh-green)'), color: 'var(--lh-green)' }}>FT</span>
  }

  if (DISRUPTED_STATUSES.has(short)) {
    return <span style={{ ...pillBase, background: tint('var(--lh-accent)'), color: 'var(--lh-accent)' }}>{short}</span>
  }

  return null
}

export default async function WorldcupFixturesSection({ locale }: { locale: 'es' | 'en' }) {
  const t = (k: string) => translate(k, { locale })

  let fixtures: WorldCupFixture[] = []
  try {
    const data = await getWorldcupFixtures()
    fixtures = data.fixtures
  } catch {
    return (
      <p className="text-sm py-1 pl-3" style={{ color: 'var(--lh-fg3)', borderLeft: '2px solid var(--lh-border)' }}>
        {t('sports.worldcup.empty.fixtures')}
      </p>
    )
  }

  if (fixtures.length === 0) {
    return (
      <p className="text-sm py-1 pl-3" style={{ color: 'var(--lh-fg3)', borderLeft: '2px solid var(--lh-border)' }}>
        {t('sports.worldcup.empty.fixtures')}
      </p>
    )
  }

  const grouped = groupByRound(fixtures)

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([round, roundFixtures]) => (
        <div key={round}>
          {/* Round header with centered rule */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1" style={{ background: 'var(--lh-border)' }} aria-hidden="true" />
            <h3 className="shrink-0" style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--lh-fg3)' }}>
              {round}
            </h3>
            <div className="h-px flex-1" style={{ background: 'var(--lh-border)' }} aria-hidden="true" />
          </div>

          <ul className="space-y-2">
            {roundFixtures
              .slice()
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((fx) => {
                const isFinished = FINISHED_STATUSES.has(fx.status.short)
                const isLive = LIVE_STATUSES.has(fx.status.short)
                const scoreBg = isLive ? 'var(--lh-terra)' : isFinished ? 'var(--lh-fg)' : 'var(--lh-surface2)'
                const scoreColor = isLive || isFinished ? '#fff' : 'var(--lh-fg2)'
                return (
                  <li key={fx.id} className="lh-card" style={{ padding: 14 }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div style={{ fontSize: 12, lineHeight: 1.3, color: 'var(--lh-fg3)' }}>
                        {fx.venue.name ? `${fx.venue.name} · ` : ''}
                        {formatMatchDate(fx.date, locale)}
                      </div>
                      <StatusPill status={fx.status} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontWeight: 600, fontSize: 14, color: 'var(--lh-fg)' }}>
                      <span style={{ flex: 1, textAlign: 'right', lineHeight: 1.2 }}>{fx.teams.home.name}</span>
                      <span
                        className="shrink-0"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 54, padding: '5px 11px', borderRadius: 10, background: scoreBg, color: scoreColor, fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}
                      >
                        {fx.goals.home ?? '–'} : {fx.goals.away ?? '–'}
                      </span>
                      <span style={{ flex: 1, lineHeight: 1.2 }}>{fx.teams.away.name}</span>
                    </div>
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </div>
  )
}
