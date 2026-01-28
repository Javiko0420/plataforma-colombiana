"use client"

import * as React from 'react'
import { topColombiaCities, internationalCities } from '@/lib/cities'
import { useTranslations } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils'

type WeatherBundle = {
  current: {
    temperatureC: number
    feelsLikeC: number
    humidityPercent: number
    pressureHpa: number | null
    windSpeedKmh: number
    windDirectionDeg: number
    weatherCode: number
    weatherTextEs: string
  }
  next24h: Array<{
    time: string
    temperatureC: number
    feelsLikeC: number
    precipitationMm: number
    precipitationProbPercent: number | null
    windSpeedKmh: number
    windDirectionDeg: number
    weatherCode: number
  }>
}

function useWeather(params: string) {
  const [data, setData] = React.useState<WeatherBundle | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/weather?${params}`).then(async (r) => {
      if (!r.ok) throw new Error('Failed')
      const j = await r.json()
      if (!cancelled) {
        if (j?.success) setData(j.data)
        else setError(j?.error ?? 'Error')
      }
    }).catch(() => !cancelled && setError('Error')).finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [params])

  return { data, loading, error }
}

function CityWeatherCard({ city }: { city: { slug: string; name: string; country?: string } }) {
  const { data, loading, error } = useWeather(`city=${encodeURIComponent(city.slug)}`)

  return (
    <div className="rounded-xl border p-4 bg-white dark:bg-gray-800">
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{city.name}</h3>
          {city.country && <span className="text-xs text-gray-500 dark:text-gray-400">{city.country}</span>}
        </div>
        {loading && <span className="text-xs text-gray-500">Cargando…</span>}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data && (
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex gap-4">
            <div className="text-2xl font-bold">{Math.round(data.current.temperatureC)}°C</div>
            <div className="flex flex-col gap-1">
              <span>{data.current.weatherTextEs}</span>
              <span>Sensación: {Math.round(data.current.feelsLikeC)}°C</span>
              <span>Humedad: {Math.round(data.current.humidityPercent)}%</span>
            </div>
          </div>
          <MiniChart points={data.next24h} />
        </div>
      )}
    </div>
  )
}

function MiniChart({ points }: { points: WeatherBundle['next24h'] }) {
  // simple bar/line hybrid using divs; accessible labels only
  const values = points.map(p => p.temperatureC)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  return (
    <div className="mt-4 grid grid-cols-12 gap-1" aria-label="Pronóstico 24 horas">
      {points.slice(0, 24).map((p, i) => {
        const h = 24 + ((p.temperatureC - min) / range) * 56 // 24–80px
        const hour = new Date(p.time).getHours().toString().padStart(2, '0')
        return (
          <div key={i} className="flex flex-col items-center">
            <div className="h-20 flex items-end">
              <div className="w-2 rounded bg-blue-500" style={{ height: `${h}px` }} aria-label={`${hour}:00, ${Math.round(p.temperatureC)} °C`} />
            </div>
            <span className="mt-1 text-[10px] text-gray-500">{hour}h</span>
          </div>
        )
      })}
    </div>
  )
}

export default function WeatherPage() {
  const { t } = useTranslations()
  const [meQuery, setMeQuery] = React.useState('me=1')
  const [meGeoLoading, setMeGeoLoading] = React.useState(false)
  const [meGeoError, setMeGeoError] = React.useState<string | null>(null)
  const { data: meData, loading: meLoading } = useWeather(meQuery)

  const onUseLocation = React.useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setMeGeoError(t('weather.permissionError', 'No se pudo obtener tu ubicación'))
      return
    }
    setMeGeoLoading(true)
    setMeGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        setMeQuery(`lat=${lat}&lon=${lon}&ts=${Date.now()}`)
        setMeGeoLoading(false)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setMeGeoError(t('weather.permissionDenied', 'Permiso de ubicación denegado'))
        } else {
          setMeGeoError(t('weather.permissionError', 'No se pudo obtener tu ubicación'))
        }
        setMeGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }, [t])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('weather.title', 'Clima en Colombia')}</h1>

      {/* Tu ciudad */}
      <section className="mt-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('weather.yourCity', 'Tu ciudad')}</h2>
        <div className={cn("mt-3", "rounded-xl border p-4", "bg-white dark:bg-gray-800")}> 
          <div className="flex items-center justify-between">
            {(meLoading || meGeoLoading) && <p className="text-sm text-gray-500">{t('weather.detecting', 'Detectando tu ubicación…')}</p>}
            <button
              type="button"
              onClick={onUseLocation}
              className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              {t('weather.useLocation', 'Usar mi ubicación')}
            </button>
          </div>
          {meGeoError && <p className="mt-2 text-sm text-red-600">{meGeoError}</p>}
          {!meLoading && !meGeoLoading && !meData && !meGeoError && (
            <p className="text-sm text-gray-500">{t('weather.unavailable', 'No fue posible obtener tu ubicación por IP. Puedes consultar las ciudades principales abajo.')}</p>
          )}
          {meData && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <div className="flex gap-6 items-start">
                <div className="text-5xl font-extrabold">{Math.round(meData.current.temperatureC)}°C</div>
                <div>
                  <div className="text-base font-medium">{meData.current.weatherTextEs}</div>
                  <div className="mt-1 text-gray-500">{t('weather.feelsLike', 'Sensación')}: {Math.round(meData.current.feelsLikeC)}°C · {t('weather.humidity', 'Humedad')}: {Math.round(meData.current.humidityPercent)}%</div>
                </div>
              </div>
              <MiniChart points={meData.next24h} />
            </div>
          )}
        </div>
      </section>

      {/* Principales ciudades Colombia */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('weather.topCities', 'Principales ciudades de Colombia')}</h2>
        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {topColombiaCities.map(c => (
            <CityWeatherCard key={c.slug} city={c} />
          ))}
        </div>
      </section>

      {/* Ciudades internacionales */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('weather.internationalCities', 'Ciudades internacionales')}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('weather.internationalDesc', 'Para colombianos en el exterior')}</p>
        <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {internationalCities.map(c => (
            <CityWeatherCard key={c.slug} city={c} />
          ))}
        </div>
      </section>
    </main>
  )
}


