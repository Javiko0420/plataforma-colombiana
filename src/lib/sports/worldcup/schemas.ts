import { z } from 'zod'

// --- Building blocks ---

export const LeagueInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string().optional(),
  logo: z.string().optional(),
})

export const FixtureCoverageSchema = z.object({
  events: z.boolean(),
  lineups: z.boolean(),
  statistics_fixtures: z.boolean(),
  statistics_players: z.boolean(),
})

export const SeasonCoverageSchema = z.object({
  fixtures: FixtureCoverageSchema,
  standings: z.boolean(),
  players: z.boolean(),
  top_scorers: z.boolean(),
  top_assists: z.boolean(),
  top_cards: z.boolean(),
  injuries: z.boolean(),
  predictions: z.boolean(),
  odds: z.boolean(),
})

export const SeasonSchema = z.object({
  year: z.number(),
  start: z.string().optional(),
  end: z.string().optional(),
  current: z.boolean().optional(),
  coverage: SeasonCoverageSchema,
})

export const LeagueEntrySchema = z.object({
  league: LeagueInfoSchema,
  country: z
    .object({
      name: z.string().optional(),
      code: z.string().nullable().optional(),
      flag: z.string().nullable().optional(),
    })
    .optional(),
  seasons: z.array(SeasonSchema),
})

// --- Full API-Football envelope for GET /leagues ---

export const ApiFootballEnvelopeSchema = z.object({
  // API-Football returns errors as empty object {}, non-empty object, or string[]
  // API-Football uses inconsistent shapes for `errors`: {}, {key:msg}, string[], or "".
  // z.record in Zod v4 requires explicit key + value schemas.
  errors: z
    .union([z.record(z.string(), z.string()), z.array(z.string()), z.string()])
    .optional(),
  results: z.number().optional(),
  response: z.array(LeagueEntrySchema),
})

// --- Parsed output shape used by the coverage route ---

export const WorldCupCoverageSchema = z.object({
  league: LeagueInfoSchema,
  season: z.number(),
  coverage: SeasonCoverageSchema,
  cachedAt: z.string(), // ISO 8601
})

export type WorldCupCoverage = z.infer<typeof WorldCupCoverageSchema>
export type SeasonCoverage = z.infer<typeof SeasonCoverageSchema>
export type LeagueInfo = z.infer<typeof LeagueInfoSchema>

// ─── Fixtures ────────────────────────────────────────────────────────────────

// Reusable errors field — API-Football is inconsistent: {}, {key:msg}, string[], "".
const ApiErrorsFieldSchema = z
  .union([z.record(z.string(), z.string()), z.array(z.string()), z.string()])
  .optional()

const TeamInFixtureSchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string(),
  winner: z.boolean().nullable(),
})

/** Raw fixture item as returned by API-Football /fixtures endpoint. */
export const RawFixtureItemSchema = z.object({
  fixture: z.object({
    id: z.number(),
    date: z.string(),
    timestamp: z.number(),
    status: z.object({
      long: z.string(),
      short: z.string(),
      elapsed: z.number().nullable(),
    }),
    venue: z.object({
      id: z.number().nullable(),
      name: z.string().nullable(),
      city: z.string().nullable(),
    }),
  }),
  // id and name are needed by /live to filter World Cup fixtures from live=all responses.
  league: z.object({
    id: z.number(),
    name: z.string(),
    round: z.string(),
  }),
  teams: z.object({
    home: TeamInFixtureSchema,
    away: TeamInFixtureSchema,
  }),
  goals: z.object({
    home: z.number().nullable(),
    away: z.number().nullable(),
  }),
})

/** API-Football envelope for /fixtures — accepts empty response arrays. */
export const ApiFootballFixturesEnvelopeSchema = z.object({
  errors: ApiErrorsFieldSchema,
  results: z.number().optional(),
  response: z.array(RawFixtureItemSchema),
})

/** Flattened fixture shape served by our endpoint (round promoted from league.round). */
export const WorldCupFixtureSchema = z.object({
  id: z.number(),
  date: z.string(),
  timestamp: z.number(),
  status: z.object({
    long: z.string(),
    short: z.string(),
    elapsed: z.number().nullable(),
  }),
  round: z.string(),
  venue: z.object({
    id: z.number().nullable(),
    name: z.string().nullable(),
    city: z.string().nullable(),
  }),
  teams: z.object({
    home: TeamInFixtureSchema,
    away: TeamInFixtureSchema,
  }),
  goals: z.object({
    home: z.number().nullable(),
    away: z.number().nullable(),
  }),
})

export const WorldCupFixturesResponseSchema = z.object({
  fixtures: z.array(WorldCupFixtureSchema),
  cachedAt: z.string(),
})

export type RawFixtureItem = z.infer<typeof RawFixtureItemSchema>
export type WorldCupFixture = z.infer<typeof WorldCupFixtureSchema>
export type WorldCupFixturesResponse = z.infer<typeof WorldCupFixturesResponseSchema>

// ─── Standings ────────────────────────────────────────────────────────────────

/** A single team's row within a group-stage standings table. */
export const RawStandingsEntrySchema = z.object({
  rank: z.number(),
  team: z.object({ id: z.number(), name: z.string(), logo: z.string() }),
  points: z.number(),
  goalsDiff: z.number(),
  group: z.string(),
  form: z.string().nullable(),
  status: z.string(),
  description: z.string().nullable(),
  all: z.object({
    played: z.number(),
    win: z.number(),
    draw: z.number(),
    lose: z.number(),
    // `for` is a reserved word but is valid as an object property key
    goals: z.object({ for: z.number(), against: z.number() }),
  }),
})

/** API-Football envelope for GET /standings — accepts empty response. */
export const ApiFootballStandingsEnvelopeSchema = z.object({
  errors: ApiErrorsFieldSchema,
  results: z.number().optional(),
  response: z.array(
    z.object({
      league: z.object({
        id: z.number().optional(),
        name: z.string().optional(),
        season: z.number().optional(),
        // Optional: before the tournament the API may return standings: undefined.
        standings: z.array(z.array(RawStandingsEntrySchema)).optional(),
      }),
    })
  ),
})

/** One mapped group (e.g. "Group A") with its teams' stats. */
export const WorldCupStandingsGroupSchema = z.object({
  group: z.string(),
  standings: z.array(
    z.object({
      rank: z.number(),
      team: z.object({ id: z.number(), name: z.string(), logo: z.string() }),
      points: z.number(),
      goalsDiff: z.number(),
      played: z.number(),
      win: z.number(),
      draw: z.number(),
      lose: z.number(),
      goalsFor: z.number(),
      goalsAgainst: z.number(),
      form: z.string().nullable(),
    })
  ),
})

export const WorldCupStandingsResponseSchema = z.object({
  groups: z.array(WorldCupStandingsGroupSchema),
  cachedAt: z.string(),
})

export type RawStandingsEntry = z.infer<typeof RawStandingsEntrySchema>
export type WorldCupStandingsGroup = z.infer<typeof WorldCupStandingsGroupSchema>
export type WorldCupStandingsResponse = z.infer<typeof WorldCupStandingsResponseSchema>

// ─── Rounds ───────────────────────────────────────────────────────────────────

/**
 * API-Football envelope for GET /fixtures/rounds.
 * Reused for both calls (all rounds + current=true) — both return string[].
 */
export const ApiFootballRoundsEnvelopeSchema = z.object({
  errors: ApiErrorsFieldSchema,
  results: z.number().optional(),
  response: z.array(z.string()),
})

export const WorldCupRoundsResponseSchema = z.object({
  rounds: z.array(z.string()),
  current: z.string().nullable(),
  cachedAt: z.string(),
})

export type WorldCupRoundsResponse = z.infer<typeof WorldCupRoundsResponseSchema>

// ─── Live ─────────────────────────────────────────────────────────────────────

export const WorldCupLiveResponseSchema = z.object({
  fixtures: z.array(WorldCupFixtureSchema),
  hasLive: z.boolean(),
  cachedAt: z.string(),
})

export type WorldCupLiveResponse = z.infer<typeof WorldCupLiveResponseSchema>

// ─── Fixture Detail ───────────────────────────────────────────────────────────

// Raw schemas — parse the API-Football response for GET /fixtures?id=X.
// Events, lineups, statistics and players are embedded in each response item.

export const RawEventSchema = z.object({
  time: z.object({ elapsed: z.number(), extra: z.number().nullable() }),
  team: z.object({ id: z.number(), name: z.string() }),
  player: z.object({ id: z.number().nullable(), name: z.string() }),
  assist: z.object({ id: z.number().nullable(), name: z.string().nullable() }),
  type: z.string(),
  detail: z.string(),
})

const RawLineupPlayerEntrySchema = z.object({
  player: z.object({
    id: z.number(),
    name: z.string(),
    number: z.number().nullable(),
    pos: z.string().nullable(),
    // `grid` is positional metadata ("1:1"), dropped in output
    grid: z.string().nullable().optional(),
  }),
})

export const RawLineupSchema = z.object({
  team: z.object({ id: z.number(), name: z.string() }),
  formation: z.string().nullable().optional(),
  startXI: z.array(RawLineupPlayerEntrySchema),
  substitutes: z.array(RawLineupPlayerEntrySchema),
  coach: z.object({ id: z.number().nullable(), name: z.string().nullable() }),
})

const RawStatisticItemSchema = z.object({
  type: z.string(),
  value: z.union([z.number(), z.string(), z.null()]),
})

export const RawStatisticsTeamSchema = z.object({
  team: z.object({ id: z.number(), name: z.string() }),
  statistics: z.array(RawStatisticItemSchema),
})

/** Raw fixture detail item — extends the list fixture with embedded sub-resources. */
export const RawFixtureDetailItemSchema = RawFixtureItemSchema.extend({
  events: z.array(RawEventSchema).optional().default([]),
  lineups: z.array(RawLineupSchema).optional().default([]),
  statistics: z.array(RawStatisticsTeamSchema).optional().default([]),
  // `players` is excluded from the MVP output; Zod strips unknown keys automatically.
})

/** API-Football envelope for GET /fixtures?id=X. Rejects empty (fixture not found = 404). */
export const ApiFootballFixtureDetailEnvelopeSchema = z.object({
  errors: ApiErrorsFieldSchema,
  results: z.number().optional(),
  response: z.array(RawFixtureDetailItemSchema),
})

// Output schemas — shape served by GET /api/sports/worldcup/fixtures/[id].

const WorldCupEventSchema = z.object({
  time: z.object({ elapsed: z.number(), extra: z.number().nullable() }),
  team: z.object({ id: z.number(), name: z.string() }),
  player: z.object({ id: z.number().nullable(), name: z.string() }),
  assist: z.object({ id: z.number().nullable(), name: z.string().nullable() }),
  type: z.string(),
  detail: z.string(),
})

const WorldCupLineupPlayerEntrySchema = z.object({
  player: z.object({
    id: z.number(),
    name: z.string(),
    number: z.number(),
    pos: z.string().nullable(),
  }),
})

const WorldCupLineupSchema = z.object({
  team: z.object({ id: z.number(), name: z.string() }),
  formation: z.string().nullable(),
  startXI: z.array(WorldCupLineupPlayerEntrySchema),
  substitutes: z.array(WorldCupLineupPlayerEntrySchema),
  coach: z.object({ id: z.number().nullable(), name: z.string().nullable() }),
})

const WorldCupStatisticItemSchema = z.object({
  type: z.string(),
  value: z.union([z.number(), z.string(), z.null()]),
})

const WorldCupStatisticsTeamSchema = z.object({
  team: z.object({ id: z.number(), name: z.string() }),
  statistics: z.array(WorldCupStatisticItemSchema),
})

export const WorldCupFixtureDetailResponseSchema = z.object({
  fixture: WorldCupFixtureSchema,
  events: z.array(WorldCupEventSchema),
  lineups: z.array(WorldCupLineupSchema),
  statistics: z.array(WorldCupStatisticsTeamSchema),
  cachedAt: z.string(),
})

export type RawFixtureDetailItem = z.infer<typeof RawFixtureDetailItemSchema>
export type WorldCupFixtureDetailResponse = z.infer<typeof WorldCupFixtureDetailResponseSchema>

// ─── Teams ────────────────────────────────────────────────────────────────────

/** Raw team item as returned by API-Football GET /teams?league=1&season=2026. */
export const RawTeamItemSchema = z.object({
  team: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string().nullable(),
    country: z.string(),
    founded: z.number().nullable(),
    national: z.boolean(),
    logo: z.string(),
  }),
  venue: z.object({
    id: z.number().nullable(),
    name: z.string().nullable(),
    address: z.string().nullable(),
    city: z.string().nullable(),
    capacity: z.number().nullable(),
    surface: z.string().nullable(),
    image: z.string().nullable(),
  }),
})

/** API-Football envelope for GET /teams — accepts empty response (pre-draw). */
export const ApiFootballTeamsEnvelopeSchema = z.object({
  errors: ApiErrorsFieldSchema,
  results: z.number().optional(),
  response: z.array(RawTeamItemSchema),
})

/** Flattened team shape served by our endpoint — venue trimmed to id/name/city. */
export const WorldCupTeamSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string().nullable(),
  country: z.string(),
  logo: z.string(),
  venue: z.object({
    id: z.number().nullable(),
    name: z.string().nullable(),
    city: z.string().nullable(),
  }),
})

export const WorldCupTeamsResponseSchema = z.object({
  teams: z.array(WorldCupTeamSchema),
  cachedAt: z.string(),
})

export type RawTeamItem = z.infer<typeof RawTeamItemSchema>
export type WorldCupTeam = z.infer<typeof WorldCupTeamSchema>
export type WorldCupTeamsResponse = z.infer<typeof WorldCupTeamsResponseSchema>

// ─── Head-to-Head ─────────────────────────────────────────────────────────────

// H2H fixtures include league { id, name } because the history crosses
// multiple competitions, not just the World Cup.
export const WorldCupH2HFixtureSchema = WorldCupFixtureSchema.extend({
  league: z.object({ id: z.number(), name: z.string() }),
})

export const WorldCupHeadToHeadResponseSchema = z.object({
  fixtures: z.array(WorldCupH2HFixtureSchema),
  cachedAt: z.string(),
})

// Exported so it can be tested independently of the route.
// Validates the `teams` query param format — presence is checked in the route.
export const HeadToHeadParamsSchema = z.object({
  teams: z.string().regex(/^\d+-\d+$/, "teams must be in format 'A-B' (e.g. '6-9')"),
})

export type WorldCupH2HFixture = z.infer<typeof WorldCupH2HFixtureSchema>
export type WorldCupHeadToHeadResponse = z.infer<typeof WorldCupHeadToHeadResponseSchema>
