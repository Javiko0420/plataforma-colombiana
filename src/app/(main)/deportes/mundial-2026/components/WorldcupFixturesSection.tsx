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

function StatusPill({ status }: { status: WorldCupFixture['status'] }) {
  const { short, elapsed } = status

  if (LIVE_STATUSES.has(short)) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
        style={{
          background: 'var(--lt-terracota)',
          color: 'var(--lt-paper)',
          fontFamily: 'var(--lt-font-sans)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span className="animate-pulse leading-none" aria-hidden="true">●</span>
        {elapsed != null ? `${elapsed}'` : short}
      </span>
    )
  }

  if (HALFTIME_STATUSES.has(short)) {
    return (
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
        style={{
          background: 'var(--lt-sun)',
          color: 'var(--lt-ink)',
          fontFamily: 'var(--lt-font-sans)',
        }}
      >
        HT
      </span>
    )
  }

  if (FINISHED_STATUSES.has(short)) {
    return (
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
        style={{
          background: 'var(--lt-verde)',
          color: 'var(--lt-paper)',
          fontFamily: 'var(--lt-font-sans)',
        }}
      >
        FT
      </span>
    )
  }

  if (DISRUPTED_STATUSES.has(short)) {
    return (
      <span
        className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
        style={{
          background: 'var(--lt-accent)',
          color: 'var(--lt-paper)',
          fontFamily: 'var(--lt-font-sans)',
        }}
      >
        {short}
      </span>
    )
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
      <p
        className="text-sm py-1 pl-3 border-l-2"
        style={{
          color: 'var(--lt-ink-soft)',
          fontFamily: 'var(--lt-font-sans)',
          borderColor: 'var(--lt-ink-soft)',
          opacity: 0.65,
        }}
      >
        {t('sports.worldcup.empty.fixtures')}
      </p>
    )
  }

  if (fixtures.length === 0) {
    return (
      <p
        className="text-sm py-1 pl-3 border-l-2"
        style={{
          color: 'var(--lt-ink-soft)',
          fontFamily: 'var(--lt-font-sans)',
          borderColor: 'var(--lt-ink-soft)',
          opacity: 0.65,
        }}
      >
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
          <div className="flex items-center gap-3 mb-3" aria-hidden="false">
            <div
              className="h-px flex-1"
              style={{ background: 'var(--lt-ink)', opacity: 0.12 }}
              aria-hidden="true"
            />
            <h3
              className="text-xs font-bold uppercase tracking-widest shrink-0"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
            >
              {round}
            </h3>
            <div
              className="h-px flex-1"
              style={{ background: 'var(--lt-ink)', opacity: 0.12 }}
              aria-hidden="true"
            />
          </div>

          <ul className="space-y-2">
            {roundFixtures
              .slice()
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((fx) => {
                const isFinished = FINISHED_STATUSES.has(fx.status.short)
                const isLive = LIVE_STATUSES.has(fx.status.short)
                return (
                  <li
                    key={fx.id}
                    className="rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] p-3 transition-all hover:-translate-y-0.5"
                    style={{
                      background: 'var(--lt-paper)',
                      boxShadow: 'var(--lt-shadow-sticker)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div
                        className="text-xs leading-tight"
                        style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
                      >
                        {fx.venue.name ? `${fx.venue.name} · ` : ''}
                        {formatMatchDate(fx.date, locale)}
                      </div>
                      <StatusPill status={fx.status} />
                    </div>
                    <div
                      className="flex items-center justify-between font-bold text-sm"
                      style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                    >
                      <span className="flex-1 text-right pr-2 leading-tight">
                        {fx.teams.home.name}
                      </span>
                      <span
                        className="px-3 py-1 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0"
                        style={{
                          background: isFinished
                            ? 'var(--lt-ink)'
                            : isLive
                              ? 'var(--lt-terracota)'
                              : 'var(--lt-bg)',
                          color:
                            isFinished || isLive ? 'var(--lt-paper)' : 'var(--lt-ink-soft)',
                          boxShadow: '2px 2px 0 var(--lt-ink)',
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {fx.goals.home ?? '–'} : {fx.goals.away ?? '–'}
                      </span>
                      <span className="flex-1 pl-2 leading-tight">{fx.teams.away.name}</span>
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
