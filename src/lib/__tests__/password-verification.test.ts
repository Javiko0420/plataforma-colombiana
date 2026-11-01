// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import bcrypt from 'bcryptjs'
import { PasswordSecurity } from '@/lib/password-security'

describe('real bcrypt password verification', () => {
  it('accepts only the matching password for a real hash', async () => {
    const hash = await bcrypt.hash('Synthetic-password-42!', 10)
    expect(await PasswordSecurity.verifyPassword('Synthetic-password-42!', hash)).toBe(true)
    expect(await PasswordSecurity.verifyPassword('Synthetic-wrong-input', hash)).toBe(false)
  })

  it.each(['', 'not-a-bcrypt-hash', '$2b$12$incomplete'])('rejects absent or malformed hashes', async hash => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(await PasswordSecurity.verifyPassword('Synthetic-password-42!', hash)).toBe(false)
    } finally {
      quiet.mockRestore()
    }
  })
})
