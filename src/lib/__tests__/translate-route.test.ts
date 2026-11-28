// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  translateText: vi.fn(),
  checkRateLimit: vi.fn(),
}))

vi.mock('@/lib/translation', () => ({ translateText: mocks.translateText }))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: mocks.checkRateLimit,
  rateLimitHeaders: () => ({ 'Retry-After': '60' }),
  getClientIp: () => '203.0.113.7',
}))

import { POST as translate } from '@/app/api/translate/route'
import { MAX_TRANSLATE_CHARS, MAX_TRANSLATE_ITEMS } from '@/lib/translation-limits'
import * as i18nMessagesRoute from '@/app/api/i18n/messages/route'

function request(body: unknown) {
  return new NextRequest('http://localhost/api/translate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.checkRateLimit.mockResolvedValue({ success: true, retryAfter: 0, limit: 20, remaining: 19 })
  mocks.translateText.mockImplementation(async (text: string | string[]) => text)
})

describe('POST /api/translate size limits (each call spends DeepL quota)', () => {
  it('translates a normal request', async () => {
    const res = await translate(request({ text: 'Hola comunidad', target: 'en' }))
    expect(res.status).toBe(200)
    expect(mocks.translateText).toHaveBeenCalledTimes(1)
  })

  it('accepts text exactly at the character limit', async () => {
    const res = await translate(request({ text: 'a'.repeat(MAX_TRANSLATE_CHARS), target: 'en' }))
    expect(res.status).toBe(200)
  })

  it('rejects a single text over the character limit without calling DeepL', async () => {
    const res = await translate(request({ text: 'a'.repeat(MAX_TRANSLATE_CHARS + 1), target: 'en' }))
    expect(res.status).toBe(400)
    expect(mocks.translateText).not.toHaveBeenCalled()
  })

  it('rejects an array whose combined length exceeds the limit', async () => {
    const part = 'a'.repeat(Math.ceil(MAX_TRANSLATE_CHARS / 2) + 1)
    const res = await translate(request({ text: [part, part], target: 'en' }))
    expect(res.status).toBe(400)
    expect(mocks.translateText).not.toHaveBeenCalled()
  })

  it('rejects more items than allowed', async () => {
    const res = await translate(request({ text: Array(MAX_TRANSLATE_ITEMS + 1).fill('hola'), target: 'en' }))
    expect(res.status).toBe(400)
    expect(mocks.translateText).not.toHaveBeenCalled()
  })

  it('still applies the rate limit before reading the body', async () => {
    mocks.checkRateLimit.mockResolvedValue({ success: false, retryAfter: 60, limit: 20, remaining: 0 })
    const res = await translate(request({ text: 'hola', target: 'en' }))
    expect(res.status).toBe(429)
    expect(mocks.translateText).not.toHaveBeenCalled()
  })
})

describe('/api/i18n/messages', () => {
  it('does not expose an arbitrary-text translation POST', () => {
    expect('POST' in i18nMessagesRoute).toBe(false)
  })
})
