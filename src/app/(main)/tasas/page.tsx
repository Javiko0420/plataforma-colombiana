"use client"

import * as React from 'react'
import { useTranslations } from '@/components/providers/language-provider'
import { POPULAR_CURRENCIES } from '@/lib/exchange-rate'
import { PageHeader } from '@/components/lh/PageHeader'

type ExchangeRates = {
  baseCurrency: string
  lastUpdate: string
  rates: Record<string, number>
}

type CurrencyInfo = {
  code: string
  name: string
  symbol: string
}

const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  COP: { code: 'COP', name: 'Peso Colombiano',      symbol: '$' },
  USD: { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro',                 symbol: '€' },
  GBP: { code: 'GBP', name: 'Libra Esterlina',      symbol: '£' },
  CAD: { code: 'CAD', name: 'Dólar Canadiense',     symbol: '$' },
  AUD: { code: 'AUD', name: 'Dólar Australiano',    symbol: 'A$' },
  MXN: { code: 'MXN', name: 'Peso Mexicano',        symbol: '$' },
  BRL: { code: 'BRL', name: 'Real Brasileño',       symbol: 'R$' },
  ARS: { code: 'ARS', name: 'Peso Argentino',       symbol: '$' },
  CLP: { code: 'CLP', name: 'Peso Chileno',         symbol: '$' },
  JPY: { code: 'JPY', name: 'Yen Japonés',          symbol: '¥' },
  CNY: { code: 'CNY', name: 'Yuan Chino',           symbol: '¥' },
}

function useExchangeRates(base = 'COP') {
  const [data, setData] = React.useState<ExchangeRates | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/tasas?base=${encodeURIComponent(base)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed')
        const json = await r.json()
        if (!cancelled) {
          if (json?.success) setData(json.data)
          else setError(json?.error ?? 'Error')
        }
      })
      .catch(() => !cancelled && setError('Error'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [base])

  return { data, loading, error }
}

function CurrencyConverter({ rates }: { rates: ExchangeRates }) {
  const { t } = useTranslations()
  const [fromCurrency, setFromCurrency] = React.useState('AUD')
  const [toCurrency, setToCurrency] = React.useState('COP')
  const [amount, setAmount] = React.useState('1')
  const [result, setResult] = React.useState<number | null>(null)

  const handleConvert = React.useCallback(() => {
    const amountNum = parseFloat(amount)
    if (!Number.isFinite(amountNum) || amountNum < 0) { setResult(null); return }

    if (rates.baseCurrency === fromCurrency) {
      const rate = rates.rates[toCurrency]
      if (rate) setResult(amountNum * rate)
    } else if (rates.baseCurrency === toCurrency) {
      const rate = rates.rates[fromCurrency]
      if (rate) setResult(amountNum / rate)
    } else {
      const fromRate = rates.rates[fromCurrency]
      const toRate = rates.rates[toCurrency]
      if (fromRate && toRate) setResult((amountNum / fromRate) * toRate)
    }
  }, [amount, fromCurrency, toCurrency, rates])

  React.useEffect(() => { handleConvert() }, [handleConvert])

  const fieldLabel: React.CSSProperties = {
    display: 'block', fontFamily: 'var(--lh-mono)', fontSize: 11, fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--lh-fg3)', marginBottom: 7,
  }

  return (
    <div className="lh-card" style={{ padding: 24 }}>
      <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 20px' }}>
        {t('rates.converter.title', 'Convertidor de Monedas')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="from-currency" style={fieldLabel}>{t('rates.converter.from', 'De')}</label>
          <select id="from-currency" value={fromCurrency} onChange={e => setFromCurrency(e.target.value)} className="lh-input">
            {Object.entries(CURRENCY_INFO).map(([code, info]) => (
              <option key={code} value={code}>{code} — {info.name}</option>
            ))}
          </select>
          <label htmlFor="conv-amount" className="sr-only">Monto a convertir</label>
          <input
            id="conv-amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="lh-input"
            style={{ marginTop: 8, fontSize: 18, fontWeight: 700 }}
            placeholder="0.00"
            min="0"
          />
        </div>

        <div>
          <label htmlFor="to-currency" style={fieldLabel}>{t('rates.converter.to', 'A')}</label>
          <select id="to-currency" value={toCurrency} onChange={e => setToCurrency(e.target.value)} className="lh-input">
            {Object.entries(CURRENCY_INFO).map(([code, info]) => (
              <option key={code} value={code}>{code} — {info.name}</option>
            ))}
          </select>
          <div
            style={{ marginTop: 8, width: '100%', padding: '12px 16px', borderRadius: 15, border: '1px solid var(--lh-border)', background: 'var(--lh-surface2)', fontSize: 18, fontWeight: 700, color: 'var(--lh-green)', fontFamily: 'var(--lh-font)' }}
            aria-live="polite"
            aria-label={`Resultado: ${result !== null ? result.toFixed(2) : '0.00'} ${toCurrency}`}
          >
            {result !== null ? result.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {result !== null && (
        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 13, border: '1px solid var(--lh-border)', background: 'var(--lh-surface2)', fontSize: 14, color: 'var(--lh-fg2)' }}>
          <strong style={{ color: 'var(--lh-fg)', fontWeight: 600 }}>
            {parseFloat(amount).toLocaleString()} {fromCurrency}
          </strong>{' '}={' '}
          <strong style={{ color: 'var(--lh-green)', fontWeight: 600 }}>
            {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
          </strong>
        </div>
      )}
    </div>
  )
}

function RateCard({ currency, rate, baseCurrency }: { currency: string; rate: number; baseCurrency: string }) {
  const info = CURRENCY_INFO[currency] || { code: currency, name: currency, symbol: currency }

  return (
    <div className="lh-card lh-card--interactive" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'var(--lh-font)', fontSize: 24, fontWeight: 700, color: 'var(--lh-green)' }}>{info.symbol}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--lh-fg)' }}>{currency}</span>
          </div>
          <p style={{ marginTop: 2, fontSize: 12, color: 'var(--lh-fg3)' }}>{info.name}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 700, letterSpacing: '-.01em', color: 'var(--lh-fg)', margin: 0 }}>{rate.toFixed(4)}</p>
          <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: 0 }}>1 {baseCurrency}</p>
        </div>
      </div>
    </div>
  )
}

export default function ExchangeRatesPage() {
  const { t } = useTranslations()
  const [showAllCurrencies, setShowAllCurrencies] = React.useState(false)
  const { data, loading, error } = useExchangeRates('COP')

  const displayedRates = React.useMemo(() => {
    if (!data) return []
    if (showAllCurrencies) {
      return Object.entries(data.rates).sort((a, b) => a[0].localeCompare(b[0]))
    }
    return Object.entries(data.rates)
      .filter(([code]) => POPULAR_CURRENCIES.includes(code as typeof POPULAR_CURRENCIES[number]))
      .sort((a, b) => {
        const ia = POPULAR_CURRENCIES.indexOf(a[0] as typeof POPULAR_CURRENCIES[number])
        const ib = POPULAR_CURRENCIES.indexOf(b[0] as typeof POPULAR_CURRENCIES[number])
        return ia - ib
      })
  }, [data, showAllCurrencies])

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>

      <PageHeader
        eyebrow="Tasas al instante"
        title={t('rates.title', 'Tasas de Cambio')}
        subtitle={t('rates.subtitle', 'Consulta las tasas de cambio del peso colombiano')}
        accent="var(--lh-green)"
      />

      <main className="lh-container" style={{ maxWidth: 1100, paddingTop: 40, paddingBottom: 64 }}>

        {/* Loading */}
        {loading && (
          <div className="lh-card" style={{ padding: 40, textAlign: 'center' }}>
            <span className="animate-spin" style={{ display: 'inline-block', width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--lh-border)', borderTopColor: 'var(--lh-green)', marginBottom: 12 }} aria-hidden="true" />
            <p style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>{t('rates.loading', 'Cargando tasas…')}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div role="alert" style={{ padding: '18px 20px', borderRadius: 16, background: 'color-mix(in oklch, var(--lh-terra) 12%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)' }}>
            <p style={{ fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 3px' }}>
              {t('rates.error', 'No se pudieron cargar las tasas de cambio')}
            </p>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: 0 }}>{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Convertidor */}
            <section style={{ marginBottom: 40 }} aria-labelledby="converter-title">
              <h2 id="converter-title" className="sr-only">Convertidor de monedas</h2>
              <CurrencyConverter rates={data} />
            </section>

            {/* Tasas */}
            <section aria-labelledby="rates-title">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
                <h2 id="rates-title" style={{ fontFamily: 'var(--lh-font)', fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>
                  {showAllCurrencies
                    ? t('rates.allCurrencies', 'Todas las monedas')
                    : t('rates.popularCurrencies', 'Monedas populares')}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                  style={{ fontSize: 14, fontWeight: 600, color: 'var(--lh-accent)', background: 'transparent', border: 0, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {showAllCurrencies
                    ? t('rates.viewPopular', 'Ver monedas populares')
                    : t('rates.viewAll', 'Ver todas las monedas')}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedRates.map(([code, rate]) => (
                  <RateCard key={code} currency={code} rate={rate} baseCurrency={data.baseCurrency} />
                ))}
              </div>

              {/* Última actualización */}
              <div className="lh-card" style={{ marginTop: 28, padding: 18 }}>
                <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: 0 }}>
                  <strong style={{ color: 'var(--lh-fg)', fontWeight: 600 }}>
                    {t('rates.lastUpdate', 'Última actualización')}:
                  </strong>{' '}
                  {new Date(data.lastUpdate).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p style={{ marginTop: 4, fontSize: 12.5, color: 'var(--lh-fg3)' }}>
                  {t('rates.disclaimer', 'Las tasas son referenciales y pueden variar según el proveedor financiero.')}
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
