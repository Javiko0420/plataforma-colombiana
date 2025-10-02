/**
 * Exchange Rate API integration
 * Supports both free and paid tiers of ExchangeRate-API
 * Free tier: https://open.exchangerate-api.com/v6/latest/{currency}
 * Paid tier: https://v6.exchangerate-api.com/v6/{API_KEY}/latest/{currency}
 */

export type ExchangeRates = {
  baseCurrency: string
  lastUpdate: string // ISO timestamp
  rates: Record<string, number>
}

export type ExchangeRateResult = {
  success: boolean
  data?: ExchangeRates
  error?: string
}

// Popular currencies to display for Colombian users
export const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'MXN', 'BRL', 'ARS', 'CLP', 'JPY', 'CNY'] as const

// Simple in-memory cache for edge/server runtime
type CacheValue = { ts: number; ttlMs: number; value: ExchangeRates }
const ratesCache = new Map<string, CacheValue>()

function cacheKey(baseCurrency: string): string {
  return baseCurrency.toUpperCase()
}

export type FetchExchangeRatesOptions = {
  // TTL in seconds, default 1 hour (rates don't change that often)
  ttlSec?: number
}

const DEFAULT_TTL_SEC = 3600 // 1 hour

/**
 * Fetches exchange rates from ExchangeRate-API
 * Uses free tier if no API key is provided
 * @param baseCurrency - ISO 4217 currency code (e.g., COP, USD)
 * @param opts - Options including TTL
 */
export async function fetchExchangeRates(
  baseCurrency: string = 'COP',
  opts?: FetchExchangeRatesOptions
): Promise<ExchangeRates> {
  const { ttlSec = DEFAULT_TTL_SEC } = opts || {}
  const ttlMs = ttlSec * 1000
  const key = cacheKey(baseCurrency)
  const now = Date.now()
  
  // Check cache
  const cached = ratesCache.get(key)
  if (cached && now - cached.ts < cached.ttlMs) {
    return cached.value
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY
  const currency = baseCurrency.toUpperCase()

  // Use paid tier if API key is available, otherwise use free tier
  const url = apiKey
    ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${currency}`
    : `https://open.exchangerate-api.com/v6/latest/${currency}`

  try {
    const res = await fetch(url, { 
      cache: 'no-store',
      next: { revalidate: ttlSec }
    })

    if (!res.ok) {
      throw new Error(`Exchange rate API returned ${res.status}`)
    }

    const json = await res.json()

    // Check API-specific errors
    if (json.result === 'error') {
      throw new Error(json['error-type'] || 'API error')
    }

    // Support both API response formats:
    // - Paid tier uses 'conversion_rates'
    // - Free tier uses 'rates'
    const ratesData = json.conversion_rates || json.rates

    // Validate response structure
    if (!json.base_code || !ratesData || !json.time_last_update_unix) {
      throw new Error('Invalid API response structure')
    }

    const rates: ExchangeRates = {
      baseCurrency: json.base_code,
      lastUpdate: new Date(json.time_last_update_unix * 1000).toISOString(),
      rates: ratesData
    }

    // Cache the result
    ratesCache.set(key, { ts: now, ttlMs, value: rates })

    return rates
  } catch (error) {
    // If we have stale cache data, return it rather than failing
    if (cached) {
      return cached.value
    }
    throw error
  }
}

/**
 * Convert an amount from one currency to another
 * @param amount - Amount to convert
 * @param from - Source currency code
 * @param to - Target currency code
 * @param rates - Exchange rates object
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates
): number {
  const fromUpper = from.toUpperCase()
  const toUpper = to.toUpperCase()

  // If base currency matches source, direct conversion
  if (rates.baseCurrency === fromUpper) {
    const toRate = rates.rates[toUpper]
    if (!toRate) throw new Error(`Currency ${toUpper} not found in rates`)
    return amount * toRate
  }

  // If base currency matches target, inverse conversion
  if (rates.baseCurrency === toUpper) {
    const fromRate = rates.rates[fromUpper]
    if (!fromRate) throw new Error(`Currency ${fromUpper} not found in rates`)
    return amount / fromRate
  }

  // Cross-currency conversion (from -> base -> to)
  const fromRate = rates.rates[fromUpper]
  const toRate = rates.rates[toUpper]
  
  if (!fromRate) throw new Error(`Currency ${fromUpper} not found in rates`)
  if (!toRate) throw new Error(`Currency ${toUpper} not found in rates`)

  // Convert to base currency first, then to target
  const inBase = amount / fromRate
  return inBase * toRate
}

/**
 * Get a subset of rates for popular currencies
 */
export function getPopularRates(rates: ExchangeRates): Record<string, number> {
  const popular: Record<string, number> = {}
  
  for (const currency of POPULAR_CURRENCIES) {
    if (rates.rates[currency]) {
      popular[currency] = rates.rates[currency]
    }
  }
  
  return popular
}

/**
 * Format a currency amount with proper localization
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'es-CO'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: string, locale: string = 'es-CO'): string {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })
    
    // Extract symbol from formatted string
    const parts = formatter.formatToParts(0)
    const symbolPart = parts.find(p => p.type === 'currency')
    return symbolPart?.value || currency
  } catch {
    return currency
  }
}

