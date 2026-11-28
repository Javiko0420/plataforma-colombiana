import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getMessages, isSupportedLocale, getDefaultLocale } from '@/lib/i18n'
import { translateText, type SupportedLang } from '@/lib/translation'

// DeepL SDK requiere Node runtime
export const runtime = 'nodejs'

const querySchema = z.object({
  locale: z.string().optional(),
})

function mapLocaleToDeepL(locale: string): SupportedLang {
  switch (locale) {
    case 'en':
      return 'EN'
    case 'es':
      return 'ES'
    default:
      return 'EN'
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const parseResult = querySchema.safeParse({ locale: searchParams.get('locale') ?? undefined })
  if (!parseResult.success) {
    return NextResponse.json({ success: false, error: 'Invalid query params' }, { status: 400 })
  }

  const queryLocale = parseResult.data.locale
  const locale = isSupportedLocale(queryLocale) ? queryLocale : getDefaultLocale()

  const messages = { ...getMessages(locale) }

  if (locale !== getDefaultLocale()) {
    const baseMessages = getMessages(getDefaultLocale())
    const missingKeys = Object.keys(baseMessages).filter((k) => messages[k] === undefined)
    if (missingKeys.length > 0) {
      const target = mapLocaleToDeepL(locale)
      try {
        const translatedList = await Promise.all(
          missingKeys.map(async (key) => {
            const sourceText = baseMessages[key]
            try {
              const translated = await translateText(sourceText, target)
              return [key, typeof translated === 'string' ? translated : sourceText] as const
            } catch {
              return [key, sourceText] as const
            }
          })
        )
        for (const [k, v] of translatedList) {
          messages[k] = v
        }
      } catch {}
    }
  }

  const response = NextResponse.json({ success: true, data: { locale, messages } })
  response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=60')
  return response
}
