import { Suspense } from 'react'
import { fetchFixtures, fetchStandings, getDefaultSeason, fetchTeamNextMatches, fetchTeamLastMatches, searchTeams } from '@/lib/sports'
import { getServerLocale } from '@/lib/i18n-server'
import { translate } from '@/lib/i18n'
import { translateText, type SupportedLang } from '@/lib/translation'
import SportsFilters from './filters'

async function LiveFixtures({ t, date, leagueId, liveOnly, locale }: { t: (k: string) => string; date: string; leagueId?: number; liveOnly?: boolean; locale: 'es' | 'en' }) {
  const params: { date: string; league?: number } = { date }
  if (typeof leagueId === 'number' && Number.isFinite(leagueId) && leagueId > 0) {
    params.league = leagueId
  }
  const fixtures = await fetchFixtures(params)
  const filtered = liveOnly
    ? fixtures.filter((fx) => {
        const s = (fx.status || '').toLowerCase()
        const finished = s.includes('finished') || s === 'ft'
        const notStarted = s.includes('not started') || s === 'ns'
        const live = s.includes('live') || s.includes('in play') || s.includes('playing') || s.includes('1h') || s.includes('2h') || s.includes('ht')
        return !finished && !notStarted && live
      })
    : fixtures

  // Translate league names and status for Live only (skip team cards per request)
  let translatedLeagueNames = filtered.map((f) => f.league.name || '')
  let translatedStatuses = filtered.map((f) => f.status || '')
  const target: SupportedLang | null = locale === 'es' ? 'ES' : null
  if (target && filtered.length > 0) {
    try {
      const [names, stats] = await Promise.all([
        translateText(translatedLeagueNames, target) as Promise<string[]>,
        translateText(translatedStatuses, target) as Promise<string[]>,
      ])
      translatedLeagueNames = names
      translatedStatuses = stats
    } catch {
      // Fallback silently if translation is not configured or fails
    }
  }
  if (filtered.length === 0) {
    return <p className="text-foreground/70">{t('sports.empty.live')}</p>
  }
  return (
    <ul className="space-y-3">
      {filtered.map((fx, idx) => (
        <li key={fx.id} className="border border-border rounded-lg p-3">
          <div className="text-sm text-foreground/70">{translatedLeagueNames[idx] || fx.league.name}</div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>{fx.home.name}</span>
            <span>{fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}</span>
            <span>{fx.away.name}</span>
          </div>
          <div className="text-xs text-foreground/60">{translatedStatuses[idx] || fx.status}{fx.elapsed != null ? ` ${fx.elapsed}'` : ''}</div>
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
  const dateParam = typeof sp.date === 'string' ? sp.date : new Date().toISOString().slice(0, 10)
  const liveParam = typeof sp.live === 'string' && (sp.live === 'all' || sp.live === '1' || sp.live === '0') ? (sp.live as 'all' | '1' | '0') : null
  let teamParam = typeof sp.team === 'string' && /^\d+$/.test(sp.team) ? Number(sp.team) : undefined
  const teamNameParam = typeof sp.teamName === 'string' ? sp.teamName.trim() : ''
  // Resolve by name if id not provided but name is present
  if (!teamParam && teamNameParam.length >= 2) {
    const matches = await searchTeams(teamNameParam)
    const exact = matches.find((t) => t.name.toLowerCase() === teamNameParam.toLowerCase())
    const first = matches[0]
    teamParam = (exact || first)?.id
  }
  const leagueDefs = [
    { alias: 'colombia', env: 'LEAGUE_COLOMBIA_ID', key: 'sports.league.co' },
    { alias: 'spain', env: 'LEAGUE_SPAIN_ID', key: 'sports.league.es' },
    { alias: 'england', env: 'LEAGUE_ENGLAND_ID', key: 'sports.league.en' },
    { alias: 'italy', env: 'LEAGUE_ITALY_ID', key: 'sports.league.it' },
    { alias: 'france', env: 'LEAGUE_FRANCE_ID', key: 'sports.league.fr' },
    { alias: 'germany', env: 'LEAGUE_GERMANY_ID', key: 'sports.league.de' },
    { alias: 'ucl', env: 'LEAGUE_CHAMPIONS_ID', key: 'sports.league.ucl' },
    { alias: 'europa', env: 'LEAGUE_EUROPA_ID', key: 'sports.league.uel' },
  ] as const

  // Build all leagues with names (always show in dropdown)
  const leagueAll = leagueDefs
    .map(def => ({ alias: def.alias, id: Number(process.env[def.env as keyof NodeJS.ProcessEnv] || 0), name: t(def.key) }))
  // Determine which leagues to fetch
  const activeLeagues = leagueAll.filter(l => Number.isFinite(l.id) && l.id > 0)

  // Limitar llamadas simultáneas para evitar rate limiting
  // Procesar ligas en lotes de 2 para reducir carga en la API
  const data = []
  for (let i = 0; i < activeLeagues.length; i += 2) {
    const batch = activeLeagues.slice(i, i + 2)
    const batchResults = await Promise.all(
      batch.map(async (lg) => {
        const idOk = Number.isFinite(lg.id) && lg.id > 0
        try {
          const [table, dayFx] = await Promise.all([
            idOk ? fetchStandings(lg.id, season).catch(() => []) : Promise.resolve([]),
            idOk ? fetchFixtures({ league: lg.id, date: dateParam, team: teamParam }).catch(() => []) : Promise.resolve([]),
          ])
          return { league: lg, table, dayFx }
        } catch (error) {
          console.error(`Error loading league ${lg.name}:`, error)
          return { league: lg, table: [], dayFx: [] }
        }
      })
    )
    data.push(...batchResults)
    // Pequeña pausa entre lotes para evitar rate limiting
    if (i + 2 < activeLeagues.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Team next/last when team filter present
  const [teamNext, teamLast] = teamParam
    ? await Promise.all([
        fetchTeamNextMatches(teamParam).catch(() => []),
        fetchTeamLastMatches(teamParam).catch(() => []),
      ])
    : [[], []]

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <section>
        <h1 className="text-3xl font-bold mb-2">{t('sports.title')}</h1>
        <p className="text-foreground/70">{t('sports.subtitle')}</p>
        <SportsFilters defaultTeamId={teamParam} defaultLiveChecked={liveParam ? liveParam === 'all' : true} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t('sports.live')}</h2>
        <Suspense fallback={<p>{t('sports.loading')}</p>}>
          {/* When entering this section we request other media to pause (e.g., radio) */}
          {(() => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('app:media:request-pause')); return null })()}
          <LiveFixtures
            t={t}
            date={dateParam}
            liveOnly={liveParam ? liveParam === 'all' : true}
            locale={locale}
          />
        </Suspense>
      </section>

      {teamParam ? (
        <section className="space-y-4">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="font-semibold mb-2">{t('sports.team.next')}</div>
              {teamNext.length === 0 ? (
                <p className="text-foreground/70">{t('sports.empty.today')}</p>
              ) : (
                <ul className="space-y-3">
                  {teamNext.map((fx) => (
                    <li key={fx.id} className="border border-border rounded-lg p-3">
                      <div className="text-sm text-foreground/70">{fx.league.name}</div>
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>{fx.home.name}</span>
                        <span>vs</span>
                        <span>{fx.away.name}</span>
                      </div>
                      <div className="text-xs text-foreground/60">{new Date(fx.dateIso).toLocaleString(locale === 'es' ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <div className="font-semibold mb-2">{t('sports.team.last')}</div>
              {teamLast.length === 0 ? (
                <p className="text-foreground/70">{t('sports.empty.today')}</p>
              ) : (
                <ul className="space-y-3">
                  {teamLast.map((fx) => (
                    <li key={fx.id} className="border border-border rounded-lg p-3">
                      <div className="text-sm text-foreground/70">{fx.league.name}</div>
                      <div className="flex items-center justify-between text-lg font-semibold">
                        <span>{fx.home.name}</span>
                        <span>{fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}</span>
                        <span>{fx.away.name}</span>
                      </div>
                      <div className="text-xs text-foreground/60">{fx.status}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
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

