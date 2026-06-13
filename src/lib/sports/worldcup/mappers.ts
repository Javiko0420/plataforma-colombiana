import type { RawFixtureItem, RawFixtureDetailItem, WorldCupFixture, WorldCupFixtureDetailResponse, RawTeamItem, WorldCupTeam, WorldCupH2HFixture } from './schemas'

/** Map a raw API-Football fixture item to the flat shape served by our endpoints. */
export function mapFixture(raw: RawFixtureItem): WorldCupFixture {
  return {
    id: raw.fixture.id,
    date: raw.fixture.date,
    timestamp: raw.fixture.timestamp,
    status: raw.fixture.status,
    round: raw.league.round,
    venue: raw.fixture.venue,
    teams: raw.teams,
    goals: raw.goals,
  }
}

/** Map a raw fixture detail item to the shape served by GET /fixtures/[id]. */
export function mapFixtureDetail(
  raw: RawFixtureDetailItem
): Omit<WorldCupFixtureDetailResponse, 'cachedAt'> {
  const fixture = mapFixture(raw)

  const events = raw.events.map((e) => ({
    time: e.time,
    team: { id: e.team.id, name: e.team.name },
    player: { id: e.player.id, name: e.player.name },
    assist: { id: e.assist.id, name: e.assist.name },
    type: e.type,
    detail: e.detail,
  }))

  const lineups = raw.lineups.map((l) => ({
    team: { id: l.team.id, name: l.team.name },
    formation: l.formation ?? null,
    startXI: l.startXI.map((entry) => ({
      player: {
        id: entry.player.id,
        name: entry.player.name,
        number: entry.player.number ?? 0,
        pos: entry.player.pos,
      },
    })),
    substitutes: l.substitutes.map((entry) => ({
      player: {
        id: entry.player.id,
        name: entry.player.name,
        number: entry.player.number ?? 0,
        pos: entry.player.pos,
      },
    })),
    coach: { id: l.coach.id, name: l.coach.name },
  }))

  const statistics = raw.statistics.map((s) => ({
    team: { id: s.team.id, name: s.team.name },
    statistics: s.statistics.map((item) => ({ type: item.type, value: item.value })),
  }))

  return { fixture, events, lineups, statistics }
}

/** Map a raw fixture item including league { id, name } — used by /headtohead
 *  where history spans multiple competitions, not just the World Cup. */
export function mapFixtureWithLeague(raw: RawFixtureItem): WorldCupH2HFixture {
  return {
    ...mapFixture(raw),
    league: { id: raw.league.id, name: raw.league.name },
  }
}

/** Map a raw team item to the flat shape served by GET /teams.
 *  Drops founded, national, address, capacity, surface, image. */
export function mapTeam(raw: RawTeamItem): WorldCupTeam {
  return {
    id: raw.team.id,
    name: raw.team.name,
    code: raw.team.code,
    country: raw.team.country,
    logo: raw.team.logo,
    venue: {
      id: raw.venue.id,
      name: raw.venue.name,
      city: raw.venue.city,
    },
  }
}
