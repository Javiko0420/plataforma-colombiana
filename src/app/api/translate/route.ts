import { NextRequest, NextResponse } from 'next/server'
// Reemplazamos express-rate-limit por un bucket en memoria compatible con NextRequest
import { z } from 'zod'
import { translateText, type SupportedLang } from '@/lib/translation'

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000)
const MAX_REQS = Number(process.env.RATE_LIMIT_MAX || 100)
const bucket = new Map<string, { count: number; ts: number }>()

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
  // Simple rate limit
  const key = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const now = Date.now()
  const rec = bucket.get(key)
  if (!rec || now - rec.ts > WINDOW_MS) {
    bucket.set(key, { count: 1, ts: now })
  } else {
    rec.count += 1
    if (rec.count > MAX_REQS) {
      return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 })
    }
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


