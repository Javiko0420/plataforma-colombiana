import { fetchStandings, resolveSeasonForLeague } from '@/lib/football'
import { getDefaultStandingsLeagues } from '@/lib/leagues'

export type StandingsRefreshResult = {
  leagueId: number
  season: number
  rows: number
  ok: boolean
}

export async function refreshDefaultStandings(): Promise<{
  refreshed: number
  total: number
  results: StandingsRefreshResult[]
}> {
  const leagues = getDefaultStandingsLeagues((key) => key)
  const results: StandingsRefreshResult[] = []

  for (const lg of leagues) {
    try {
      const season = await resolveSeasonForLeague(lg.id)
      const table = await fetchStandings(lg.id, season)
      results.push({
        leagueId: lg.id,
        season,
        rows: table.length,
        ok: table.length > 0,
      })
      await new Promise((r) => setTimeout(r, 250))
    } catch {
      results.push({ leagueId: lg.id, season: 0, rows: 0, ok: false })
    }
  }

  return {
    refreshed: results.filter((r) => r.ok).length,
    total: leagues.length,
    results,
  }
}
