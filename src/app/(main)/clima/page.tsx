"use client"

import * as React from 'react'
import { topColombiaCities, internationalCities } from '@/lib/cities'
import { useTranslations } from '@/components/providers/language-provider'
import { MapPin } from 'lucide-react'
import { PageHeader } from '@/components/lh/PageHeader'

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
                style={{ width: 8, borderRadius: 3, height: `${h}px`, background: 'var(--lh-warm)', opacity: 0.85 }}
                aria-label={`${hour}:00, ${Math.round(p.temperatureC)} °C`}
              />
            </div>
            <span className="mt-1" style={{ fontSize: 10, color: 'var(--lh-fg3)' }}>{hour}h</span>
          </div>
        )
      })}
    </div>
  )
}

function CityWeatherCard({ city }: { city: { slug: string; name: string; country?: string } }) {
  const { data, loading, error } = useWeather(`city=${encodeURIComponent(city.slug)}`)

  return (
    <div className="lh-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 16, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>{city.name}</h3>
          {city.country && <span style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>{city.country}</span>}
        </div>
        {loading && <span style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>Cargando…</span>}
      </div>

      {error && <p style={{ fontSize: 14, color: 'var(--lh-terra)' }}>{error}</p>}

      {data && (
        <div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontFamily: 'var(--lh-font)', fontSize: 32, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--lh-warm)' }}>
              {Math.round(data.current.temperatureC)}°C
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13.5, color: 'var(--lh-fg2)' }}>
              <span style={{ fontWeight: 600, color: 'var(--lh-fg)' }}>{data.current.weatherTextEs}</span>
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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>

      <PageHeader
        eyebrow="Tu ciudad hoy"
        title={t('weather.title', 'Clima en Colombia')}
        accent="var(--lh-warm)"
      />

      <main className="lh-container" style={{ maxWidth: 1100, paddingTop: 40, paddingBottom: 64, display: 'flex', flexDirection: 'column', gap: 48 }}>

        {/* Tu ciudad */}
        <section aria-labelledby="my-city-title">
          <h2 id="my-city-title" style={{ fontFamily: 'var(--lh-font)', fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', marginBottom: 16 }}>
            {t('weather.yourCity', 'Tu ciudad')}
          </h2>
          <div className="lh-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {(meLoading || meGeoLoading) && (
                <p style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>{t('weather.detecting', 'Detectando tu ubicación…')}</p>
              )}
              <button type="button" onClick={onUseLocation} className="lh-btn lh-btn--sm lh-btn--primary">
                <MapPin size={15} /> {t('weather.useLocation', 'Usar mi ubicación')}
              </button>
            </div>

            {meGeoError && <p style={{ marginTop: 8, fontSize: 14, color: 'var(--lh-terra)' }}>{meGeoError}</p>}

            {!meLoading && !meGeoLoading && !meData && !meGeoError && (
              <p style={{ marginTop: 8, fontSize: 14, color: 'var(--lh-fg3)' }}>
                {t('weather.unavailable', 'No fue posible obtener tu ubicación por IP. Puedes consultar las ciudades principales abajo.')}
              </p>
            )}

            {meData && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: 'var(--lh-font)', fontSize: 48, fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1, color: 'var(--lh-warm)' }}>
                    {Math.round(meData.current.temperatureC)}°C
                  </div>
                  <div style={{ color: 'var(--lh-fg2)' }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--lh-fg)' }}>{meData.current.weatherTextEs}</div>
                    <div style={{ marginTop: 4, fontSize: 14 }}>
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
          <h2 id="colombia-title" style={{ fontFamily: 'var(--lh-font)', fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', marginBottom: 16 }}>
            {t('weather.topCities', 'Principales ciudades de Colombia')}
          </h2>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {topColombiaCities.map(c => (
              <CityWeatherCard key={c.slug} city={c} />
            ))}
          </div>
        </section>

        {/* Ciudades internacionales */}
        <section aria-labelledby="intl-title">
          <h2 id="intl-title" style={{ fontFamily: 'var(--lh-font)', fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', marginBottom: 6 }}>
            {t('weather.internationalCities', 'Ciudades internacionales')}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--lh-fg2)', marginBottom: 16 }}>
            {t('weather.internationalDesc', 'Para colombianos en el exterior')}
          </p>
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
