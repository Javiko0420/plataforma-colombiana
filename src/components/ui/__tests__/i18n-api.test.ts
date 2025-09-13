import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/i18n/messages/route'

describe('i18n API', () => {
  it('returns messages for valid locale', async () => {
    const req = new NextRequest('http://localhost/api/i18n/messages?locale=en')
    const res = await GET(req)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.locale).toBe('en')
    expect(json.data.messages['app.name']).toBeDefined()
  })

  it('falls back to default locale for invalid locale', async () => {
    const req = new NextRequest('http://localhost/api/i18n/messages?locale=fr')
    const res = await GET(req)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data.locale).toBe('es')
  })
})


