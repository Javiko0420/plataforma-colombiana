// @vitest-environment node
import { afterAll, describe, expect, it, vi } from 'vitest'
import jwt from 'jsonwebtoken'

vi.stubEnv('JWT_SECRET', 'synthetic-test-key-used-only-in-isolated-unit-tests')
const { signAccessToken, verifyAccessToken, hashRefreshToken, generateRefreshToken } = await import('@/lib/mobile-jwt')
afterAll(() => vi.unstubAllEnvs())

describe('real mobile JWT verification', () => {
  const payload = { sub: 'test-user', email: 'test@example.com', role: 'USER', hasCompletedProfile: true }

  it('accepts a genuine local token and rejects tampering', () => {
    const token = signAccessToken(payload)
    expect(verifyAccessToken(token)).toMatchObject(payload)
    const parts = token.split('.')
    parts[1] = Buffer.from(JSON.stringify({ ...payload, role: 'ADMIN' })).toString('base64url')
    expect(() => verifyAccessToken(parts.join('.'))).toThrow()
  })

  it.each([
    { issuer: 'wrong-issuer', audience: 'mobile', expiresIn: 60 },
    { issuer: 'latinterritory', audience: 'wrong-audience', expiresIn: 60 },
    { issuer: 'latinterritory', audience: 'mobile', expiresIn: -1 },
  ])('rejects invalid issuer, audience or expiration', options => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, options)
    expect(() => verifyAccessToken(token)).toThrow()
  })

  it('keeps random refresh tokens distinct and stores only deterministic hashes', () => {
    const first = generateRefreshToken()
    const second = generateRefreshToken()
    expect(first).not.toBe(second)
    expect(hashRefreshToken(first)).toHaveLength(64)
    expect(hashRefreshToken(first)).not.toBe(first)
    expect(hashRefreshToken(first)).toBe(hashRefreshToken(first))
  })
})
