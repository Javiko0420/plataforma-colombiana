// @vitest-environment node
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { encode } from 'next-auth/jwt'

const db = vi.hoisted(() => ({ findUnique: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ prisma: { user: { findUnique: db.findUnique } } }))
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: vi.fn() }))
vi.mock('jsonwebtoken', () => ({ default: { sign: () => 'synthetic-apple-client-secret' } }))

import { authOptions } from '@/lib/auth'

const secret = 'synthetic-nextauth-key-used-only-for-local-regressions'
vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000')
vi.stubEnv('NEXTAUTH_SECRET', secret)
afterAll(() => vi.unstubAllEnvs())

beforeEach(() => {
  db.findUnique.mockReset()
  db.findUnique.mockResolvedValue({
    id: 'user-1', email: 'current@example.com', name: 'Current Name', image: null,
    role: 'USER', isActive: true, isBanned: false,
    dateOfBirth: new Date('1990-01-01'), contractAcceptedAt: new Date('2026-01-01'),
  })
})

async function actualSession() {
  const cookie = await encode({
    secret,
    token: { sub: 'user-1', email: 'stale@example.com', role: 'ADMIN', hasCompletedProfile: true },
    maxAge: 86400,
  })
  const req = {
    cookies: { 'next-auth.session-token': cookie }, headers: { host: 'localhost:3000' },
  } as unknown as NextApiRequest
  const res = { getHeader: vi.fn(), setHeader: vi.fn() } as unknown as NextApiResponse
  return getServerSession(req, res, {
    ...authOptions, secret, jwt: { ...authOptions.jwt, secret },
    logger: { error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
  })
}

describe('actual NextAuth v4 JWT session lifecycle', () => {
  it('returns current identity and role for a cookie containing old ADMIN claims', async () => {
    expect(await actualSession()).toMatchObject({
      user: { id: 'user-1', email: 'current@example.com', name: 'Current Name', role: 'USER' },
    })
  })

  it.each(['banned', 'inactive', 'deleted', 'database-error'])('returns null for %s accounts instead of a stale session', async state => {
    if (state === 'banned') db.findUnique.mockResolvedValue({ isActive: true, isBanned: true })
    if (state === 'inactive') db.findUnique.mockResolvedValue({ isActive: false, isBanned: false })
    if (state === 'deleted') db.findUnique.mockResolvedValue(null)
    if (state === 'database-error') db.findUnique.mockRejectedValue(new Error('Synthetic DB failure'))
    expect(await actualSession()).toBeNull()
  })
})
