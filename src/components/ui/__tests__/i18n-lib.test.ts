import { describe, it, expect } from 'vitest'
import { translate, getMessages } from '@/lib/i18n'

describe('i18n lib', () => {
  it('gets messages for locales', () => {
    expect(getMessages('es')['app.name']).toBeDefined()
    expect(getMessages('en')['app.name']).toBeDefined()
  })

  it('translate falls back to key when missing', () => {
    const key = 'missing.key.example'
    expect(translate(key, { locale: 'en' })).toBe(key)
  })
})


