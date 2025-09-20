import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchFixtures } from '@/lib/football'

describe('football client', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    process.env.API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io'
    process.env.API_FOOTBALL_KEY = 'test-key'
    process.env.API_FOOTBALL_USE_RAPIDAPI = 'false'
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('parses fixtures response and returns simplified list', async () => {
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        response: [
          {
            fixture: { id: 123, date: '2025-01-01T20:00:00Z', status: { short: '1H', elapsed: 23 } },
            league: { id: 123, name: 'Liga', country: 'CO' },
            teams: { home: { id: 1, name: 'Local' }, away: { id: 2, name: 'Visita' } },
            goals: { home: 1, away: 0 }
          }
        ]
      })
    })

    const out = await fetchFixtures({ live: 'all', timezone: 'America/Bogota' })
    expect(out.length).toBe(1)
    expect(out[0].home.name).toBe('Local')
    expect(out[0].elapsed).toBe(23)
  })
})


