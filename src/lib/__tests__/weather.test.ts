import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchWeather } from '@/lib/weather'

function buildOpenMeteoResponse(nowIso: string) {
  const start = new Date(nowIso)
  const times: string[] = []
  for (let i = 0; i < 48; i++) {
    const d = new Date(start.getTime() + i * 60 * 60 * 1000)
    times.push(d.toISOString().slice(0, 13) + ':00:00.000Z')
  }
  return {
    current: {
      temperature_2m: 20,
      apparent_temperature: 21,
      relative_humidity_2m: 60,
      pressure_msl: 1012,
      wind_speed_10m: 10,
      wind_direction_10m: 180,
      weather_code: 0,
    },
    hourly: {
      time: times,
      temperature_2m: Array.from({ length: 48 }, (_, i) => 18 + i * 0.1),
      apparent_temperature: Array.from({ length: 48 }, (_, i) => 19 + i * 0.1),
      precipitation_probability: Array.from({ length: 48 }, () => 20),
      precipitation: Array.from({ length: 48 }, () => 0),
      relative_humidity_2m: Array.from({ length: 48 }, () => 65),
      wind_speed_10m: Array.from({ length: 48 }, () => 12),
      wind_direction_10m: Array.from({ length: 48 }, () => 200),
      weather_code: Array.from({ length: 48 }, () => 0),
    }
  }
}

describe('fetchWeather', () => {
  const realFetch = global.fetch

  beforeEach(() => {
    vi.useFakeTimers()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
    global.fetch = realFetch
    vi.restoreAllMocks()
  })

  it('returns current and next 24h points and caches results', async () => {
    const now = new Date('2024-01-01T00:00:00.000Z')
    vi.setSystemTime(now)

    const responseJson = buildOpenMeteoResponse(now.toISOString())
    ;(global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => responseJson,
    })

    const lat = 4.711
    const lon = -74.072

    const data1 = await fetchWeather(lat, lon, { currentTtlSec: 300, forecastTtlSec: 1800 })
    expect(data1.current.temperatureC).toBe(20)
    expect(data1.current.weatherTextEs).toBeTypeOf('string')
    expect(data1.next24h.length).toBe(24)

    // second call should hit cache (no additional fetch)
    const data2 = await fetchWeather(lat, lon, { currentTtlSec: 300, forecastTtlSec: 1800 })
    expect(data2.next24h.length).toBe(24)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})


