type WeatherCode = number

export type CurrentWeather = {
  temperatureC: number
  feelsLikeC: number
  humidityPercent: number
  pressureHpa: number | null
  windSpeedKmh: number
  windDirectionDeg: number
  weatherCode: WeatherCode
  weatherTextEs: string
}

export type HourlyPoint = {
  time: string // ISO string
  temperatureC: number
  feelsLikeC: number
  precipitationMm: number
  precipitationProbPercent: number | null
  windSpeedKmh: number
  windDirectionDeg: number
  weatherCode: WeatherCode
}

export type WeatherBundle = {
  current: CurrentWeather
  next24h: HourlyPoint[]
}

// Minimal WMO weather code mapping (ES). Can expand later and i18n-ize.
const WMO_ES: Record<number, string> = {
  0: 'Despejado',
  1: 'Mayormente despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla con escarcha',
  51: 'Llovizna ligera',
  53: 'Llovizna',
  55: 'Llovizna intensa',
  56: 'Llovizna gélida ligera',
  57: 'Llovizna gélida intensa',
  61: 'Lluvia ligera',
  63: 'Lluvia',
  65: 'Lluvia intensa',
  66: 'Lluvia gélida ligera',
  67: 'Lluvia gélida intensa',
  71: 'Nieve ligera',
  73: 'Nieve',
  75: 'Nieve intensa',
  77: 'Granos de nieve',
  80: 'Chubascos ligeros',
  81: 'Chubascos',
  82: 'Chubascos intensos',
  85: 'Chubascos de nieve ligeros',
  86: 'Chubascos de nieve intensos',
  95: 'Tormenta',
  96: 'Tormenta con granizo ligero',
  99: 'Tormenta con granizo intenso'
}

function mapCodeEs(code: number): string {
  return WMO_ES[code] ?? 'Condición desconocida'
}

// Simple in-memory cache for edge/server runtime
type CacheValue = { ts: number; ttlMs: number; value: WeatherBundle }
const weatherCache = new Map<string, CacheValue>()

function cacheKey(lat: number, lon: number): string {
  // Round to 3 decimals to increase hit rate while keeping location fidelity (~100m)
  const rlat = Math.round(lat * 1000) / 1000
  const rlon = Math.round(lon * 1000) / 1000
  return `${rlat},${rlon}`
}

export type FetchWeatherOptions = {
  // TTLs in seconds
  currentTtlSec?: number
  forecastTtlSec?: number
}

// Default TTLs: current 10m, forecast 60m
const DEFAULT_TTLS = { currentTtlSec: 600, forecastTtlSec: 3600 }

export async function fetchWeather(lat: number, lon: number, opts?: FetchWeatherOptions): Promise<WeatherBundle> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('Invalid coordinates')
  }
  const { currentTtlSec, forecastTtlSec } = { ...DEFAULT_TTLS, ...opts }
  const ttlMs = Math.min(currentTtlSec, forecastTtlSec) * 1000
  const key = cacheKey(lat, lon)
  const now = Date.now()
  const cached = weatherCache.get(key)
  if (cached && now - cached.ts < cached.ttlMs) {
    return cached.value
  }

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code'
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code'
    ].join(','),
    timezone: 'auto',
  })

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error('Weather provider error')
  }
  const json = await res.json()

  // Current
  const c = json.current ?? {}
  const current: CurrentWeather = {
    temperatureC: Number(c.temperature_2m ?? 0),
    feelsLikeC: Number(c.apparent_temperature ?? c.temperature_2m ?? 0),
    humidityPercent: Number(c.relative_humidity_2m ?? 0),
    pressureHpa: c.pressure_msl != null ? Number(c.pressure_msl) : null,
    windSpeedKmh: Number(c.wind_speed_10m ?? 0),
    windDirectionDeg: Number(c.wind_direction_10m ?? 0),
    weatherCode: Number(c.weather_code ?? 0),
    weatherTextEs: mapCodeEs(Number(c.weather_code ?? 0))
  }

  // Hourly → take next 24h from now
  const h = json.hourly ?? {}
  const times: string[] = (h.time as string[]) ?? []
  const nowIso = new Date().toISOString()
  const next24h: HourlyPoint[] = []
  for (let i = 0; i < times.length; i++) {
    const t = times[i]
    if (t >= nowIso) {
      next24h.push({
        time: t,
        temperatureC: numberAt(h.temperature_2m, i),
        feelsLikeC: numberAt(h.apparent_temperature, i),
        precipitationMm: numberAt(h.precipitation, i),
        precipitationProbPercent: nullableNumberAt(h.precipitation_probability, i),
        windSpeedKmh: numberAt(h.wind_speed_10m, i),
        windDirectionDeg: numberAt(h.wind_direction_10m, i),
        weatherCode: numberAt(h.weather_code, i)
      })
      if (next24h.length >= 24) break
    }
  }

  const bundle: WeatherBundle = { current, next24h }
  weatherCache.set(key, { ts: now, ttlMs, value: bundle })
  return bundle
}

function numberAt(arr: unknown, idx: number): number {
  const v = Array.isArray(arr) ? arr[idx] : undefined
  return v != null ? Number(v) : 0
}

function nullableNumberAt(arr: unknown, idx: number): number | null {
  const v = Array.isArray(arr) ? arr[idx] : undefined
  return v != null ? Number(v) : null
}


