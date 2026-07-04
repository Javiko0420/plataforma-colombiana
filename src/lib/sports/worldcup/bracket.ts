// Pure helpers to turn a flat list of World Cup fixtures into a knockout bracket
// (Round of 32 → Final) plus the third-place match. No I/O, no React — kept
// separate from the component so the grouping/ordering logic can be unit-tested.

import type { WorldCupFixture } from './types'

export interface BracketRound {
  /** Canonical order, 1 = Round of 32 … 5 = Final. */
  order: number
  /** Localized round label for the column header. */
  label: string
  /** Fixtures of this round, sorted chronologically (bracket order). */
  matches: WorldCupFixture[]
}

export interface Bracket {
  /** Main tree rounds, ordered Round of 32 → Final. */
  rounds: BracketRound[]
  /** Third-place match, kept out of the tree (it has no children/parent). */
  thirdPlace: WorldCupFixture | null
}

// Matched by pattern (not exact string) so it survives API-Football label
// variations. Order matters: "quarter-finals" / "semi-finals" all contain
// "final", so those patterns are tested before the bare "final" fallback.
const BRACKET_ROUNDS: ReadonlyArray<{
  match: (round: string) => boolean
  order: number
  label: { es: string; en: string }
}> = [
  { match: (r) => r.includes('round of 32'), order: 1, label: { es: 'Dieciseisavos', en: 'Round of 32' } },
  { match: (r) => r.includes('round of 16'), order: 2, label: { es: 'Octavos', en: 'Round of 16' } },
  { match: (r) => r.includes('quarter'), order: 3, label: { es: 'Cuartos', en: 'Quarter-finals' } },
  { match: (r) => r.includes('semi'), order: 4, label: { es: 'Semifinales', en: 'Semi-finals' } },
  { match: (r) => r.includes('final'), order: 5, label: { es: 'Final', en: 'Final' } },
]

/** The third-place playoff is shown apart from the main bracket tree. */
export function isThirdPlaceRound(round: string): boolean {
  const r = round.toLowerCase()
  return r.includes('3rd place') || r.includes('third place')
}

/** Returns the bracket-tree round descriptor for a raw round string, or null. */
export function matchBracketRound(round: string) {
  const r = round.toLowerCase()
  if (isThirdPlaceRound(r)) return null // handled separately
  return BRACKET_ROUNDS.find((b) => b.match(r)) ?? null
}

function sortByKickoff(a: WorldCupFixture, b: WorldCupFixture): number {
  return a.timestamp - b.timestamp || a.id - b.id
}

/** Team id that advanced from a match, or null if not decided yet. */
function winnerId(fx: WorldCupFixture): number | null {
  if (fx.teams.home.winner === true) return fx.teams.home.id
  if (fx.teams.away.winner === true) return fx.teams.away.id
  return null
}

/**
 * Reorders each round so that the two matches feeding a given next-round match
 * sit adjacent and in home/away (top/bottom) order. API-Football returns
 * knockout fixtures in chronological order, NOT bracket order, so a purely
 * positional pairing would connect the wrong matches. We derive the real
 * structure by following team ids: a next-round match's two teams are the
 * winners of two specific earlier matches. Ordering is propagated top-down from
 * the deepest round so the whole tree stays consistent. Matches that can't be
 * linked yet (future rounds with undecided teams) keep chronological order.
 *
 * Mutates `rounds` in place. Expects rounds sorted ascending (Round of 32 →
 * Final) with each round's matches pre-sorted chronologically.
 */
function linkAndOrderRounds(rounds: BracketRound[]): void {
  for (let r = rounds.length - 1; r >= 1; r--) {
    const parent = rounds[r]!
    const child = rounds[r - 1]!

    // teamId (winner) → the child match it came out of.
    const producedBy = new Map<number, WorldCupFixture>()
    for (const cm of child.matches) {
      const w = winnerId(cm)
      if (w != null && !producedBy.has(w)) producedBy.set(w, cm)
    }

    const ordered: WorldCupFixture[] = []
    const used = new Set<number>()
    const take = (cm: WorldCupFixture | undefined) => {
      if (cm && !used.has(cm.id)) {
        ordered.push(cm)
        used.add(cm.id)
      }
    }
    for (const pm of parent.matches) {
      take(producedBy.get(pm.teams.home.id)) // top child
      take(producedBy.get(pm.teams.away.id)) // bottom child
    }
    // Append any child match not linked to a parent (undecided/future), keeping
    // its chronological position.
    for (const cm of child.matches) take(cm)

    child.matches = ordered
  }
}

/**
 * Groups knockout fixtures into ordered rounds plus the third-place match.
 * Group-stage fixtures (and any round that doesn't match a knockout pattern)
 * are ignored. Rounds are then reordered into true bracket order (see
 * linkAndOrderRounds) so the connectors join the matches that actually feed
 * each next-round fixture.
 */
export function buildBracket(fixtures: WorldCupFixture[], locale: 'es' | 'en'): Bracket {
  const byOrder = new Map<number, BracketRound>()
  let thirdPlace: WorldCupFixture | null = null

  for (const fx of fixtures) {
    if (isThirdPlaceRound(fx.round)) {
      // There is a single third-place match; keep the earliest if duplicated.
      if (!thirdPlace || sortByKickoff(fx, thirdPlace) < 0) thirdPlace = fx
      continue
    }
    const round = matchBracketRound(fx.round)
    if (!round) continue // skip group stage / unknown rounds

    const existing = byOrder.get(round.order)
    if (existing) existing.matches.push(fx)
    else byOrder.set(round.order, { order: round.order, label: round.label[locale], matches: [fx] })
  }

  const rounds = Array.from(byOrder.values())
    .sort((a, b) => a.order - b.order)
    .map((round) => ({ ...round, matches: round.matches.slice().sort(sortByKickoff) }))

  // Reorder into true bracket order so connectors link the correct matches.
  linkAndOrderRounds(rounds)

  return { rounds, thirdPlace }
}
