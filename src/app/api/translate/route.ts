import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { translateText, type SupportedLang } from '@/lib/translation'
import { checkRateLimit, rateLimitHeaders, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'

function mapToDeepLLang(input: string): SupportedLang {
  const norm = input.toLowerCase()
  if (norm.startsWith('en')) return 'EN'
  if (norm.startsWith('es')) return 'ES'
  if (norm.startsWith('pt')) return 'PT'
  if (norm.startsWith('fr')) return 'FR'
  if (norm.startsWith('de')) return 'DE'
  if (norm.startsWith('it')) return 'IT'
  if (norm.startsWith('nl')) return 'NL'
  if (norm.startsWith('pl')) return 'PL'
  if (norm.startsWith('ja')) return 'JA'
  if (norm.startsWith('ko')) return 'KO'
  return 'EN'
}

const bodySchema = z.object({
  text: z.union([z.string(), z.array(z.string())]).refine(v => (Array.isArray(v) ? v.length > 0 : v.trim().length > 0), 'text is required'),
  target: z.string().min(2),
  source: z.string().min(2).optional(),
})

export async function POST(request: NextRequest) {
  // Rate limit compartido en Redis: cada traducción consume cuota de DeepL,
  // así que el abuso cuesta dinero real. El bucket en memoria anterior no
  // servía en serverless (cada invocación arrancaba con el contador a cero).
  const limit = await checkRateLimit('translate', getClientIp(request))
  if (!limit.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(limit) }
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }
  const { text, target } = parsed.data

  try {
    // Auto-detect contenido HTML para conservar etiquetas y formato
    const containsHtml = (v: string) => /<[^>]+>/.test(v)
    const isHtml = Array.isArray(text)
      ? (text as string[]).some(containsHtml)
      : containsHtml(text as string)

    const translated = await translateText(
      text as string | string[],
      mapToDeepLLang(target),
      isHtml
        ? { tagHandling: 'html', splitSentences: 'nonewlines', preserveFormatting: true }
        : undefined
    )
    return NextResponse.json({ success: true, data: { translated } })
  } catch {
    return NextResponse.json({ success: false, error: 'Translation failed' }, { status: 502 })
  }
}


