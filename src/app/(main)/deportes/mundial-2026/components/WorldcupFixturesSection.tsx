import { getWorldcupFixtures } from '@/lib/sports/worldcup/service'
import { translate } from '@/lib/i18n'
import type { WorldCupFixture } from '@/lib/sports/worldcup/types'

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

export default async function WorldcupFixturesSection({ locale }: { locale: 'es' | 'en' }) {
  const t = (k: string) => translate(k, { locale })

  let fixtures: WorldCupFixture[] = []
  try {
    const data = await getWorldcupFixtures()
    fixtures = data.fixtures
  } catch {
    return (
      <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
        {t('sports.worldcup.empty.fixtures')}
      </p>
    )
  }

  if (fixtures.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
        {t('sports.worldcup.empty.fixtures')}
      </p>
    )
  }

  const grouped = groupByRound(fixtures)

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([round, roundFixtures]) => (
        <div key={round}>
          <h3
            className="font-bold text-lg mb-3"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {round}
          </h3>
          <ul className="space-y-2">
            {roundFixtures
              .slice()
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((fx) => (
                <li
                  key={fx.id}
                  className="rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] p-3 transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                >
                  <div className="text-xs mb-1" style={{ color: 'var(--lt-ink-soft)' }}>
                    {fx.venue.name ? `${fx.venue.name} · ` : ''}
                    {formatMatchDate(fx.date, locale)}
                  </div>
                  <div
                    className="flex items-center justify-between font-bold text-sm"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    <span className="flex-1 text-right pr-2">{fx.teams.home.name}</span>
                    <span
                      className="px-3 py-1 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0 text-sm"
                      style={{
                        background: 'var(--lt-terracota)',
                        color: 'var(--lt-paper)',
                        boxShadow: '2px 2px 0 var(--lt-ink)',
                      }}
                    >
                      {fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}
                    </span>
                    <span className="flex-1 pl-2">{fx.teams.away.name}</span>
                  </div>
                  <div
                    className="text-xs text-center mt-1"
                    style={{ color: 'var(--lt-ink-soft)' }}
                  >
                    {fx.status.long}
                    {fx.status.elapsed != null ? ` ${fx.status.elapsed}'` : ''}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
