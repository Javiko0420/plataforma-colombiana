import { Suspense } from 'react'
import { fetchFixtures, fetchStandings, getDefaultSeason } from '@/lib/sports'
import { LEAGUES } from '@/lib/leagues'
import { getServerLocale } from '@/lib/i18n-server'
import { translate } from '@/lib/i18n'

async function LiveFixtures({ t }: { t: (k: string) => string }) {
  // tz no longer needed for TheSportsDB client
  const fixtures = await fetchFixtures({})
  if (fixtures.length === 0) {
    return <p className="text-foreground/70">{t('sports.empty.live')}</p>
  }
  return (
    <ul className="space-y-3">
      {fixtures.map((fx) => (
        <li key={fx.id} className="border border-border rounded-lg p-3">
          <div className="text-sm text-foreground/70">{fx.league.name}</div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>{fx.home.name}</span>
            <span>{fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}</span>
            <span>{fx.away.name}</span>
          </div>
          <div className="text-xs text-foreground/60">{fx.status}{fx.elapsed != null ? ` ${fx.elapsed}'` : ''}</div>
        </li>
      ))}
    </ul>
  )
}

export default async function SportsPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const locale = await getServerLocale()
  const t = (k: string) => translate(k, { locale })
  const season = getDefaultSeason()
  // const tz = process.env.SPORTS_DEFAULT_TIMEZONE || 'America/Bogota'
  const sp = searchParams || {}
  const searchLeague = typeof sp.league === 'string' ? sp.league : ''
  const includeList = Array.isArray(sp.include)
    ? (sp.include as string[]).map((s) => s.toLowerCase())
    : (typeof sp.include === 'string'
        ? (sp.include as string).split(',').map((s) => s.trim().toLowerCase())
        : ['results', 'standings'])
  const includeResults = includeList.includes('results')
  const includeStandings = includeList.includes('standings')
  const dateParam = typeof sp.date === 'string' ? sp.date : new Date().toISOString().slice(0, 10)
  const liveParam = typeof sp.live === 'string' && (sp.live === 'all' || sp.live === '1' || sp.live === '0') ? (sp.live as 'all' | '1' | '0') : null
  const leagueDefs = [
    { alias: 'colombia', id: LEAGUES.COLOMBIA_PRIMERA_A, key: 'sports.league.co' },
    { alias: 'spain', id: LEAGUES.LALIGA, key: 'sports.league.es' },
    { alias: 'england', id: LEAGUES.PREMIER_LEAGUE, key: 'sports.league.en' },
    { alias: 'italy', id: LEAGUES.SERIE_A, key: 'sports.league.it' },
    { alias: 'france', id: LEAGUES.LIGUE_1, key: 'sports.league.fr' },
    { alias: 'germany', id: LEAGUES.BUNDESLIGA, key: 'sports.league.de' },
    { alias: 'ucl', id: LEAGUES.CHAMPIONS_LEAGUE, key: 'sports.league.ucl' },
    { alias: 'europa', id: LEAGUES.EUROPA_LEAGUE, key: 'sports.league.uel' },
  ] as const

  // Build all leagues with names (always show in dropdown)
  const leagueAll = leagueDefs
    .map(def => ({ alias: def.alias, id: def.id, name: t(def.key) }))
  // Options for the select input
  const leagueSelect = leagueAll.map(({ alias, name }) => ({ alias, name }))

  // Determine which leagues to fetch
  const activeLeagues = searchLeague
    ? leagueAll.filter(l => l.alias === searchLeague)
    : leagueAll.filter(l => Number.isFinite(l.id) && l.id > 0)

  const data = await Promise.all(
    activeLeagues.map(async (lg) => {
      const idOk = Number.isFinite(lg.id) && lg.id > 0
      const [table, dayFx] = await Promise.all([
        includeStandings && idOk ? fetchStandings(lg.id, season).catch(() => []) : Promise.resolve([]),
        includeResults && idOk ? fetchFixtures({ league: lg.id, date: dateParam }).catch(() => []) : Promise.resolve([]),
      ])
      return { league: lg, table, dayFx }
    })
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <section>
        <h1 className="text-3xl font-bold mb-2">{t('sports.title')}</h1>
        <p className="text-foreground/70">{t('sports.subtitle')}</p>
        <form action="/deportes" method="GET" className="mt-6 grid gap-3 md:grid-cols-4 items-end">
          <div className="flex flex-col">
            <label htmlFor="league" className="text-sm text-foreground/70">{t('sports.filters.league')}</label>
            <select id="league" name="league" defaultValue={searchLeague} className="border border-border rounded-md px-2 py-2 bg-background">
              <option value="">{locale === 'es' ? 'Todas' : 'All'}</option>
              {leagueSelect.map((l) => (
                <option key={l.alias} value={l.alias}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="date" className="text-sm text-foreground/70">{t('sports.filters.date')}</label>
            <input id="date" name="date" type="date" defaultValue={dateParam} className="border border-border rounded-md px-2 py-2 bg-background" />
          </div>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="include" value="results" defaultChecked={includeResults} /> {t('sports.filters.include.results')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="include" value="standings" defaultChecked={includeStandings} /> {t('sports.filters.include.standings')}
            </label>
          </div>
          <div className="flex gap-3 items-end">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="live" value="all" defaultChecked={liveParam === 'all'} /> {t('sports.filters.live')}
            </label>
            <button type="submit" className="ml-auto px-4 py-2 bg-foreground text-background rounded-md">{t('sports.filters.apply')}</button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t('sports.live')}</h2>
        <Suspense fallback={<p>{t('sports.loading')}</p>}>
          {includeResults ? <LiveFixtures t={t} /> : <p className="text-foreground/70">{t('sports.empty.live')}</p>}
        </Suspense>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t('sports.today')}</h2>
        <div className="space-y-8">
          {data.map(({ league, dayFx }) => (
            <div key={league.id} className="space-y-2">
              <h3 className="text-xl font-semibold">{league.name}</h3>
              {dayFx.length === 0 ? (
                <p className="text-foreground/70">{t('sports.empty.today')}</p>
              ) : (
                <ul className="space-y-3">
                  {dayFx.map((fx) => (
                    <li key={fx.id} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>{fx.home.name}</span>
                        <span>{fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}</span>
                        <span>{fx.away.name}</span>
                      </div>
                      <div className="text-xs text-foreground/60">{new Date(fx.dateIso).toLocaleTimeString(locale === 'es' ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t('sports.standings')}</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {data.map(({ league, table }) => (
            <div key={league.id} className="border border-border rounded-lg">
              <div className="p-3 border-b border-border font-semibold">{league.name}</div>
              {table.length === 0 ? (
                <p className="p-3 text-foreground/70">{t('sports.empty.standings')}</p>
              ) : (
                <div className="p-3">
                  <div className="grid grid-cols-6 text-xs text-foreground/60 mb-2">
                    <div>#</div>
                    <div className="col-span-2">{t('sports.team')}</div>
                    <div>{t('sports.played')}</div>
                    <div>{t('sports.points')}</div>
                    <div>+/-</div>
                  </div>
                  <ul className="space-y-1">
                    {table.slice(0, 10).map((row) => (
                      <li key={row.team.id} className="grid grid-cols-6 text-sm">
                        <div>{row.rank}</div>
                        <div className="col-span-2 truncate">{row.team.name}</div>
                        <div>{row.played}</div>
                        <div>{row.points}</div>
                        <div>{row.goalsDiff}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

