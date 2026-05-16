import { z } from 'zod'

/**
 * Shared Zod schema for FavoriteStation payloads. Centralized so both
 * single-add and bulk-import endpoints stay in sync with the database
 * constraints declared in `prisma/schema.prisma`.
 */

const HTTPS_URL = z
  .string()
  .trim()
  .url()
  .refine(v => v.startsWith('https://'), {
    message: 'streamUrl must be HTTPS (mixed-content protection)',
  })

const OPTIONAL_HTTPS_URL = z
  .string()
  .trim()
  .url()
  .refine(v => v.startsWith('https://'), {
    message: 'URL must be HTTPS',
  })
  .optional()

export const favoriteStationInputSchema = z.object({
  stationId: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(200),
  streamUrl: HTTPS_URL,
  homepage: OPTIONAL_HTTPS_URL,
  logoUrl: OPTIONAL_HTTPS_URL,
  country: z.string().trim().max(80).optional(),
  countryCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{2}$/u)
    .transform(v => v.toUpperCase())
    .optional(),
  language: z.string().trim().max(40).optional(),
  codec: z.string().trim().max(20).optional(),
  bitrate: z.number().int().positive().max(2048).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
})

export type FavoriteStationInputDTO = z.infer<typeof favoriteStationInputSchema>

export const bulkFavoritesSchema = z.object({
  stations: z.array(favoriteStationInputSchema).max(50),
})
