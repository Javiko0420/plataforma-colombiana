'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/* Solo los campos que el widget necesita del fixture del Mundial.
   `winner` viene de API-Football (lo preserva mapFixture) e indica el ganador
   real incluso en partidos definidos por penales, donde `goals` queda empatado. */
interface WidgetTeam { name: string; logo: string; winner: boolean | null }
interface WidgetFixture {
  status: { short: string; elapsed: number | null }
  round: string
  teams: { home: WidgetTeam; away: WidgetTeam }
  goals: { home: number | null; away: number | null }
  date: string
}
interface WidgetResponse {
  mode: 'live' | 'last'
  fixture: WidgetFixture | null
  cachedAt: string
}

const POLL_MS = 30_000

/* Traduce el "round" de API-Football a una etiqueta corta en español. */
function roundLabel(round: string): string {
  if (round.startsWith('Group Stage')) {
    const m = round.match(/(\d+)\s*$/)
    return m ? `Fase de grupos · J${m[1]}` : 'Fase de grupos'
  }
  const map: Record<string, string> = {
    'Round of 16': 'Octavos de final',
    'Quarter-finals': 'Cuartos de final',
    'Semi-finals': 'Semifinales',
    Final: 'Final',
    '3rd Place Final': 'Tercer puesto',
  }
  return map[round] ?? round
}

const cardStyle: React.CSSProperties = {
  display: 'block', borderRadius: 20, padding: 22,
  background: 'var(--lh-surface)', border: '1px solid var(--lh-border)',
  boxShadow: 'var(--lh-shadow)', transition: '.26s', textDecoration: 'none',
}

const headerLabel: React.CSSProperties = {
  fontFamily: 'var(--lh-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lh-fg3)',
}

export function SportsWidget() {
  const [data, setData] = useState<WidgetResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    const load = () =>
      fetch('/api/sports/worldcup/widget')
        .then(res => res.json())
        .then((json: WidgetResponse) => {
          if (!active) return
          if (json && (json.mode === 'live' || json.mode === 'last')) { setData(json); setError(false) }
          else setError(true)
        })
        .catch(() => { if (active) setError(true) })
    load()
    const id = setInterval(load, POLL_MS)
    return () => { active = false; clearInterval(id) }
  }, [])

  const fixture = data?.fixture ?? null
  const isLive = data?.mode === 'live'

  return (
    <Link
      href="/deportes/mundial-2026"
      style={cardStyle}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={headerLabel}>Deportes</span>
        {isLive ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--lh-terra)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--lh-terra)', display: 'inline-block', animation: 'lh-pulse 1.6s infinite' }} aria-hidden="true" />
            EN VIVO
          </span>
        ) : fixture ? (
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--lh-fg3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Final</span>
        ) : null}
      </div>

      {fixture ? (
        <>
          <div style={{ fontSize: 12, color: 'var(--lh-fg3)', fontWeight: 500, marginBottom: 14 }}>
            Mundial 2026 · {roundLabel(fixture.round)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <TeamRow team={fixture.teams.home} goals={fixture.goals.home} winner={fixture.teams.home.winner === true} />
            <TeamRow team={fixture.teams.away} goals={fixture.goals.away} winner={fixture.teams.away.winner === true} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12.5, color: 'var(--lh-fg2)' }}>
            {isLive && fixture.status.elapsed != null
              ? `${fixture.status.elapsed}'`
              : formatDate(fixture.date)}
          </div>
        </>
      ) : (
        <p style={{ fontSize: 13.5, color: 'var(--lh-fg2)', padding: '14px 0' }}>
          {error ? 'No pudimos cargar el marcador.' : 'Cargando marcador…'}
        </p>
      )}
    </Link>
  )
}

function TeamRow({ team, goals, winner }: { team: WidgetTeam; goals: number | null; winner: boolean }) {
  const color = winner ? 'var(--lh-fg)' : 'var(--lh-fg2)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Image src={team.logo} alt={team.name} width={22} height={22} style={{ objectFit: 'contain', flexShrink: 0 }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: winner ? 700 : 500, color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {team.name}
      </span>
      <span style={{ fontSize: 17, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
        {goals ?? '–'}
      </span>
    </div>
  )
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}
