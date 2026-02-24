"use client"

import * as React from 'react'
import { useTranslations } from '@/components/providers/language-provider'
import { POPULAR_CURRENCIES } from '@/lib/exchange-rate'

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

// Currency information for display
const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  COP: { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  USD: { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  GBP: { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
  CAD: { code: 'CAD', name: 'Dólar Canadiense', symbol: '$' },
  AUD: { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$' },
  MXN: { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  BRL: { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  ARS: { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  CLP: { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  JPY: { code: 'JPY', name: 'Yen Japonés', symbol: '¥' },
  CNY: { code: 'CNY', name: 'Yuan Chino', symbol: '¥' },
}

function useExchangeRates(base: string = 'COP') {
  const [data, setData] = React.useState<ExchangeRates | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    
    fetch(`/api/tasas?base=${encodeURIComponent(base)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Failed to fetch rates')
        const json = await r.json()
        if (!cancelled) {
          if (json?.success) {
            setData(json.data)
          } else {
            setError(json?.error ?? 'Error')
          }
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
    if (!Number.isFinite(amountNum) || amountNum < 0) {
      setResult(null)
      return
    }

    // Perform conversion
    if (rates.baseCurrency === fromCurrency) {
      const rate = rates.rates[toCurrency]
      if (rate) {
        setResult(amountNum * rate)
      }
    } else if (rates.baseCurrency === toCurrency) {
      const rate = rates.rates[fromCurrency]
      if (rate) {
        setResult(amountNum / rate)
      }
    } else {
      // Cross-currency conversion
      const fromRate = rates.rates[fromCurrency]
      const toRate = rates.rates[toCurrency]
      if (fromRate && toRate) {
        const inBase = amountNum / fromRate
        setResult(inBase * toRate)
      }
    }
  }, [amount, fromCurrency, toCurrency, rates])

  React.useEffect(() => {
    handleConvert()
  }, [handleConvert])

  return (
    <div className="rounded-xl border p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t('rates.converter.title', 'Convertidor de Monedas')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From */}
        <div>
          <label htmlFor="from-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('rates.converter.from', 'De')}
          </label>
          <select
            id="from-currency"
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(CURRENCY_INFO).map(([code, info]) => (
              <option key={code} value={code}>
                {code} - {info.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-lg font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        {/* To */}
        <div>
          <label htmlFor="to-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('rates.converter.to', 'A')}
          </label>
          <select
            id="to-currency"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(CURRENCY_INFO).map(([code, info]) => (
              <option key={code} value={code}>
                {code} - {info.name}
              </option>
            ))}
          </select>
          <div className="mt-2 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {result !== null ? result.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>

      {result !== null && (
        <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300">
          <strong>{parseFloat(amount).toLocaleString()} {fromCurrency}</strong> = <strong>{result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}</strong>
        </div>
      )}
    </div>
  )
}

function RateCard({ currency, rate, baseCurrency }: { currency: string; rate: number; baseCurrency: string }) {
  const info = CURRENCY_INFO[currency] || { code: currency, name: currency, symbol: currency }
  
  return (
    <div className="rounded-lg border p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{info.symbol}</span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{currency}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{info.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {rate.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
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
        const indexA = POPULAR_CURRENCIES.indexOf(a[0] as typeof POPULAR_CURRENCIES[number])
        const indexB = POPULAR_CURRENCIES.indexOf(b[0] as typeof POPULAR_CURRENCIES[number])
        return indexA - indexB
      })
  }, [data, showAllCurrencies])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {t('rates.title', 'Tasas de Cambio')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('rates.subtitle', 'Consulta las tasas de cambio del peso colombiano')}
        </p>
      </div>

      {loading && (
        <div className="rounded-xl border p-8 bg-white dark:bg-gray-800 text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('rates.loading', 'Cargando tasas...')}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 p-6 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400 font-medium">{t('rates.error', 'No se pudieron cargar las tasas de cambio')}</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-500">{error}</p>
        </div>
      )}

      {data && (
        <>
          {/* Currency Converter */}
          <section className="mb-8">
            <CurrencyConverter rates={data} />
          </section>

          {/* Exchange Rates */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {showAllCurrencies 
                  ? t('rates.allCurrencies', 'Todas las monedas')
                  : t('rates.popularCurrencies', 'Monedas populares')}
              </h2>
              <button
                type="button"
                onClick={() => setShowAllCurrencies(!showAllCurrencies)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium focus:outline-none focus:underline"
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

            {/* Last update info */}
            <div className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t('rates.lastUpdate', 'Última actualización')}:</strong>{' '}
                {new Date(data.lastUpdate).toLocaleString('es-CO', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                {t('rates.disclaimer', 'Las tasas son referenciales y pueden variar según el proveedor financiero.')}
              </p>
            </div>
          </section>
        </>
      )}
    </main>
  )
}

