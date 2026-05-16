"use client"

import * as React from 'react'
import { topColombiaCities, internationalCities } from '@/lib/cities'
import { useTranslations } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils'
import { SunMotif } from '@/components/lt/SunMotif'
import { LeafSprig } from '@/components/lt/LeafSprig'
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline'
import { Squiggle } from '@/components/lt/Squiggle'

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

function MiniChart({ points }: { points: WeatherBundle['next24h'] }) {
  const values = points.map(p => p.temperatureC)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1, max - min)
  return (
    <div className="mt-4 grid grid-cols-12 gap-1" aria-label="Pronóstico 24 horas">
      {points.slice(0, 24).map((p, i) => {
        const h = 24 + ((p.temperatureC - min) / range) * 56
        const hour = new Date(p.time).getHours().toString().padStart(2, '0')
        return (
          <div key={i} className="flex flex-col items-center">
            <div className="h-20 flex items-end">
              <div
                className="w-2 rounded-sm"
                style={{ height: `${h}px`, background: 'var(--lt-terracota)', opacity: 0.8 }}
                aria-label={`${hour}:00, ${Math.round(p.temperatureC)} °C`}
              />
            </div>
            <span className="mt-1 text-[10px]" style={{ color: 'var(--lt-ink-soft)' }}>{hour}h</span>
          </div>
        )
      })}
    </div>
  )
}

function CityWeatherCard({ city }: { city: { slug: string; name: string; country?: string } }) {
  const { data, loading, error } = useWeather(`city=${encodeURIComponent(city.slug)}`)

  return (
    <div
      className="rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)] p-4 transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <h3 className="font-bold text-base" style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}>
            {city.name}
          </h3>
          {city.country && (
            <span className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>{city.country}</span>
          )}
        </div>
        {loading && (
          <span className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>Cargando…</span>
        )}
      </div>

      {error && (
        <p className="text-sm" style={{ color: 'var(--lt-terracota)' }}>{error}</p>
      )}

      {data && (
        <div className="text-sm">
          <div className="flex gap-4 items-start">
            <div
              className="text-3xl font-black"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-terracota)' }}
            >
              {Math.round(data.current.temperatureC)}°C
            </div>
            <div className="flex flex-col gap-0.5" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
              <span className="font-medium" style={{ color: 'var(--lt-ink)' }}>{data.current.weatherTextEs}</span>
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
        setMeQuery(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&ts=${Date.now()}`)
        setMeGeoLoading(false)
      },
      (err) => {
        setMeGeoError(
          err.code === err.PERMISSION_DENIED
            ? t('weather.permissionDenied', 'Permiso de ubicación denegado')
            : t('weather.permissionError', 'No se pudo obtener tu ubicación')
        )
        setMeGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }, [t])

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden border-b-[2px] border-[var(--lt-ink)] py-14 px-4"
        style={{ background: 'var(--lt-paper)' }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <SunMotif size={280} className="absolute opacity-[0.07]" style={{ top: '-40px', right: '-20px' }} />
          <LeafSprig size={90} className="absolute opacity-20" style={{ bottom: '8px', left: '12px', transform: 'rotate(-18deg)' }} />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <h1
            className="text-3xl md:text-4xl font-black mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('weather.title', 'Clima en Colombia')}
          </h1>
          <HandDrawnUnderline width={160} color="var(--lt-sun-core)" thickness={2.5} aria-hidden="true" />
        </div>
      </div>

      <main className={cn('mx-auto max-w-6xl px-4 py-10 space-y-12')}>

        {/* Tu ciudad */}
        <section aria-labelledby="my-city-title">
          <h2
            id="my-city-title"
            className="text-xl font-bold mb-4"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('weather.yourCity', 'Tu ciudad')}
          </h2>
          <div
            className="rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)] p-5"
            style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
          >
            <div className="flex items-center gap-4 flex-wrap">
              {(meLoading || meGeoLoading) && (
                <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
                  {t('weather.detecting', 'Detectando tu ubicación…')}
                </p>
              )}
              <button
                type="button"
                onClick={onUseLocation}
                className="inline-flex items-center justify-center px-4 py-2 rounded-[var(--lt-radius-pill)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
                style={{
                  background: 'var(--lt-terracota)',
                  color: 'var(--lt-paper)',
                  boxShadow: 'var(--lt-shadow-sticker)',
                  fontFamily: 'var(--lt-font-sans)',
                }}
              >
                {t('weather.useLocation', 'Usar mi ubicación')}
              </button>
            </div>

            {meGeoError && (
              <p className="mt-2 text-sm" style={{ color: 'var(--lt-terracota)' }}>{meGeoError}</p>
            )}

            {!meLoading && !meGeoLoading && !meData && !meGeoError && (
              <p className="mt-2 text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
                {t('weather.unavailable', 'No fue posible obtener tu ubicación por IP. Puedes consultar las ciudades principales abajo.')}
              </p>
            )}

            {meData && (
              <div className="mt-4">
                <div className="flex gap-6 items-start">
                  <div
                    className="text-5xl font-black"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-terracota)' }}
                  >
                    {Math.round(meData.current.temperatureC)}°C
                  </div>
                  <div style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
                    <div className="text-base font-semibold" style={{ color: 'var(--lt-ink)' }}>
                      {meData.current.weatherTextEs}
                    </div>
                    <div className="mt-1 text-sm">
                      {t('weather.feelsLike', 'Sensación')}: {Math.round(meData.current.feelsLikeC)}°C ·{' '}
                      {t('weather.humidity', 'Humedad')}: {Math.round(meData.current.humidityPercent)}%
                    </div>
                  </div>
                </div>
                <MiniChart points={meData.next24h} />
              </div>
            )}
          </div>
        </section>

        {/* Ciudades Colombia */}
        <section aria-labelledby="colombia-title">
          <h2
            id="colombia-title"
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('weather.topCities', 'Principales ciudades de Colombia')}
          </h2>
          <Squiggle width={160} color="var(--lt-terracota)" amplitude={3} className="mb-5" aria-hidden="true" />
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {topColombiaCities.map(c => (
              <CityWeatherCard key={c.slug} city={c} />
            ))}
          </div>
        </section>

        {/* Ciudades internacionales */}
        <section aria-labelledby="intl-title">
          <h2
            id="intl-title"
            className="text-xl font-bold mb-1"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('weather.internationalCities', 'Ciudades internacionales')}
          </h2>
          <p className="text-sm mb-2" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
            {t('weather.internationalDesc', 'Para colombianos en el exterior')}
          </p>
          <Squiggle width={160} color="var(--lt-verde)" amplitude={3} className="mb-5" aria-hidden="true" />
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {internationalCities.map(c => (
              <CityWeatherCard key={c.slug} city={c} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
