import { describe, it, expect } from 'vitest'
import {
  favoriteStationInputSchema,
  bulkFavoritesSchema,
} from '@/lib/validations/radio-favorite'

const valid = {
  stationId: 'aaaa-1111',
  name: 'Test FM',
  streamUrl: 'https://example.com/a.mp3',
}

describe('favoriteStationInputSchema', () => {
  it('accepts minimal valid payload', () => {
    const parsed = favoriteStationInputSchema.safeParse(valid)
    expect(parsed.success).toBe(true)
  })

  it('rejects http (non-https) stream urls', () => {
    const parsed = favoriteStationInputSchema.safeParse({
      ...valid,
      streamUrl: 'http://example.com/a.mp3',
    })
    expect(parsed.success).toBe(false)
  })

  it('uppercases countryCode', () => {
    const parsed = favoriteStationInputSchema.safeParse({ ...valid, countryCode: 'co' })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.countryCode).toBe('CO')
  })

  it('rejects invalid countryCode shape', () => {
    const parsed = favoriteStationInputSchema.safeParse({ ...valid, countryCode: 'COL' })
    expect(parsed.success).toBe(false)
  })

  it('rejects oversized name', () => {
    const parsed = favoriteStationInputSchema.safeParse({ ...valid, name: 'x'.repeat(201) })
    expect(parsed.success).toBe(false)
  })

  it('rejects more than 20 tags', () => {
    const parsed = favoriteStationInputSchema.safeParse({
      ...valid,
      tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
    })
    expect(parsed.success).toBe(false)
  })
})

describe('bulkFavoritesSchema', () => {
  it('accepts an array under the cap', () => {
    const parsed = bulkFavoritesSchema.safeParse({ stations: [valid, valid] })
    expect(parsed.success).toBe(true)
  })

  it('rejects more than 50 entries', () => {
    const parsed = bulkFavoritesSchema.safeParse({
      stations: Array.from({ length: 51 }, () => valid),
    })
    expect(parsed.success).toBe(false)
  })
})
