"use client"

import * as React from 'react'
import { useTranslations } from '@/components/providers/language-provider'
import { POPULAR_CURRENCIES } from '@/lib/exchange-rate'
import { SunMotif } from '@/components/lt/SunMotif'
import { LeafSprig } from '@/components/lt/LeafSprig'
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline'
import { Squiggle } from '@/components/lt/Squiggle'

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

  const selectClass = [
    'w-full px-3 py-2.5 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)]',
    'outline-none text-sm transition-all focus:ring-2 focus:ring-[var(--lt-terracota)] cursor-pointer',
  ].join(' ')

  return (
    <div
      className="rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)] p-6 relative overflow-hidden"
      style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
    >
      <div aria-hidden="true" className="absolute right-4 top-4 opacity-[0.06]">
        <SunMotif size={96} />
      </div>

      <h2
        className="text-xl font-bold mb-5 relative"
        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
      >
        {t('rates.converter.title', 'Convertidor de Monedas')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        <div>
          <label
            htmlFor="from-currency"
            className="block text-xs font-bold uppercase tracking-wide mb-1.5"
            style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
          >
            {t('rates.converter.from', 'De')}
          </label>
          <select
            id="from-currency"
            value={fromCurrency}
            onChange={e => setFromCurrency(e.target.value)}
            className={selectClass}
            style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)', fontFamily: 'var(--lt-font-sans)' }}
          >
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
            className={`mt-2 ${selectClass} text-lg font-bold`}
            style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)', fontFamily: 'var(--lt-font-serif)' }}
            placeholder="0.00"
            min="0"
          />
        </div>

        <div>
          <label
            htmlFor="to-currency"
            className="block text-xs font-bold uppercase tracking-wide mb-1.5"
            style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
          >
            {t('rates.converter.to', 'A')}
          </label>
          <select
            id="to-currency"
            value={toCurrency}
            onChange={e => setToCurrency(e.target.value)}
            className={selectClass}
            style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)', fontFamily: 'var(--lt-font-sans)' }}
          >
            {Object.entries(CURRENCY_INFO).map(([code, info]) => (
              <option key={code} value={code}>{code} — {info.name}</option>
            ))}
          </select>
          <div
            className="mt-2 w-full px-3 py-2.5 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-lg font-black"
            style={{
              background: 'var(--lt-bg)',
              color: 'var(--lt-terracota)',
              fontFamily: 'var(--lt-font-serif)',
            }}
            aria-live="polite"
            aria-label={`Resultado: ${result !== null ? result.toFixed(2) : '0.00'} ${toCurrency}`}
          >
            {result !== null ? result.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {result !== null && (
        <div
          className="mt-4 p-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-sm"
          style={{ background: 'var(--lt-bg)', fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          <strong style={{ color: 'var(--lt-ink)' }}>
            {parseFloat(amount).toLocaleString()} {fromCurrency}
          </strong>{' '}
          ={' '}
          <strong style={{ color: 'var(--lt-terracota)' }}>
            {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
          </strong>
        </div>
      )}
    </div>
  )
}

function RateCard({ currency, rate, baseCurrency }: { currency: string; rate: number; baseCurrency: string }) {
  const info = CURRENCY_INFO[currency] || { code: currency, name: currency, symbol: currency }
  const CARD_ROTATIONS = [-1.5, 1.2, -0.8, 1.5, -1.2, 0.9, -1.4, 1.1]
  const idx = Object.keys(CURRENCY_INFO).indexOf(currency)
  const rotation = CARD_ROTATIONS[Math.abs(idx) % CARD_ROTATIONS.length]

  return (
    <div
      className="rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)] p-4 transition-all hover:-translate-y-1"
      style={{
        background: 'var(--lt-paper)',
        boxShadow: 'var(--lt-shadow-sticker)',
        transform: `rotate(${rotation}deg)`,
      }}
      data-lt-rotate="true"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-2xl font-black"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-terracota)' }}
            >
              {info.symbol}
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: 'var(--lt-ink)', fontFamily: 'var(--lt-font-sans)' }}
            >
              {currency}
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
            {info.name}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-lg font-black"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {rate.toFixed(4)}
          </p>
          <p className="text-xs" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
            1 {baseCurrency}
          </p>
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
            {t('rates.title', 'Tasas de Cambio')}
          </h1>
          <HandDrawnUnderline width={160} color="var(--lt-sun-core)" thickness={2.5} className="mb-3" aria-hidden="true" />
          <p className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
            {t('rates.subtitle', 'Consulta las tasas de cambio del peso colombiano')}
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10">

        {/* Loading */}
        {loading && (
          <div
            className="rounded-[var(--lt-radius-lg)] border-[2px] border-[var(--lt-ink)] p-10 text-center"
            style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
          >
            <SunMotif size={56} className="mx-auto mb-3 animate-spin opacity-60" style={{ animationDuration: '1.4s' }} />
            <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
              {t('rates.loading', 'Cargando tasas…')}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)] p-6"
            style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
            role="alert"
          >
            <p className="font-bold mb-1" style={{ fontFamily: 'var(--lt-font-serif)' }}>
              {t('rates.error', 'No se pudieron cargar las tasas de cambio')}
            </p>
            <p className="text-sm opacity-90" style={{ fontFamily: 'var(--lt-font-sans)' }}>{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Convertidor */}
            <section className="mb-10" aria-labelledby="converter-title">
              <h2 id="converter-title" className="sr-only">Convertidor de monedas</h2>
              <CurrencyConverter rates={data} />
            </section>

            {/* Tasas */}
            <section aria-labelledby="rates-title">
              <div className="flex items-center justify-between mb-4">
                <h2
                  id="rates-title"
                  className="text-xl font-bold"
                  style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                >
                  {showAllCurrencies
                    ? t('rates.allCurrencies', 'Todas las monedas')
                    : t('rates.popularCurrencies', 'Monedas populares')}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                  className="text-sm font-semibold transition-colors hover:opacity-80 focus:outline-none focus:underline"
                  style={{ color: 'var(--lt-terracota)', fontFamily: 'var(--lt-font-sans)' }}
                >
                  {showAllCurrencies
                    ? t('rates.viewPopular', 'Ver monedas populares')
                    : t('rates.viewAll', 'Ver todas las monedas')}
                </button>
              </div>

              <Squiggle width={160} color="var(--lt-sun-core)" amplitude={3} className="mb-6" aria-hidden="true" />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedRates.map(([code, rate]) => (
                  <RateCard key={code} currency={code} rate={rate} baseCurrency={data.baseCurrency} />
                ))}
              </div>

              {/* Última actualización */}
              <div
                className="mt-8 p-4 rounded-[var(--lt-radius-md)] border-[1.6px] border-[var(--lt-ink)]"
                style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
              >
                <p className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
                  <strong style={{ color: 'var(--lt-ink)' }}>
                    {t('rates.lastUpdate', 'Última actualización')}:
                  </strong>{' '}
                  {new Date(data.lastUpdate).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
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
