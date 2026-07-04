import Image from 'next/image'
import { getWorldcupFixtures } from '@/lib/sports/worldcup/service'
import { translate } from '@/lib/i18n'
import { buildBracket, type BracketRound } from '@/lib/sports/worldcup/bracket'
import type { WorldCupFixture } from '@/lib/sports/worldcup/types'

// ─── Bracket geometry ───────────────────────────────────────────────────────
// Fixed heights + per-round margins keep every column the same total height, so
// each parent match centers exactly between its two children and the CSS elbow
// connectors (see .wc-bracket in design-tokens.css) line up. Column height is
// constant: matches(r) · slot(r) = matches(0) · slot(0) for every round r.
const MATCH_H = 58 // px, fixed card height (two team rows)
const BASE_GAP = 14 // px, vertical gap between first-round matches
const GUTTER = 30 // px, horizontal space between rounds (must match CSS --wc-gut)
const COL_W = 172 // px, column width

const slot = (r: number) => (MATCH_H + BASE_GAP) * 2 ** r
const marginY = (r: number) => (slot(r) - MATCH_H) / 2
const railH = (r: number) => slot(r) / 2

const FINISHED = new Set(['FT', 'AET', 'PEN'])

function TeamRow({ team, goals, played }: { team: WorldCupFixture['teams']['home']; goals: number | null; played: boolean }) {
  const advanced = team.winner === true
  return (
    <div
      className="flex items-center gap-2"
      style={{ minWidth: 0, opacity: played && team.winner === false ? 0.55 : 1 }}
    >
      <Image src={team.logo} alt="" width={18} height={18} className="object-contain shrink-0" style={{ borderRadius: 3 }} />
      <span
        className="truncate"
        style={{ flex: 1, fontSize: 12.5, fontWeight: advanced ? 700 : 500, color: advanced ? 'var(--lh-green)' : 'var(--lh-fg)' }}
      >
        {team.name}
      </span>
      {goals != null && (
        <span style={{ fontSize: 12.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: advanced ? 'var(--lh-green)' : 'var(--lh-fg2)' }}>
          {goals}
        </span>
      )}
    </div>
  )
}

function BracketMatch({ fx, roundIndex, index, hasNext }: { fx: WorldCupFixture; roundIndex: number; index: number; hasNext: boolean }) {
  const played = FINISHED.has(fx.status.short)
  return (
    <div
      className="wc-match lh-card"
      data-next={hasNext ? '1' : '0'}
      data-pos={index % 2 === 0 ? 'top' : 'bottom'}
      style={{
        height: MATCH_H,
        marginTop: marginY(roundIndex),
        marginBottom: marginY(roundIndex),
        ['--wc-rail' as string]: `${railH(roundIndex)}px`,
        borderRadius: 12,
        padding: '7px 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 5,
        boxShadow: 'none',
      }}
    >
      <TeamRow team={fx.teams.home} goals={fx.goals.home} played={played} />
      <TeamRow team={fx.teams.away} goals={fx.goals.away} played={played} />
    </div>
  )
}

function RoundHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        width: COL_W,
        flex: `0 0 ${COL_W}px`,
        fontFamily: 'var(--lh-mono)',
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '.12em',
        color: 'var(--lh-fg3)',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  )
}

export default async function WorldcupBracket({ locale }: { locale: 'es' | 'en' }) {
  const t = (k: string) => translate(k, { locale })

  let fixtures: WorldCupFixture[] = []
  try {
    const data = await getWorldcupFixtures()
    fixtures = data.fixtures
  } catch {
    return (
      <p className="text-sm py-1 pl-3" style={{ color: 'var(--lh-fg3)', borderLeft: '2px solid var(--lh-border)' }}>
        {t('sports.worldcup.empty.bracket')}
      </p>
    )
  }

  const { rounds, thirdPlace } = buildBracket(fixtures, locale)

  if (rounds.length === 0) {
    return (
      <p className="text-sm py-1 pl-3" style={{ color: 'var(--lh-fg3)', borderLeft: '2px solid var(--lh-border)' }}>
        {t('sports.worldcup.empty.bracket')}
      </p>
    )
  }

  const colHeight = rounds[0]!.matches.length * (MATCH_H + BASE_GAP)
  const thirdPlaceLabel = locale === 'es' ? 'Tercer puesto' : 'Third place'

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
      <div className="wc-bracket" style={{ minWidth: 'min-content' }}>
        {/* Column headers */}
        <div style={{ display: 'flex', gap: GUTTER, marginBottom: 12 }}>
          {rounds.map((round: BracketRound) => (
            <RoundHeader key={round.order} label={round.label} />
          ))}
          {thirdPlace && <RoundHeader label={thirdPlaceLabel} />}
        </div>

        {/* Bracket body */}
        <div style={{ display: 'flex', gap: GUTTER, alignItems: 'flex-start' }}>
          {rounds.map((round, roundIndex) => (
            <div
              key={round.order}
              style={{ width: COL_W, flex: `0 0 ${COL_W}px`, display: 'flex', flexDirection: 'column' }}
            >
              {round.matches.map((fx, i) => (
                <BracketMatch
                  key={fx.id}
                  fx={fx}
                  roundIndex={roundIndex}
                  index={i}
                  hasNext={roundIndex < rounds.length - 1}
                />
              ))}
            </div>
          ))}

          {thirdPlace && (
            <div style={{ width: COL_W, flex: `0 0 ${COL_W}px`, display: 'flex', flexDirection: 'column' }}>
              <div
                className="wc-match lh-card"
                data-next="0"
                style={{
                  height: MATCH_H,
                  marginTop: (colHeight - MATCH_H) / 2,
                  marginBottom: (colHeight - MATCH_H) / 2,
                  borderRadius: 12,
                  padding: '7px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 5,
                  boxShadow: 'none',
                }}
              >
                <TeamRow team={thirdPlace.teams.home} goals={thirdPlace.goals.home} played={FINISHED.has(thirdPlace.status.short)} />
                <TeamRow team={thirdPlace.teams.away} goals={thirdPlace.goals.away} played={FINISHED.has(thirdPlace.status.short)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
