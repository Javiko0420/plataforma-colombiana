import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { fetchExchangeRates, getPopularRates, convertCurrency } from '@/lib/exchange-rate'

export const runtime = 'edge'

const querySchema = z.object({
  base: z.string().optional().default('COP'),
  target: z.string().optional(),
  amount: z.string().optional(),
  popular: z.string().optional(), // '1' to get only popular currencies
})

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams))
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { base, target, amount, popular } = parsed.data

    // Validate currency codes (ISO 4217 format: 3 uppercase letters)
    const currencyRegex = /^[A-Z]{3}$/
    if (!currencyRegex.test(base.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid base currency code' },
        { status: 400 }
      )
    }

    if (target && !currencyRegex.test(target.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: 'Invalid target currency code' },
        { status: 400 }
      )
    }

    // Fetch exchange rates
    const rates = await fetchExchangeRates(base, {
      ttlSec: 3600 // 1 hour cache
    })

    // If conversion is requested
    if (target && amount) {
      const amountNum = parseFloat(amount)
      if (!Number.isFinite(amountNum) || amountNum < 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid amount' },
          { status: 400 }
        )
      }

      try {
        const converted = convertCurrency(amountNum, base, target, rates)
        return NextResponse.json({
          success: true,
          data: {
            from: {
              currency: base.toUpperCase(),
              amount: amountNum
            },
            to: {
              currency: target.toUpperCase(),
              amount: converted
            },
            rate: rates.rates[target.toUpperCase()],
            lastUpdate: rates.lastUpdate
          }
        })
      } catch (conversionError) {
        return NextResponse.json(
          { 
            success: false, 
            error: conversionError instanceof Error ? conversionError.message : 'Conversion failed' 
          },
          { status: 400 }
        )
      }
    }

    // Return rates (popular only if requested)
    const responseRates = popular === '1' ? getPopularRates(rates) : rates.rates

    return NextResponse.json({
      success: true,
      data: {
        baseCurrency: rates.baseCurrency,
        lastUpdate: rates.lastUpdate,
        rates: responseRates
      }
    })
  } catch (error) {
    console.error('Exchange rates API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch exchange rates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 502 }
    )
  }
}

