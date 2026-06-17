import { Suspense } from 'react'
import Link from 'next/link'
import { fetchFixtures, resolveSeasonForLeague, fetchTeamNextMatches, fetchTeamLastMatches, searchTeams, loadLeaguesDashboard, inferTeamPrimaryLeague } from '@/lib/football'
import { getServerLocale } from '@/lib/i18n-server'
import { translate } from '@/lib/i18n'
import { translateText, type SupportedLang } from '@/lib/translation'
import { Trophy, ArrowRight } from 'lucide-react'
import SportsFilters from './filters'
import { PageHeader } from '@/components/lh/PageHeader'
import { getDefaultStandingsLeagues, getPlatformLeagueById, mergeStandingsLeagues } from '@/lib/leagues'

// Sports page fans out many API-Football calls; allow enough time on Vercel.
export const maxDuration = 60
export const dynamic = 'force-dynamic'

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

const scoreChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minWidth: 56, padding: '5px 12px', borderRadius: 10,
  background: 'var(--lh-surface2)', border: '1px solid var(--lh-border)',
  fontWeight: 700, fontSize: 14, color: 'var(--lh-fg)',
}

async function LiveFixtures({ t, date, leagueId, liveOnly, locale }: { t: (k: string) => string; date: string; leagueId?: number; liveOnly?: boolean; locale: 'es' | 'en' }) {
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
      <p style={{ fontSize: 14, color: 'var(--lh-fg2)' }}>
        {t('sports.empty.live')}
      </p>
    )
  }

  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {filtered.map((fx, idx) => (
        <li key={fx.id} className="lh-card" style={{ padding: 14 }}>
          <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--lh-fg3)' }}>
            {translatedLeagueNames[idx] || fx.league.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 15, fontWeight: 600, color: 'var(--lh-fg)' }}>
            <span style={{ flex: 1, textAlign: 'right' }}>{fx.home.name}</span>
            <span style={{ ...scoreChip, background: tint('var(--lh-terra)'), borderColor: 'transparent', color: 'var(--lh-terra)' }}>
              {fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}
            </span>
            <span style={{ flex: 1 }}>{fx.away.name}</span>
          </div>
          <div style={{ fontSize: 12, marginTop: 6, textAlign: 'center', color: 'var(--lh-terra)', fontWeight: 600 }}>
            {translatedStatuses[idx] || fx.status}{fx.elapsed != null ? ` ${fx.elapsed}'` : ''}
          </div>
        </li>
      ))}
    </ul>
  )
}

function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} style={{ fontFamily: 'var(--lh-font)', fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', marginBottom: 18 }}>
      {children}
    </h2>
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
    const exact = matches.find((tm) => tm.name.toLowerCase() === teamNameParam.toLowerCase())
    const first = matches[0]
    teamParam = (exact || first)?.id
  }

  const defaultStandingsLeagues = getDefaultStandingsLeagues((k) => t(k))

  const extraStandingsLeagues: Array<{ alias: string; id: number; name: string }> = []
  if (teamParam) {
    const inferred = await inferTeamPrimaryLeague(teamParam)
    if (inferred && !defaultStandingsLeagues.some((lg) => lg.id === inferred.id)) {
      const known = getPlatformLeagueById(inferred.id, (k) => t(k))
      extraStandingsLeagues.push(
        known ?? { alias: `league-${inferred.id}`, id: inferred.id, name: inferred.name }
      )
    }
  }

  const standingsLeagues = mergeStandingsLeagues(defaultStandingsLeagues, extraStandingsLeagues)

  const data = await loadLeaguesDashboard(standingsLeagues, { date: dateParam, team: teamParam })

  const [teamNext, teamLast] = teamParam
    ? await Promise.all([
        fetchTeamNextMatches(teamParam).catch(() => []),
        fetchTeamLastMatches(teamParam).catch(() => []),
      ])
    : [[], []]

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>

      <PageHeader
        eyebrow="Deportes en vivo"
        title={t('sports.title')}
        subtitle={t('sports.subtitle')}
        accent="var(--lh-terra)"
      >
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <Link
            href="/deportes/mundial-2026"
            className="lh-btn lh-btn--sm"
            style={{ background: tint('var(--lh-warm)'), color: 'var(--lh-warm)' }}
          >
            <Trophy size={15} /> {t('sports.worldcup.callout')} <ArrowRight size={14} />
          </Link>
          <div style={{ width: '100%', maxWidth: 720 }}>
            <SportsFilters defaultTeamId={teamParam} defaultLiveChecked={liveParam ? liveParam === 'all' : true} />
          </div>
        </div>
      </PageHeader>

      <main className="lh-container" style={{ maxWidth: 980, paddingTop: 40, paddingBottom: 64, display: 'flex', flexDirection: 'column', gap: 48 }}>

        {/* En vivo */}
        <section aria-labelledby="live-title">
          <SectionTitle id="live-title">{t('sports.live')}</SectionTitle>
          <Suspense fallback={<p style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>{t('sports.loading')}</p>}>
            <LiveFixtures t={t} date={dateParam} liveOnly={liveParam ? liveParam === 'all' : true} locale={locale} />
          </Suspense>
        </section>

        {/* Partidos del equipo filtrado */}
        {teamParam ? (
          <section aria-label="Partidos del equipo seleccionado">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { label: t('sports.team.next'), matches: teamNext, showScore: false },
                { label: t('sports.team.last'), matches: teamLast, showScore: true },
              ].map(({ label, matches, showScore }) => (
                <div key={label}>
                  <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, color: 'var(--lh-fg)', marginBottom: 12 }}>{label}</h3>
                  {matches.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>{t('sports.empty.today')}</p>
                  ) : (
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {matches.map((fx) => (
                        <li key={fx.id} className="lh-card" style={{ padding: 14 }}>
                          <div style={{ fontSize: 12, marginBottom: 4, color: 'var(--lh-fg3)' }}>{fx.league.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontWeight: 600, fontSize: 14, color: 'var(--lh-fg)' }}>
                            <span style={{ flex: 1, textAlign: 'right' }}>{fx.home.name}</span>
                            <span style={scoreChip}>
                              {showScore ? `${fx.goals?.home ?? '-'} : ${fx.goals?.away ?? '-'}` : 'vs'}
                            </span>
                            <span style={{ flex: 1 }}>{fx.away.name}</span>
                          </div>
                          <div style={{ fontSize: 12, marginTop: 6, textAlign: 'center', color: 'var(--lh-fg3)' }}>
                            {showScore
                              ? (fx as { status?: string }).status
                              : new Date((fx as { dateIso: string }).dateIso).toLocaleString(locale === 'es' ? 'es-CO' : 'en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
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
          <SectionTitle id="fixtures-title">Partidos del día</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {data.map(({ league, dayFx }) => (
              <div key={league.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>{league.name}</h3>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--lh-fg2)', background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)', padding: '4px 9px', borderRadius: 99 }}>
                    {dayFx.length} partidos
                  </span>
                </div>
                {dayFx.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>{t('sports.empty.today')}</p>
                ) : (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {dayFx.map((fx) => (
                      <li key={fx.id} className="lh-card" style={{ padding: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, fontWeight: 600, fontSize: 14, color: 'var(--lh-fg)' }}>
                          <span style={{ flex: 1, textAlign: 'right' }}>{fx.home.name}</span>
                          <span style={scoreChip}>{fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}</span>
                          <span style={{ flex: 1 }}>{fx.away.name}</span>
                        </div>
                        <div style={{ fontSize: 12, textAlign: 'center', marginTop: 6, color: 'var(--lh-fg3)' }}>
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
          <SectionTitle id="standings-title">Tablas de posiciones</SectionTitle>
          <div className="grid gap-6 md:grid-cols-2">
            {data.map(({ league, table }) => (
              <div key={league.id} className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--lh-border)', fontFamily: 'var(--lh-font)', fontWeight: 600, fontSize: 14.5, color: 'var(--lh-fg)' }}>
                  {league.name}
                </div>
                {table.length === 0 ? (
                  <p style={{ padding: 16, fontSize: 14, color: 'var(--lh-fg3)' }}>{t('sports.empty.standings')}</p>
                ) : (
                  <div style={{ padding: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '24px 1fr repeat(3, 36px)', fontSize: 11, fontWeight: 600, color: 'var(--lh-fg3)', marginBottom: 8, gap: 4, fontFamily: 'var(--lh-mono)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                      <div>#</div>
                      <div>{t('sports.team')}</div>
                      <div style={{ textAlign: 'center' }}>{t('sports.played')}</div>
                      <div style={{ textAlign: 'center' }}>{t('sports.points')}</div>
                      <div style={{ textAlign: 'center' }}>+/-</div>
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {table.slice(0, 10).map((row) => (
                        <li key={row.team.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr repeat(3, 36px)', fontSize: 13.5, padding: '6px 0', gap: 4, alignItems: 'center', color: 'var(--lh-fg)' }}>
                          <div style={{ fontWeight: 600, color: 'var(--lh-fg3)' }}>{row.rank}</div>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{row.team.name}</div>
                          <div style={{ textAlign: 'center', color: 'var(--lh-fg2)' }}>{row.played}</div>
                          <div style={{ textAlign: 'center', fontWeight: 700 }}>{row.points}</div>
                          <div style={{ textAlign: 'center', color: row.goalsDiff > 0 ? 'var(--lh-green)' : row.goalsDiff < 0 ? 'var(--lh-terra)' : 'var(--lh-fg3)' }}>
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
