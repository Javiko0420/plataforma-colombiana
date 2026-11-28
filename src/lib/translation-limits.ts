import { z } from 'zod'

/**
 * Every character sent to /api/translate is billed against the DeepL quota.
 * The UI and the mobile app translate short UI strings, so these caps only
 * block abuse (the rate limit alone still allowed multi-MB bodies).
 */
export const MAX_TRANSLATE_CHARS = 5000
export const MAX_TRANSLATE_ITEMS = 50

const totalLength = (text: string | string[]): number =>
  Array.isArray(text) ? text.reduce((sum, t) => sum + t.length, 0) : text.length

export const translateBodySchema = z.object({
  text: z
    .union([z.string(), z.array(z.string()).max(MAX_TRANSLATE_ITEMS)])
    .refine(v => (Array.isArray(v) ? v.length > 0 : v.trim().length > 0), 'text is required')
    .refine(v => totalLength(v) <= MAX_TRANSLATE_CHARS, `text exceeds ${MAX_TRANSLATE_CHARS} characters`),
  target: z.string().min(2),
  source: z.string().min(2).optional(),
})
