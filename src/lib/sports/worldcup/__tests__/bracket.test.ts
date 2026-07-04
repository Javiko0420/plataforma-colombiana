import { describe, it, expect } from 'vitest'
import { buildBracket, matchBracketRound, isThirdPlaceRound } from '../bracket'
import type { WorldCupFixture } from '../types'

let nextId = 1

function makeFixture(round: string, timestamp: number, opts: Partial<{ homeWinner: boolean | null; awayWinner: boolean | null; homeGoals: number | null; awayGoals: number | null }> = {}): WorldCupFixture {
  const id = nextId++
  return {
    id,
    date: new Date(timestamp * 1000).toISOString(),
    timestamp,
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    round,
    venue: { id: 1, name: 'Stadium', city: 'City' },
    teams: {
      home: { id: id * 10, name: `Home ${id}`, logo: 'h.png', winner: opts.homeWinner ?? null },
      away: { id: id * 10 + 1, name: `Away ${id}`, logo: 'a.png', winner: opts.awayWinner ?? null },
    },
    goals: { home: opts.homeGoals ?? null, away: opts.awayGoals ?? null },
  }
}

describe('matchBracketRound', () => {
  it('maps knockout rounds to canonical order, ignoring case', () => {
    expect(matchBracketRound('Round of 32')?.order).toBe(1)
    expect(matchBracketRound('round of 16')?.order).toBe(2)
    expect(matchBracketRound('Quarter-finals')?.order).toBe(3)
    expect(matchBracketRound('Semi-finals')?.order).toBe(4)
    expect(matchBracketRound('Final')?.order).toBe(5)
  })

  it('does NOT match quarter/semi/3rd-place as the bare Final', () => {
    expect(matchBracketRound('Quarter-finals')?.order).toBe(3)
    expect(matchBracketRound('Semi-finals')?.order).toBe(4)
    expect(matchBracketRound('3rd Place Final')).toBeNull() // handled apart
  })

  it('excludes group stage', () => {
    expect(matchBracketRound('Group Stage - 1')).toBeNull()
    expect(matchBracketRound('Group Stage - 3')).toBeNull()
  })
})

describe('isThirdPlaceRound', () => {
  it('detects the third-place playoff by pattern', () => {
    expect(isThirdPlaceRound('3rd Place Final')).toBe(true)
    expect(isThirdPlaceRound('Third place')).toBe(true)
    expect(isThirdPlaceRound('Final')).toBe(false)
  })
})

describe('buildBracket', () => {
  it('orders rounds Round of 32 → Final regardless of input order', () => {
    const fixtures = [
      makeFixture('Final', 500),
      makeFixture('Round of 16', 200),
      makeFixture('Round of 32', 100),
      makeFixture('Semi-finals', 400),
      makeFixture('Quarter-finals', 300),
    ]
    const { rounds } = buildBracket(fixtures, 'es')
    expect(rounds.map((r) => r.order)).toEqual([1, 2, 3, 4, 5])
    expect(rounds.map((r) => r.label)).toEqual([
      'Dieciseisavos',
      'Octavos',
      'Cuartos',
      'Semifinales',
      'Final',
    ])
  })

  it('localizes labels in English', () => {
    const { rounds } = buildBracket([makeFixture('Round of 16', 1)], 'en')
    expect(rounds[0]!.label).toBe('Round of 16')
  })

  it('drops group-stage fixtures', () => {
    const fixtures = [
      makeFixture('Group Stage - 1', 10),
      makeFixture('Group Stage - 2', 20),
      makeFixture('Round of 16', 30),
    ]
    const { rounds } = buildBracket(fixtures, 'es')
    expect(rounds).toHaveLength(1)
    expect(rounds[0]!.order).toBe(2)
  })

  it('separates the third-place match from the tree', () => {
    const third = makeFixture('3rd Place Final', 450)
    const { rounds, thirdPlace } = buildBracket([makeFixture('Final', 500), third], 'es')
    expect(rounds.map((r) => r.order)).toEqual([5])
    expect(thirdPlace?.id).toBe(third.id)
  })

  it('sorts matches within a round by kickoff time', () => {
    const late = makeFixture('Round of 16', 900)
    const early = makeFixture('Round of 16', 100)
    const mid = makeFixture('Round of 16', 500)
    const { rounds } = buildBracket([late, early, mid], 'es')
    expect(rounds[0]!.matches.map((m) => m.timestamp)).toEqual([100, 500, 900])
  })

  it('reorders rounds into true bracket order by following winners', () => {
    // Team ids: A=100 wins m0, C=300 wins m2 → they meet in R16 P.
    //           B=200 wins m1, D=400 wins m3 → they meet in R16 Q.
    // Chronologically R32 is [m0,m1,m2,m3]; a positional pairing would wrongly
    // connect m0+m1. The correct layout must be [m0,m2,m1,m3] so (m0,m2)->P.
    const mk = (id: number, ts: number, homeId: number, awayId: number, winner: number): WorldCupFixture => ({
      id,
      date: new Date(ts * 1000).toISOString(),
      timestamp: ts,
      status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
      round: id < 10 ? 'Round of 32' : 'Round of 16',
      venue: { id: 1, name: 'S', city: 'C' },
      teams: {
        home: { id: homeId, name: `T${homeId}`, logo: 'h.png', winner: winner === homeId },
        away: { id: awayId, name: `T${awayId}`, logo: 'a.png', winner: winner === awayId },
      },
      goals: { home: winner === homeId ? 1 : 0, away: winner === awayId ? 1 : 0 },
    })

    const m0 = mk(1, 100, 999, 100, 100) // winner A=100
    const m1 = mk(2, 200, 200, 998, 200) // winner B=200
    const m2 = mk(3, 300, 300, 997, 300) // winner C=300
    const m3 = mk(4, 400, 400, 996, 400) // winner D=400
    const P = mk(10, 1000, 100, 300, 100) // A vs C
    const Q = mk(11, 1100, 200, 400, 200) // B vs D

    const { rounds } = buildBracket([m0, m1, m2, m3, P, Q], 'es')
    const r32 = rounds.find((r) => r.order === 1)!
    const r16 = rounds.find((r) => r.order === 2)!

    expect(r16.matches.map((m) => m.id)).toEqual([10, 11]) // P, Q
    // m0 & m2 feed P (adjacent, top/bottom); m1 & m3 feed Q.
    expect(r32.matches.map((m) => m.id)).toEqual([1, 3, 2, 4])
  })

  it('keeps chronological order for rounds whose parents are undecided', () => {
    // R16 present, QF exists but with teams that never won an R16 match (TBD).
    const a = makeFixture('Round of 16', 100, { homeWinner: true })
    const b = makeFixture('Round of 16', 200, { awayWinner: true })
    const tbd = makeFixture('Quarter-finals', 500) // no winner links back
    const { rounds } = buildBracket([b, a, tbd], 'es')
    const r16 = rounds.find((r) => r.order === 2)!
    expect(r16.matches.map((m) => m.timestamp)).toEqual([100, 200])
  })

  it('returns an empty bracket when there are no knockout fixtures', () => {
    const { rounds, thirdPlace } = buildBracket([makeFixture('Group Stage - 1', 1)], 'es')
    expect(rounds).toHaveLength(0)
    expect(thirdPlace).toBeNull()
  })
})
