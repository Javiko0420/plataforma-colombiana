import { Suspense } from 'react'
import { fetchFixtures, fetchStandings, resolveSeasonForLeague, fetchTeamNextMatches, fetchTeamLastMatches, searchTeams } from '@/lib/football'
import { getServerLocale } from '@/lib/i18n-server'
import { translate } from '@/lib/i18n'
import { translateText, type SupportedLang } from '@/lib/translation'
import SportsFilters from './filters'
import { SunMotif } from '@/components/lt/SunMotif'
import { LeafSprig } from '@/components/lt/LeafSprig'
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline'
import { Squiggle } from '@/components/lt/Squiggle'
import { LtBadge } from '@/components/lt/Badge'

async function LiveFixtures({ t, date, leagueId, liveOnly, locale }: { t: (k: string) => string; date: string; leagueId?: number; liveOnly?: boolean; locale: 'es' | 'en' }) {
  // For live mode we ask the provider directly; otherwise we fetch by date
  // (league + date requires `season` per API-Football specs).
  const params: { date?: string; league?: number; season?: number; live?: 'all' } = {}
  if (liveOnly) {
    params.live = 'all'
  } else {
    params.date = date
  }
  if (typeof leagueId === 'number' && Number.isFinite(leagueId) && leagueId > 0) {
    params.league = leagueId
    params.season = await resolveSeasonForLeague(leagueId)
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
      // Fallback silently
    }
  }

  if (filtered.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
        {t('sports.empty.live')}
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {filtered.map((fx, idx) => (
        <li
          key={fx.id}
          className="rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] p-3 transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
        >
          <div className="text-xs mb-1.5" style={{ color: 'var(--lt-ink-soft)' }}>
            {translatedLeagueNames[idx] || fx.league.name}
          </div>
          <div
            className="flex items-center justify-between text-base font-bold"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            <span>{fx.home.name}</span>
            <span
              className="px-3 py-1 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-sm"
              style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
            >
              {fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}
            </span>
            <span>{fx.away.name}</span>
          </div>
          <div className="text-xs mt-1.5" style={{ color: 'var(--lt-ink-soft)' }}>
            {translatedStatuses[idx] || fx.status}{fx.elapsed != null ? ` ${fx.elapsed}'` : ''}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default async function SportsPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const locale = await getServerLocale()
  const t = (k: string) => translate(k, { locale })
  const sp = (await searchParams) || {}
  const dateParam = typeof sp.date === 'string' ? sp.date : new Date().toISOString().slice(0, 10)
  const liveParam = typeof sp.live === 'string' && (sp.live === 'all' || sp.live === '1' || sp.live === '0') ? (sp.live as 'all' | '1' | '0') : null
  let teamParam = typeof sp.team === 'string' && /^\d+$/.test(sp.team) ? Number(sp.team) : undefined
  const teamNameParam = typeof sp.teamName === 'string' ? sp.teamName.trim() : ''
  if (!teamParam && teamNameParam.length >= 2) {
    const matches = await searchTeams(teamNameParam)
    const exact = matches.find((t) => t.name.toLowerCase() === teamNameParam.toLowerCase())
    const first = matches[0]
    teamParam = (exact || first)?.id
  }

  const leagueDefs = [
    // Latinoamérica (prioridad)
    { alias: 'colombia',     env: 'LEAGUE_COLOMBIA_ID',     key: 'sports.league.co' },
    { alias: 'argentina',    env: 'LEAGUE_ARGENTINA_ID',    key: 'sports.league.ar' },
    { alias: 'brazil',       env: 'LEAGUE_BRAZIL_ID',       key: 'sports.league.br' },
    { alias: 'mexico',       env: 'LEAGUE_MEXICO_ID',       key: 'sports.league.mx' },
    { alias: 'chile',        env: 'LEAGUE_CHILE_ID',        key: 'sports.league.cl' },
    { alias: 'uruguay',      env: 'LEAGUE_URUGUAY_ID',      key: 'sports.league.uy' },
    { alias: 'peru',         env: 'LEAGUE_PERU_ID',         key: 'sports.league.pe' },
    { alias: 'ecuador',      env: 'LEAGUE_ECUADOR_ID',      key: 'sports.league.ec' },
    { alias: 'paraguay',     env: 'LEAGUE_PARAGUAY_ID',     key: 'sports.league.py' },
    { alias: 'libertadores', env: 'LEAGUE_LIBERTADORES_ID', key: 'sports.league.libertadores' },
    { alias: 'sudamericana', env: 'LEAGUE_SUDAMERICANA_ID', key: 'sports.league.sudamericana' },
    // Europa
    { alias: 'spain',    env: 'LEAGUE_SPAIN_ID',    key: 'sports.league.es' },
    { alias: 'england',  env: 'LEAGUE_ENGLAND_ID',  key: 'sports.league.en' },
    { alias: 'italy',    env: 'LEAGUE_ITALY_ID',    key: 'sports.league.it' },
    { alias: 'germany',  env: 'LEAGUE_GERMANY_ID',  key: 'sports.league.de' },
    { alias: 'france',   env: 'LEAGUE_FRANCE_ID',   key: 'sports.league.fr' },
    { alias: 'ucl',      env: 'LEAGUE_CHAMPIONS_ID', key: 'sports.league.ucl' },
    { alias: 'europa',   env: 'LEAGUE_EUROPA_ID',   key: 'sports.league.uel' },
  ] as const

  const leagueAll = leagueDefs.map(def => ({
    alias: def.alias,
    id: Number(process.env[def.env as keyof NodeJS.ProcessEnv] || 0),
    name: t(def.key),
  }))
  const activeLeagues = leagueAll.filter(l => Number.isFinite(l.id) && l.id > 0)

  const data = []
  for (let i = 0; i < activeLeagues.length; i += 2) {
    const batch = activeLeagues.slice(i, i + 2)
    const batchResults = await Promise.all(
      batch.map(async (lg) => {
        const idOk = Number.isFinite(lg.id) && lg.id > 0
        const season = await resolveSeasonForLeague(lg.id)
        try {
          const [table, dayFx] = await Promise.all([
            idOk ? fetchStandings(lg.id, season).catch(() => []) : Promise.resolve([]),
            idOk
              ? fetchFixtures({ league: lg.id, season, date: dateParam, team: teamParam }).catch(() => [])
              : Promise.resolve([]),
          ])
          return { league: lg, table, dayFx }
        } catch (error) {
          console.error(`Error loading league ${lg.name}:`, error)
          return { league: lg, table: [], dayFx: [] }
        }
      })
    )
    data.push(...batchResults)
    if (i + 2 < activeLeagues.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  const [teamNext, teamLast] = teamParam
    ? await Promise.all([
        fetchTeamNextMatches(teamParam).catch(() => []),
        fetchTeamLastMatches(teamParam).catch(() => []),
      ])
    : [[], []]

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden border-b-[2px] border-[var(--lt-ink)] py-14 px-4"
        style={{ background: 'var(--lt-paper)' }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <SunMotif size={280} className="absolute opacity-[0.07]" style={{ top: '-40px', right: '-20px' }} />
          <LeafSprig size={90} className="absolute opacity-20" style={{ bottom: '8px', left: '12px', transform: 'rotate(-18deg)' }} />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <h1
            className="text-3xl md:text-4xl font-black mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('sports.title')}
          </h1>
          <HandDrawnUnderline width={160} color="var(--lt-sun-core)" thickness={2.5} className="mb-3" aria-hidden="true" />
          <p className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
            {t('sports.subtitle')}
          </p>
          <SportsFilters defaultTeamId={teamParam} defaultLiveChecked={liveParam ? liveParam === 'all' : true} />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">

        {/* En vivo */}
        <section aria-labelledby="live-title">
          <h2
            id="live-title"
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('sports.live')}
          </h2>
          <Suspense
            fallback={
              <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>{t('sports.loading')}</p>
            }
          >
            {(() => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('app:media:request-pause')); return null })()}
            <LiveFixtures
              t={t}
              date={dateParam}
              liveOnly={liveParam ? liveParam === 'all' : true}
              locale={locale}
            />
          </Suspense>
        </section>

        {/* Partidos del equipo filtrado */}
        {teamParam ? (
          <section aria-label="Partidos del equipo seleccionado">
            <div className="grid gap-8 md:grid-cols-2">
              {[
                { label: t('sports.team.next'), matches: teamNext, showScore: false },
                { label: t('sports.team.last'), matches: teamLast, showScore: true },
              ].map(({ label, matches, showScore }) => (
                <div key={label}>
                  <h3
                    className="font-bold mb-3 text-lg"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    {label}
                  </h3>
                  {matches.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>{t('sports.empty.today')}</p>
                  ) : (
                    <ul className="space-y-3">
                      {matches.map((fx) => (
                        <li
                          key={fx.id}
                          className="rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] p-3"
                          style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                        >
                          <div className="text-xs mb-1" style={{ color: 'var(--lt-ink-soft)' }}>{fx.league.name}</div>
                          <div className="flex items-center justify-between font-bold text-sm" style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}>
                            <span>{fx.home.name}</span>
                            <span className="px-2 py-0.5 rounded border border-[var(--lt-ink)] text-xs" style={{ background: 'var(--lt-bg)' }}>
                              {showScore ? `${fx.goals?.home ?? '-'} : ${fx.goals?.away ?? '-'}` : 'vs'}
                            </span>
                            <span>{fx.away.name}</span>
                          </div>
                          <div className="text-xs mt-1" style={{ color: 'var(--lt-ink-soft)' }}>
                            {showScore
                              ? (fx as { status?: string }).status
                              : new Date((fx as { dateIso: string }).dateIso).toLocaleString(
                                  locale === 'es' ? 'es-CO' : 'en-US',
                                  { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }
                                )
                            }
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Partidos del día por liga */}
        <section aria-labelledby="fixtures-title">
          <h2
            id="fixtures-title"
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Partidos del día
          </h2>
          <div className="space-y-8">
            {data.map(({ league, dayFx }) => (
              <div key={league.id}>
                <div className="flex items-center gap-3 mb-3">
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    {league.name}
                  </h3>
                  <LtBadge tone="neutral" rotate={-0.8}>{dayFx.length} partidos</LtBadge>
                </div>
                {dayFx.length === 0 ? (
                  <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>{t('sports.empty.today')}</p>
                ) : (
                  <ul className="space-y-2">
                    {dayFx.map((fx) => (
                      <li
                        key={fx.id}
                        className="rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] p-3 transition-all hover:-translate-y-0.5"
                        style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                      >
                        <div className="flex items-center justify-between font-bold text-sm" style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}>
                          <span className="flex-1 text-right pr-2">{fx.home.name}</span>
                          <span
                            className="px-3 py-1 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0 text-sm"
                            style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
                          >
                            {fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}
                          </span>
                          <span className="flex-1 pl-2">{fx.away.name}</span>
                        </div>
                        <div className="text-xs text-center mt-1" style={{ color: 'var(--lt-ink-soft)' }}>
                          {new Date(fx.dateIso).toLocaleTimeString(locale === 'es' ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tablas de posiciones */}
        <section aria-labelledby="standings-title">
          <h2
            id="standings-title"
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Tablas de Posiciones
          </h2>
          <div className="flex justify-center mb-6" aria-hidden="true">
            <Squiggle width={160} color="var(--lt-terracota)" amplitude={4} />
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {data.map(({ league, table }) => (
              <div
                key={league.id}
                className="rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)] overflow-hidden"
                style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
              >
                <div
                  className="p-3 border-b-[2px] border-[var(--lt-ink)] font-bold text-sm"
                  style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)', fontFamily: 'var(--lt-font-serif)' }}
                >
                  {league.name}
                </div>
                {table.length === 0 ? (
                  <p className="p-4 text-sm" style={{ color: 'var(--lt-ink-soft)' }}>{t('sports.empty.standings')}</p>
                ) : (
                  <div className="p-3">
                    <div
                      className="grid grid-cols-6 text-xs mb-2 font-bold"
                      style={{ color: 'var(--lt-ink-soft)' }}
                    >
                      <div>#</div>
                      <div className="col-span-2">{t('sports.team')}</div>
                      <div>{t('sports.played')}</div>
                      <div>{t('sports.points')}</div>
                      <div>+/-</div>
                    </div>
                    <ul className="space-y-1">
                      {table.slice(0, 10).map((row, i) => (
                        <li
                          key={row.team.id}
                          className="grid grid-cols-6 text-sm py-1 rounded-sm"
                          style={{
                            background: i % 2 === 0 ? 'transparent' : 'var(--lt-bg)',
                            color: 'var(--lt-ink)',
                            fontFamily: 'var(--lt-font-sans)',
                          }}
                        >
                          <div className="font-bold" style={{ color: 'var(--lt-ink-soft)' }}>{row.rank}</div>
                          <div className="col-span-2 truncate font-medium">{row.team.name}</div>
                          <div>{row.played}</div>
                          <div className="font-bold">{row.points}</div>
                          <div style={{ color: row.goalsDiff > 0 ? 'var(--lt-verde)' : row.goalsDiff < 0 ? 'var(--lt-terracota)' : 'var(--lt-ink-soft)' }}>
                            {row.goalsDiff > 0 ? '+' : ''}{row.goalsDiff}
                          </div>
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
    </div>
  )
}
