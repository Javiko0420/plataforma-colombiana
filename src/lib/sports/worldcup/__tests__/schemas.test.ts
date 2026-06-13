import { describe, it, expect } from 'vitest'
import {
  RawFixtureItemSchema,
  ApiFootballFixturesEnvelopeSchema,
  RawStandingsEntrySchema,
  ApiFootballStandingsEnvelopeSchema,
  ApiFootballRoundsEnvelopeSchema,
  RawEventSchema,
  RawLineupSchema,
  RawStatisticsTeamSchema,
  RawFixtureDetailItemSchema,
  ApiFootballFixtureDetailEnvelopeSchema,
  RawTeamItemSchema,
  ApiFootballTeamsEnvelopeSchema,
  WorldCupTeamSchema,
  HeadToHeadParamsSchema,
  WorldCupH2HFixtureSchema,
} from '../schemas'

const VALID_RAW_FIXTURE = {
  fixture: {
    id: 1001,
    date: '2026-06-11T18:00:00+00:00',
    timestamp: 1749650400,
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    venue: { id: 550, name: 'SoFi Stadium', city: 'Los Angeles' },
  },
  league: { id: 1, name: 'World Cup', round: 'Group Stage - 1' },
  teams: {
    home: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png', winner: null },
    away: { id: 24, name: 'Croatia', logo: 'https://example.com/cro.png', winner: null },
  },
  goals: { home: null, away: null },
}

describe('RawFixtureItemSchema', () => {
  it('accepts a valid fixture item', () => {
    const result = RawFixtureItemSchema.safeParse(VALID_RAW_FIXTURE)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.fixture.id).toBe(1001)
      expect(result.data.league.round).toBe('Group Stage - 1')
    }
  })

  it('accepts nullable fields (elapsed, goals, winner, venue fields)', () => {
    const withNulls = {
      ...VALID_RAW_FIXTURE,
      fixture: {
        ...VALID_RAW_FIXTURE.fixture,
        status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
        venue: { id: null, name: null, city: null },
      },
      teams: {
        home: { id: 1, name: 'A', logo: '', winner: true },
        away: { id: 2, name: 'B', logo: '', winner: false },
      },
      goals: { home: 2, away: 1 },
    }
    expect(RawFixtureItemSchema.safeParse(withNulls).success).toBe(true)
  })

  it('rejects when fixture.id is missing', () => {
    const bad = {
      ...VALID_RAW_FIXTURE,
      fixture: { ...VALID_RAW_FIXTURE.fixture, id: undefined },
    }
    expect(RawFixtureItemSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects when league.round is missing', () => {
    const bad = { ...VALID_RAW_FIXTURE, league: {} }
    expect(RawFixtureItemSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects when teams.home.winner is not boolean or null', () => {
    const bad = {
      ...VALID_RAW_FIXTURE,
      teams: {
        home: { id: 1, name: 'A', logo: '', winner: 'yes' }, // string, not boolean|null
        away: { id: 2, name: 'B', logo: '', winner: null },
      },
    }
    expect(RawFixtureItemSchema.safeParse(bad).success).toBe(false)
  })
})

describe('ApiFootballFixturesEnvelopeSchema', () => {
  it('accepts a non-empty response array', () => {
    const envelope = { errors: {}, results: 1, response: [VALID_RAW_FIXTURE] }
    expect(ApiFootballFixturesEnvelopeSchema.safeParse(envelope).success).toBe(true)
  })

  it('accepts an empty response array (valid for filtered queries with no matches)', () => {
    const envelope = { errors: {}, results: 0, response: [] }
    expect(ApiFootballFixturesEnvelopeSchema.safeParse(envelope).success).toBe(true)
  })

  it('rejects when response is not an array', () => {
    const envelope = { errors: {}, results: 0, response: null }
    expect(ApiFootballFixturesEnvelopeSchema.safeParse(envelope).success).toBe(false)
  })
})

// ─── Standings schemas ────────────────────────────────────────────────────────

const VALID_ENTRY = {
  rank: 1,
  team: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png' },
  points: 9,
  goalsDiff: 5,
  group: 'Group A',
  form: 'WWW',
  status: 'same',
  description: 'Promotion',
  all: { played: 3, win: 3, draw: 0, lose: 0, goals: { for: 7, against: 2 } },
}

describe('RawStandingsEntrySchema', () => {
  it('accepts a valid entry with all fields', () => {
    const result = RawStandingsEntrySchema.safeParse(VALID_ENTRY)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.all.goals.for).toBe(7)
      expect(result.data.all.goals.against).toBe(2)
      expect(result.data.form).toBe('WWW')
    }
  })

  it('accepts null form and null description', () => {
    const entry = { ...VALID_ENTRY, form: null, description: null }
    expect(RawStandingsEntrySchema.safeParse(entry).success).toBe(true)
  })

  it('rejects when team.id is missing', () => {
    const bad = { ...VALID_ENTRY, team: { name: 'Morocco', logo: '' } }
    expect(RawStandingsEntrySchema.safeParse(bad).success).toBe(false)
  })

  it('rejects when all.goals is missing', () => {
    const bad = { ...VALID_ENTRY, all: { played: 3, win: 3, draw: 0, lose: 0 } }
    expect(RawStandingsEntrySchema.safeParse(bad).success).toBe(false)
  })

  it('rejects when rank is not a number', () => {
    const bad = { ...VALID_ENTRY, rank: '1' }
    expect(RawStandingsEntrySchema.safeParse(bad).success).toBe(false)
  })
})

describe('ApiFootballStandingsEnvelopeSchema', () => {
  const VALID_ENVELOPE = {
    errors: {},
    results: 1,
    response: [
      {
        league: {
          id: 1,
          name: 'World Cup',
          season: 2026,
          standings: [
            [VALID_ENTRY, { ...VALID_ENTRY, rank: 2, points: 6, team: { id: 7, name: 'Croatia', logo: '' } }],
            [{ ...VALID_ENTRY, group: 'Group B', team: { id: 10, name: 'Brazil', logo: '' } }],
          ],
        },
      },
    ],
  }

  it('accepts a normal response with 2 groups', () => {
    const result = ApiFootballStandingsEnvelopeSchema.safeParse(VALID_ENVELOPE)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.response[0]!.league.standings).toHaveLength(2)
    }
  })

  it('accepts an empty response array (pre-tournament)', () => {
    const empty = { errors: {}, results: 0, response: [] }
    expect(ApiFootballStandingsEnvelopeSchema.safeParse(empty).success).toBe(true)
  })

  it('accepts response with standings: [] (tournament not yet started)', () => {
    const noStandings = {
      errors: {},
      results: 1,
      response: [{ league: { id: 1, name: 'World Cup', season: 2026, standings: [] } }],
    }
    expect(ApiFootballStandingsEnvelopeSchema.safeParse(noStandings).success).toBe(true)
  })

  it('accepts response with standings absent (league obj has no standings key)', () => {
    const noKey = {
      errors: {},
      results: 1,
      response: [{ league: { id: 1, name: 'World Cup' } }],
    }
    expect(ApiFootballStandingsEnvelopeSchema.safeParse(noKey).success).toBe(true)
  })

  it('rejects when a standings entry has an invalid shape', () => {
    const bad = {
      ...VALID_ENVELOPE,
      response: [
        {
          league: {
            standings: [[{ rank: 'one' }]], // rank must be number
          },
        },
      ],
    }
    expect(ApiFootballStandingsEnvelopeSchema.safeParse(bad).success).toBe(false)
  })
})

// ─── Rounds schemas ───────────────────────────────────────────────────────────

describe('ApiFootballRoundsEnvelopeSchema', () => {
  it('accepts an array of round strings', () => {
    const envelope = {
      errors: {},
      results: 3,
      response: ['Group Stage - 1', 'Group Stage - 2', 'Round of 16'],
    }
    const result = ApiFootballRoundsEnvelopeSchema.safeParse(envelope)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.response).toHaveLength(3)
      expect(result.data.response[0]).toBe('Group Stage - 1')
    }
  })

  it('accepts an empty response array (pre-tournament or no current round)', () => {
    const envelope = { errors: {}, results: 0, response: [] }
    expect(ApiFootballRoundsEnvelopeSchema.safeParse(envelope).success).toBe(true)
  })

  it('accepts a single-element response (current round call)', () => {
    const envelope = { errors: {}, results: 1, response: ['Round of 16'] }
    const result = ApiFootballRoundsEnvelopeSchema.safeParse(envelope)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.response[0]).toBe('Round of 16')
    }
  })

  it('rejects when response contains non-string elements', () => {
    const envelope = { errors: {}, results: 1, response: [{ round: 'Group Stage' }] }
    expect(ApiFootballRoundsEnvelopeSchema.safeParse(envelope).success).toBe(false)
  })

  it('rejects when response is not an array', () => {
    const envelope = { errors: {}, results: 0, response: 'Group Stage - 1' }
    expect(ApiFootballRoundsEnvelopeSchema.safeParse(envelope).success).toBe(false)
  })
})

// ─── Fixture Detail schemas ───────────────────────────────────────────────────

const VALID_EVENT = {
  time: { elapsed: 45, extra: null },
  team: { id: 6, name: 'Morocco' },
  player: { id: 12345, name: 'Ziyech' },
  assist: { id: null, name: null },
  type: 'Goal',
  detail: 'Normal Goal',
}

describe('RawEventSchema', () => {
  it('accepts a valid goal event', () => {
    expect(RawEventSchema.safeParse(VALID_EVENT).success).toBe(true)
  })

  it('accepts player.id = null (own goal or unknown player)', () => {
    const ownGoal = { ...VALID_EVENT, player: { id: null, name: 'Own Goal' } }
    const result = RawEventSchema.safeParse(ownGoal)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.player.id).toBeNull()
  })

  it('accepts time.extra as a number (added time)', () => {
    const withExtra = { ...VALID_EVENT, time: { elapsed: 90, extra: 3 } }
    const result = RawEventSchema.safeParse(withExtra)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.time.extra).toBe(3)
  })

  it('rejects when time.elapsed is missing', () => {
    const bad = { ...VALID_EVENT, time: { extra: null } }
    expect(RawEventSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects when type is missing', () => {
    const { type: _, ...bad } = VALID_EVENT
    expect(RawEventSchema.safeParse(bad).success).toBe(false)
  })
})

const VALID_LINEUP = {
  team: { id: 6, name: 'Morocco' },
  formation: '4-3-3',
  startXI: [
    { player: { id: 1, name: 'Bounou', number: 1, pos: 'G', grid: '1:1' } },
  ],
  substitutes: [
    { player: { id: 2, name: 'El Kaabi', number: 9, pos: 'F', grid: null } },
  ],
  coach: { id: 10, name: 'Regragui' },
}

describe('RawLineupSchema', () => {
  it('accepts a valid lineup', () => {
    expect(RawLineupSchema.safeParse(VALID_LINEUP).success).toBe(true)
  })

  it('accepts formation = null (not yet announced)', () => {
    const noFormation = { ...VALID_LINEUP, formation: null }
    expect(RawLineupSchema.safeParse(noFormation).success).toBe(true)
  })

  it('accepts formation absent (optional field)', () => {
    const { formation: _, ...noFormation } = VALID_LINEUP
    expect(RawLineupSchema.safeParse(noFormation).success).toBe(true)
  })

  it('accepts empty startXI and substitutes (pre-match)', () => {
    const empty = { ...VALID_LINEUP, startXI: [], substitutes: [] }
    expect(RawLineupSchema.safeParse(empty).success).toBe(true)
  })

  it('accepts coach.id = null', () => {
    const noCoachId = { ...VALID_LINEUP, coach: { id: null, name: 'Unknown' } }
    expect(RawLineupSchema.safeParse(noCoachId).success).toBe(true)
  })

  it('accepts player.number = null (can happen on some API responses)', () => {
    const nullNum = {
      ...VALID_LINEUP,
      startXI: [{ player: { id: 1, name: 'Bounou', number: null, pos: 'G', grid: '1:1' } }],
    }
    expect(RawLineupSchema.safeParse(nullNum).success).toBe(true)
  })

  it('rejects when team.id is missing', () => {
    const bad = { ...VALID_LINEUP, team: { name: 'Morocco' } }
    expect(RawLineupSchema.safeParse(bad).success).toBe(false)
  })
})

const VALID_STATS_TEAM = {
  team: { id: 6, name: 'Morocco' },
  statistics: [
    { type: 'Shots on Goal', value: 5 },
    { type: 'Ball Possession', value: '55%' },
    { type: 'Fouls', value: null },
  ],
}

describe('RawStatisticsTeamSchema', () => {
  it('accepts a valid statistics block', () => {
    expect(RawStatisticsTeamSchema.safeParse(VALID_STATS_TEAM).success).toBe(true)
  })

  it('accepts value = null (stat not yet computed)', () => {
    const withNull = {
      ...VALID_STATS_TEAM,
      statistics: [{ type: 'Shots on Goal', value: null }],
    }
    expect(RawStatisticsTeamSchema.safeParse(withNull).success).toBe(true)
  })

  it('accepts value as a string (e.g. "55%")', () => {
    const withStr = {
      ...VALID_STATS_TEAM,
      statistics: [{ type: 'Ball Possession', value: '55%' }],
    }
    const result = RawStatisticsTeamSchema.safeParse(withStr)
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.statistics[0]!.value).toBe('55%')
  })

  it('accepts empty statistics array', () => {
    const empty = { ...VALID_STATS_TEAM, statistics: [] }
    expect(RawStatisticsTeamSchema.safeParse(empty).success).toBe(true)
  })

  it('rejects when team.name is missing', () => {
    const bad = { ...VALID_STATS_TEAM, team: { id: 6 } }
    expect(RawStatisticsTeamSchema.safeParse(bad).success).toBe(false)
  })
})

const VALID_RAW_FIXTURE_DETAIL = {
  fixture: {
    id: 1001,
    date: '2026-06-11T18:00:00+00:00',
    timestamp: 1749650400,
    status: { long: 'Not Started', short: 'NS', elapsed: null },
    venue: { id: 550, name: 'SoFi Stadium', city: 'Los Angeles' },
  },
  league: { id: 1, name: 'World Cup', round: 'Group Stage - 1' },
  teams: {
    home: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png', winner: null },
    away: { id: 24, name: 'Croatia', logo: 'https://example.com/cro.png', winner: null },
  },
  goals: { home: null, away: null },
  events: [VALID_EVENT],
  lineups: [VALID_LINEUP],
  statistics: [VALID_STATS_TEAM],
}

describe('RawFixtureDetailItemSchema', () => {
  it('accepts a full fixture detail item with events/lineups/statistics', () => {
    const result = RawFixtureDetailItemSchema.safeParse(VALID_RAW_FIXTURE_DETAIL)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.events).toHaveLength(1)
      expect(result.data.lineups).toHaveLength(1)
      expect(result.data.statistics).toHaveLength(1)
    }
  })

  it('defaults events/lineups/statistics to [] when absent (pre-match NS fixture)', () => {
    const { events: _, lineups: __, statistics: ___, ...noSubs } = VALID_RAW_FIXTURE_DETAIL
    const result = RawFixtureDetailItemSchema.safeParse(noSubs)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.events).toEqual([])
      expect(result.data.lineups).toEqual([])
      expect(result.data.statistics).toEqual([])
    }
  })

  it('accepts extra fields in the raw item (e.g. players — stripped by Zod)', () => {
    const withPlayers = { ...VALID_RAW_FIXTURE_DETAIL, players: [{ team: {}, players: [] }] }
    expect(RawFixtureDetailItemSchema.safeParse(withPlayers).success).toBe(true)
  })
})

describe('ApiFootballFixtureDetailEnvelopeSchema', () => {
  it('accepts a valid envelope with one fixture detail item', () => {
    const envelope = { errors: {}, results: 1, response: [VALID_RAW_FIXTURE_DETAIL] }
    expect(ApiFootballFixtureDetailEnvelopeSchema.safeParse(envelope).success).toBe(true)
  })

  it('accepts an empty response array (fetchApiFootball throws EMPTY_RESPONSE before this)', () => {
    const empty = { errors: {}, results: 0, response: [] }
    expect(ApiFootballFixtureDetailEnvelopeSchema.safeParse(empty).success).toBe(true)
  })

  it('rejects when fixture.id is missing from the response item', () => {
    const bad = {
      errors: {},
      results: 1,
      response: [{ ...VALID_RAW_FIXTURE_DETAIL, fixture: { date: '2026-06-11' } }],
    }
    expect(ApiFootballFixtureDetailEnvelopeSchema.safeParse(bad).success).toBe(false)
  })
})

// ─── Teams schemas ────────────────────────────────────────────────────────────

const VALID_RAW_TEAM = {
  team: {
    id: 6,
    name: 'Morocco',
    code: 'MAR',
    country: 'Morocco',
    founded: 1955,
    national: true,
    logo: 'https://example.com/mar.png',
  },
  venue: {
    id: 550,
    name: 'SoFi Stadium',
    address: '1000 Stadium Dr',
    city: 'Inglewood',
    capacity: 70240,
    surface: 'grass',
    image: 'https://example.com/venue.png',
  },
}

describe('RawTeamItemSchema', () => {
  it('accepts a valid team item with all fields', () => {
    const result = RawTeamItemSchema.safeParse(VALID_RAW_TEAM)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.team.id).toBe(6)
      expect(result.data.team.founded).toBe(1955)
      expect(result.data.venue.capacity).toBe(70240)
    }
  })

  it('accepts code = null', () => {
    const noCode = { ...VALID_RAW_TEAM, team: { ...VALID_RAW_TEAM.team, code: null } }
    expect(RawTeamItemSchema.safeParse(noCode).success).toBe(true)
  })

  it('accepts founded = null (team with unknown founding year)', () => {
    const noFounded = { ...VALID_RAW_TEAM, team: { ...VALID_RAW_TEAM.team, founded: null } }
    expect(RawTeamItemSchema.safeParse(noFounded).success).toBe(true)
  })

  it('accepts venue with all nullable fields set to null', () => {
    const nullVenue = {
      ...VALID_RAW_TEAM,
      venue: { id: null, name: null, address: null, city: null, capacity: null, surface: null, image: null },
    }
    expect(RawTeamItemSchema.safeParse(nullVenue).success).toBe(true)
  })

  it('rejects when team.id is missing', () => {
    const bad = { ...VALID_RAW_TEAM, team: { ...VALID_RAW_TEAM.team, id: undefined } }
    expect(RawTeamItemSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects when team.national is not a boolean', () => {
    const bad = { ...VALID_RAW_TEAM, team: { ...VALID_RAW_TEAM.team, national: 'yes' } }
    expect(RawTeamItemSchema.safeParse(bad).success).toBe(false)
  })

  it('rejects when team.logo is missing', () => {
    const { logo: _, ...teamNoLogo } = VALID_RAW_TEAM.team
    const bad = { ...VALID_RAW_TEAM, team: teamNoLogo }
    expect(RawTeamItemSchema.safeParse(bad).success).toBe(false)
  })
})

describe('ApiFootballTeamsEnvelopeSchema', () => {
  it('accepts a non-empty response with team items', () => {
    const envelope = { errors: {}, results: 1, response: [VALID_RAW_TEAM] }
    expect(ApiFootballTeamsEnvelopeSchema.safeParse(envelope).success).toBe(true)
  })

  it('accepts an empty response array (pre-draw or no teams yet)', () => {
    const empty = { errors: {}, results: 0, response: [] }
    expect(ApiFootballTeamsEnvelopeSchema.safeParse(empty).success).toBe(true)
  })

  it('rejects when response is not an array', () => {
    const bad = { errors: {}, results: 1, response: null }
    expect(ApiFootballTeamsEnvelopeSchema.safeParse(bad).success).toBe(false)
  })
})

describe('WorldCupTeamSchema', () => {
  const VALID_OUTPUT = {
    id: 6,
    name: 'Morocco',
    code: 'MAR',
    country: 'Morocco',
    logo: 'https://example.com/mar.png',
    venue: { id: 550, name: 'SoFi Stadium', city: 'Inglewood' },
  }

  it('accepts a valid mapped team output', () => {
    expect(WorldCupTeamSchema.safeParse(VALID_OUTPUT).success).toBe(true)
  })

  it('accepts code = null', () => {
    const noCode = { ...VALID_OUTPUT, code: null }
    expect(WorldCupTeamSchema.safeParse(noCode).success).toBe(true)
  })

  it('accepts venue with all nullable fields as null', () => {
    const nullVenue = { ...VALID_OUTPUT, venue: { id: null, name: null, city: null } }
    expect(WorldCupTeamSchema.safeParse(nullVenue).success).toBe(true)
  })

  it('rejects output that still contains founded (should have been dropped)', () => {
    const withFounded = { ...VALID_OUTPUT, founded: 1955 }
    // Zod strips unknown keys silently — parse succeeds but founded is not in data
    const result = WorldCupTeamSchema.safeParse(withFounded)
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as Record<string, unknown>).founded).toBeUndefined()
    }
  })

  it('rejects when id is missing', () => {
    const { id: _, ...noId } = VALID_OUTPUT
    expect(WorldCupTeamSchema.safeParse(noId).success).toBe(false)
  })
})

// ─── Head-to-Head schemas ─────────────────────────────────────────────────────

describe('HeadToHeadParamsSchema', () => {
  it('accepts "6-24" (low-high order)', () => {
    expect(HeadToHeadParamsSchema.safeParse({ teams: '6-24' }).success).toBe(true)
  })

  it('accepts "24-6" (high-low order — normalization is route responsibility)', () => {
    expect(HeadToHeadParamsSchema.safeParse({ teams: '24-6' }).success).toBe(true)
  })

  it('accepts large IDs like "1234-5678"', () => {
    expect(HeadToHeadParamsSchema.safeParse({ teams: '1234-5678' }).success).toBe(true)
  })

  it('rejects a plain number with no hyphen', () => {
    expect(HeadToHeadParamsSchema.safeParse({ teams: '6' }).success).toBe(false)
  })

  it('rejects non-numeric parts like "abc-9"', () => {
    expect(HeadToHeadParamsSchema.safeParse({ teams: 'abc-9' }).success).toBe(false)
  })

  it('rejects three segments like "6-9-24"', () => {
    expect(HeadToHeadParamsSchema.safeParse({ teams: '6-9-24' }).success).toBe(false)
  })

  it('rejects empty string', () => {
    expect(HeadToHeadParamsSchema.safeParse({ teams: '' }).success).toBe(false)
  })

  it('rejects floating point numbers like "6.5-9"', () => {
    expect(HeadToHeadParamsSchema.safeParse({ teams: '6.5-9' }).success).toBe(false)
  })
})

describe('WorldCupH2HFixtureSchema', () => {
  const VALID_H2H_FIXTURE = {
    id: 1001,
    date: '2026-06-11T18:00:00+00:00',
    timestamp: 1749650400,
    status: { long: 'Match Finished', short: 'FT', elapsed: 90 },
    round: 'Group Stage - 1',
    league: { id: 1, name: 'World Cup' },
    venue: { id: 550, name: 'SoFi Stadium', city: 'Los Angeles' },
    teams: {
      home: { id: 6, name: 'Morocco', logo: 'https://example.com/mar.png', winner: true },
      away: { id: 24, name: 'Croatia', logo: 'https://example.com/cro.png', winner: false },
    },
    goals: { home: 2, away: 1 },
  }

  it('accepts a valid H2H fixture with league.id and league.name', () => {
    const result = WorldCupH2HFixtureSchema.safeParse(VALID_H2H_FIXTURE)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.league).toEqual({ id: 1, name: 'World Cup' })
      expect(result.data.round).toBe('Group Stage - 1')
    }
  })

  it('rejects when league is absent (required for H2H — cross-competition context)', () => {
    const { league: _, ...noLeague } = VALID_H2H_FIXTURE
    expect(WorldCupH2HFixtureSchema.safeParse(noLeague).success).toBe(false)
  })

  it('rejects when league.id is missing', () => {
    const bad = { ...VALID_H2H_FIXTURE, league: { name: 'World Cup' } }
    expect(WorldCupH2HFixtureSchema.safeParse(bad).success).toBe(false)
  })
})
