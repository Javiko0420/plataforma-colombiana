'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeftRight } from 'lucide-react'

/* Monedas mostradas en el widget (las mismas que el mock original). */
const WIDGET_CURRENCIES = ['COP', 'MXN', 'ARS', 'CLP'] as const

interface RatesResponse {
  success: boolean
  data?: { baseCurrency: string; lastUpdate: string; rates: Record<string, number> }
}

/* Formato: sin decimales para valores grandes (COP, ARS, CLP), 2 para pequeños (MXN). */
function formatRate(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value)
}

const cardStyle: React.CSSProperties = {
  display: 'block', borderRadius: 20, padding: 22,
  background: 'var(--lh-surface)', border: '1px solid var(--lh-border)',
  boxShadow: 'var(--lh-shadow)', transition: '.26s', textDecoration: 'none',
}

export function RatesWidget() {
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/tasas?base=AUD')
      .then(res => res.json())
      .then((json: RatesResponse) => {
        if (!active) return
        if (json?.success && json.data?.rates) setRates(json.data.rates)
        else setError(true)
      })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  return (
    <Link
      href="/tasas"
      style={cardStyle}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lh-fg3)' }}>Cambio · AUD</span>
        <ArrowLeftRight size={20} style={{ color: 'var(--lh-green)' }} aria-hidden="true" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        {WIDGET_CURRENCIES.map(code => {
          const value = rates?.[code]
          return (
            <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, fontWeight: 600, color: 'var(--lh-fg2)', background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)', padding: '3px 7px', borderRadius: 6 }}>{code}</span>
                <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lh-fg)' }}>
                  {error ? '—' : value != null ? formatRate(value) : '…'}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </Link>
  )
}
