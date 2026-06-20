'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cloud, MapPin } from 'lucide-react'

/* Respuesta de /api/weather (solo los campos que el widget usa). */
interface WeatherResponse {
  success: boolean
  data?: {
    current: { temperatureC: number; weatherTextEs: string }
    next24h: Array<{ temperatureC: number }>
  }
  location?: { city: string; country: string | null } | null
}

interface WeatherData {
  temp: number
  desc: string
  city: string | null
  hi: number | null
  lo: number | null
}

const cardStyle: React.CSSProperties = {
  display: 'block', borderRadius: 20, padding: 22,
  background: 'var(--lh-surface)', border: '1px solid var(--lh-border)',
  boxShadow: 'var(--lh-shadow)', transition: '.26s', textDecoration: 'none',
}

export function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/weather?me=1')
      .then(res => res.json())
      .then((json: WeatherResponse) => {
        if (!active) return
        if (json?.success && json.data) {
          const temps = json.data.next24h?.map(p => p.temperatureC) ?? []
          setData({
            temp: Math.round(json.data.current.temperatureC),
            desc: json.data.current.weatherTextEs,
            city: json.location?.city ?? null,
            hi: temps.length ? Math.round(Math.max(...temps)) : null,
            lo: temps.length ? Math.round(Math.min(...temps)) : null,
          })
        } else setError(true)
      })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  return (
    <Link
      href="/clima"
      style={cardStyle}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lh-fg3)' }}>Clima</span>
        <Cloud size={20} style={{ color: 'var(--lh-warm)' }} aria-hidden="true" />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        <span style={{ fontSize: 46, fontWeight: 600, letterSpacing: '-.03em', lineHeight: 1, color: 'var(--lh-fg)' }}>
          {data ? `${data.temp}°` : '—'}
        </span>
        <span style={{ color: 'var(--lh-fg2)', fontSize: 14, paddingBottom: 8 }}>
          {error ? 'No disponible' : data ? data.desc : 'Cargando…'}
        </span>
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--lh-fg2)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <MapPin size={13} style={{ flexShrink: 0 }} aria-hidden="true" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data?.city ?? 'Tu ubicación'}</span>
        </span>
        {data?.hi != null && data?.lo != null && <span>↑{data.hi}° ↓{data.lo}°</span>}
      </div>
    </Link>
  )
}
