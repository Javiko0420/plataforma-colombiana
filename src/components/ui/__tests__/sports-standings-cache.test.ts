import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseStandingsPayload } from '@/lib/sports-standings-cache'

describe('sports-standings-cache', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('parses valid standings JSON payloads', () => {
    const rows = parseStandingsPayload([
      {
        rank: 1,
        team: { id: 10, name: 'Equipo A', logo: 'a.png' },
        points: 30,
        played: 12,
        won: 10,
        draw: 0,
        lost: 2,
        goalsFor: 25,
        goalsAgainst: 13,
        goalsDiff: 12,
      },
      { rank: 'bad', team: { id: 1, name: 'X' }, points: 1 },
    ])

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ rank: 1, points: 30, team: { id: 10, name: 'Equipo A' } })
  })

  it('returns empty array for invalid payloads', () => {
    expect(parseStandingsPayload(null)).toEqual([])
    expect(parseStandingsPayload('nope')).toEqual([])
    expect(parseStandingsPayload([])).toEqual([])
  })
})
