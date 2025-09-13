import * as deepl from 'deepl-node'

const provider = (process.env.TRANSLATION_PROVIDER ?? 'deepl').toLowerCase()
if (provider !== 'deepl') {
  throw new Error(`Proveedor de traducción no soportado: ${provider}`)
}

const apiKey = process.env.DEEPL_API_KEY || process.env.TRANSLATION_API_KEY

/**
 * FREE → https://api-free.deepl.com/v2
 * PRO  → https://api.deepl.com/v2
 */
const serverUrl = process.env.DEEPL_API_URL
const translator = apiKey
  ? new deepl.Translator(apiKey, serverUrl ? { serverUrl } : undefined)
  : undefined

const DEFAULT_TIMEOUT = Number(process.env.TRANSLATION_TIMEOUT_MS ?? 8000)

/** Variantes de idioma recomendadas por DeepL */
export type SupportedLang =
  | 'ES' | 'EN' | 'EN-GB' | 'EN-US' | 'PT' | 'PT-BR' | 'PT-PT'
  | 'FR' | 'DE' | 'IT' | 'NL' | 'PL' | 'JA' | 'KO'

/** Normaliza genéricos a variantes por defecto (forma minúscula requerida por SDK) */
const normalizeLang = (lang: SupportedLang): deepl.TargetLanguageCode => {
  switch (lang) {
    case 'EN': return 'en-GB'
    case 'PT': return 'pt-BR'
    default:   return (lang as string).toLowerCase() as deepl.TargetLanguageCode
  }
}

/** Timeout real con Promise.race (la SDK no usa AbortController) */
function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id)
        reject(new Error(`Timeout de traducción tras ${ms}ms`))
      }, ms)
    })
  ])
}

type TranslateOpts = {
  tagHandling?: 'html' | 'xml'
  splitSentences?: 'on' | 'off' | 'nonewlines'
  preserveFormatting?: boolean
  glossaryId?: string
  formality?: 'default' | 'more' | 'less'
}

/** Traducción de string o string[] (batch) + opciones avanzadas */
export async function translateText(
  text: string | string[],
  targetLang: SupportedLang,
  opts?: TranslateOpts
): Promise<string | string[]> {
  if (typeof text === 'string' && !text.trim()) return text
  if (Array.isArray(text) && text.length === 0) return text

  const lang = normalizeLang(targetLang)
  const options: deepl.TranslateTextOptions = {
    tagHandling: opts?.tagHandling,
    splitSentences: opts?.splitSentences as deepl.SentenceSplittingMode | undefined,
    preserveFormatting: opts?.preserveFormatting,
    glossary: opts?.glossaryId,
    formality: opts?.formality as deepl.Formality | undefined,
  }

  try {
    if (!translator) throw new Error('DeepL no está configurado (falta API key)')
    const result = await withTimeout(
      translator.translateText(text as string | string[], null, lang, options) as Promise<deepl.TextResult | deepl.TextResult[]>,
      DEFAULT_TIMEOUT
    )

    if (Array.isArray(result)) return result.map(r => r.text)
    return result.text
  } catch (err) {
    const anyErr = err as { status?: number; code?: number; message?: string }
    const code = anyErr?.status ?? anyErr?.code
    if (code === 456) throw new Error('Cuota de DeepL excedida (456)')
    if (code === 403) throw new Error('No autorizado a DeepL (403). Verifica la API key y el endpoint')
    throw new Error(`Error de traducción: ${anyErr?.message ?? String(err)}`)
  }
}