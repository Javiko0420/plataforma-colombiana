// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import type { CredentialsConfig } from 'next-auth/providers/credentials'
import type { UserRole } from '@prisma/client'

const mocks = vi.hoisted(() => ({
  db: {
    user: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
    account: { findUnique: vi.fn(), create: vi.fn() },
    mobileRefreshToken: { findUnique: vi.fn(), create: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
    jobOffer: { findUnique: vi.fn(), update: vi.fn() },
    event: { findUnique: vi.fn(), update: vi.fn() },
    business: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
  },
  password: vi.fn(), rateLimit: vi.fn(), encode: vi.fn(), decode: vi.fn(), getToken: vi.fn(),
  verifyAccess: vi.fn(), generatePair: vi.fn(), session: vi.fn(),
  verifyApple: vi.fn(), verifyGoogle: vi.fn(), log: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({ prisma: mocks.db }))
vi.mock('@/lib/password-security', () => ({ PasswordSecurity: { verifyPassword: mocks.password } }))
vi.mock('@/lib/logger', () => ({
  SecurityLogger: { logAuthEvent: mocks.log, logSecurityViolation: mocks.log },
  logger: { error: mocks.log },
}))
vi.mock('@/lib/rate-limit', () => ({ checkRateLimit: mocks.rateLimit, rateLimitHeaders: () => ({ 'Retry-After': '60' }) }))
vi.mock('jsonwebtoken', () => ({ default: { sign: () => 'synthetic-apple-client-secret' } }))
vi.mock('next-auth', () => ({ getServerSession: mocks.session }))
vi.mock('next-auth/jwt', () => ({ encode: mocks.encode, decode: mocks.decode, getToken: mocks.getToken }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('apple-signin-auth', () => ({ default: { verifyIdToken: mocks.verifyApple } }))
vi.mock('google-auth-library', () => ({
  OAuth2Client: class { verifyIdToken = mocks.verifyGoogle },
}))
vi.mock('@/lib/mobile-jwt', () => ({
  verifyAccessToken: mocks.verifyAccess, generateTokenPair: mocks.generatePair,
  hashRefreshToken: () => 'synthetic-refresh-hash', generateTokenFamily: () => 'family-1',
  getRefreshTokenExpiry: () => new Date('2030-01-01'),
}))

import { authOptions } from '@/lib/auth'
import { authenticateCredentials } from '@/lib/credential-auth'
import { getCurrentAccount } from '@/lib/account-policy'
import { getAuthUser } from '@/lib/get-auth-user'
import { getMobileToken, decodeMobileToken } from '@/lib/mobile-auth'
import { withMobileAuth } from '@/lib/mobile-auth-middleware'
import { getAuthorizedAdminSession } from '@/lib/admin-auth'
import { resolveMobileOAuthAccount } from '@/lib/mobile-oauth-account'
import { POST as signIn } from '@/app/api/auth/mobile/sign-in/route'
import { POST as login } from '@/app/api/auth/mobile/login/route'
import { POST as apple } from '@/app/api/auth/mobile/apple/route'
import { POST as google } from '@/app/api/auth/mobile/google/route'
import { POST as refresh } from '@/app/api/auth/mobile/refresh/route'
import { GET as mobileSession } from '@/app/api/auth/mobile/session/route'
import { toggleUserBan, updateUserRole } from '@/app/(main)/admin/usuarios/actions'
import { PUT as editJob } from '@/app/api/jobs/[id]/route'
import { PUT as editEvent } from '@/app/api/events/[id]/route'
import { DELETE as deleteBusiness } from '@/app/api/businesses/[id]/route'

function account() {
  return {
    id: 'user-1', email: 'member@example.com', name: 'Test User', nickname: 'member',
    image: null, role: 'USER' as UserRole, isActive: true, isBanned: false,
    password: 'synthetic-hash', loginAttempts: 0, lockedUntil: null as Date | null,
    emailVerified: null as Date | null,
    dateOfBirth: new Date('1990-01-01'), contractAcceptedAt: new Date('2026-01-01'),
  }
}
let row: ReturnType<typeof account> | null

function request(path: string, body?: unknown, token?: string) {
  return new NextRequest(`http://localhost${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}
const credentials = () => ({ email: 'member@example.com', password: 'Synthetic-input-42!' })
const provider = authOptions.providers.find(p => p.id === 'credentials') as CredentialsConfig
const authorize = provider.options?.authorize ?? provider.authorize
const webLogin = () => authorize(credentials(), { headers: {} })
const jwtCallback = authOptions.callbacks!.jwt!
const signInCallback = authOptions.callbacks!.signIn!
function resolveJwt(extra: Record<string, unknown> = {}) {
  return jwtCallback({ token: { sub: 'user-1', role: 'ADMIN', hasCompletedProfile: true }, ...extra } as Parameters<typeof jwtCallback>[0])
}
function webOAuth(providerName: string, emailVerified = true) {
  return signInCallback({
    user: { id: 'provider-subject', email: 'member@example.com', role: 'USER' },
    account: { provider: providerName, providerAccountId: 'subject-1', type: 'oauth' },
    profile: { email_verified: emailVerified },
  } as Parameters<typeof signInCallback>[0])
}

beforeEach(() => {
  vi.resetAllMocks()
  row = account()
  mocks.db.$transaction.mockImplementation(async operation =>
    typeof operation === 'function' ? operation(mocks.db) : Promise.all(operation))
  mocks.db.user.findUnique.mockImplementation(async ({ select }) => {
    if (!row) return null
    return select ? Object.fromEntries(Object.keys(select).map(key => [key, row![key as keyof typeof row]])) : { ...row }
  })
  mocks.db.user.update.mockImplementation(async () => ({ loginAttempts: (row!.loginAttempts += 1) }))
  mocks.db.user.updateMany.mockResolvedValue({ count: 1 })
  mocks.db.account.findUnique.mockResolvedValue(null)
  mocks.db.mobileRefreshToken.create.mockResolvedValue({ id: 'refresh-1' })
  mocks.db.mobileRefreshToken.updateMany.mockResolvedValue({ count: 1 })
  mocks.password.mockResolvedValue(true)
  mocks.rateLimit.mockResolvedValue({ success: true })
  mocks.encode.mockResolvedValue('synthetic-nextauth-token')
  mocks.generatePair.mockReturnValue({ accessToken: 'synthetic-access', refreshToken: 'synthetic-refresh' })
  mocks.session.mockResolvedValue(null)
  mocks.verifyApple.mockResolvedValue({ sub: 'apple-subject', email: 'member@example.com', email_verified: true })
  mocks.verifyGoogle.mockResolvedValue({ getPayload: () => ({ sub: 'google-subject', email: 'member@example.com', email_verified: true }) })
})

describe('password authentication across the three real entry points', () => {
  it.each([null, ''])('rejects a missing hash (%s), even if the verifier would accept it', async hash => {
    row!.password = hash as unknown as string
    expect(await webLogin()).toBeNull()
    expect((await signIn(request('/api/auth/mobile/sign-in', credentials()))).status).toBe(401)
    expect((await login(request('/api/auth/mobile/login', credentials()))).status).toBe(401)
    expect(mocks.password).not.toHaveBeenCalled()
    expect(mocks.encode).not.toHaveBeenCalled()
    expect(mocks.generatePair).not.toHaveBeenCalled()
    expect(mocks.db.mobileRefreshToken.create).not.toHaveBeenCalled()
  })

  it('preserves all success response contracts for a valid password', async () => {
    expect(await webLogin()).toMatchObject({ id: 'user-1', role: 'USER' })
    const legacy = await signIn(request('/api/auth/mobile/sign-in', credentials()))
    expect(await legacy.json()).toMatchObject({ success: true, data: { accessToken: 'synthetic-nextauth-token', expiresIn: 86400 } })
    const modern = await login(request('/api/auth/mobile/login', credentials()))
    expect(await modern.json()).toMatchObject({ accessToken: 'synthetic-access', refreshToken: 'synthetic-refresh', user: { id: 'user-1' } })
  })

  it('rejects incorrect passwords in all flows and atomically increments shared attempts', async () => {
    mocks.password.mockResolvedValue(false)
    expect(await webLogin()).toBeNull()
    expect((await signIn(request('/api/auth/mobile/sign-in', credentials()))).status).toBe(401)
    expect((await login(request('/api/auth/mobile/login', credentials()))).status).toBe(401)
    expect(row!.loginAttempts).toBe(3)
    expect(mocks.db.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: { loginAttempts: { increment: 1 } } }))
    expect(mocks.generatePair).not.toHaveBeenCalled()
  })

  it.each(['banned', 'inactive', 'missing', 'locked'])('rejects %s accounts consistently', async state => {
    if (state === 'banned') row!.isBanned = true
    if (state === 'inactive') row!.isActive = false
    if (state === 'missing') row = null
    if (state === 'locked') row!.lockedUntil = new Date(Date.now() + 60000)
    expect(await webLogin()).toBeNull()
    expect((await signIn(request('/api/auth/mobile/sign-in', credentials()))).status).toBe(401)
    const expected = state === 'locked' ? 429 : state === 'missing' ? 401 : 403
    expect((await login(request('/api/auth/mobile/login', credentials()))).status).toBe(expected)
    expect(mocks.password).not.toHaveBeenCalled()
    expect(mocks.encode).not.toHaveBeenCalled()
    expect(mocks.generatePair).not.toHaveBeenCalled()
  })

  it('starts the lock at the fifth failure', async () => {
    row!.loginAttempts = 4
    mocks.password.mockResolvedValue(false)
    await authenticateCredentials(row!.email, 'synthetic-wrong-input')
    expect(mocks.db.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { lockedUntil: expect.any(Date) },
    }))
  })

  it('resets an expired lock window and clears attempts on success', async () => {
    row!.lockedUntil = new Date(Date.now() - 1000)
    expect((await authenticateCredentials(row!.email, credentials().password)).success).toBe(true)
    expect(mocks.db.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'user-1', lockedUntil: { lte: expect.any(Date) } },
      data: { loginAttempts: 0, lockedUntil: null },
    }))
    expect(mocks.db.user.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: expect.any(Date) },
    }))
  })

  it('does not authenticate if the final eligibility/hash check loses a race', async () => {
    mocks.db.user.updateMany.mockResolvedValue({ count: 0 })
    expect(await webLogin()).toBeNull()
    expect(mocks.encode).not.toHaveBeenCalled()
  })

  it('enforces the existing rate limiter before credential lookup in each flow', async () => {
    mocks.rateLimit.mockResolvedValue({ success: false })
    expect(await webLogin()).toBeNull()
    expect((await signIn(request('/api/auth/mobile/sign-in', credentials()))).status).toBe(429)
    expect((await login(request('/api/auth/mobile/login', credentials()))).status).toBe(429)
    expect(mocks.db.user.findUnique).not.toHaveBeenCalled()
  })

  it('fails closed on database errors without issuing tokens', async () => {
    mocks.db.$transaction.mockRejectedValue(new Error('Synthetic database outage'))
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(await webLogin()).toBeNull()
    expect((await signIn(request('/api/auth/mobile/sign-in', credentials()))).status).toBe(500)
    expect((await login(request('/api/auth/mobile/login', credentials()))).status).toBe(500)
    expect(mocks.generatePair).not.toHaveBeenCalled()
    quiet.mockRestore()
  })
})

describe('current account state and role, including previously issued tokens', () => {
  it('replaces stale roles and ignores privilege claims in session updates', async () => {
    expect(await resolveJwt({ trigger: 'update', session: { role: 'ADMIN', isBanned: false } })).toMatchObject({ role: 'USER' })
    mocks.verifyAccess.mockReturnValue({ sub: 'user-1', role: 'ADMIN' })
    expect(await getAuthUser(request('/api/users/me', undefined, 'synthetic-access'))).toEqual({ id: 'user-1', role: 'USER' })
    mocks.getToken.mockResolvedValue({ sub: 'user-1', email: 'stale@example.com', role: 'ADMIN' })
    const response = await mobileSession(request('/api/auth/mobile/session', undefined, 'synthetic-nextauth-token'))
    expect(await response.json()).toMatchObject({ success: true, data: { user: { role: 'USER', email: 'member@example.com' } } })
  })

  it.each(['banned', 'inactive', 'missing'])('denies %s users in all session boundaries', async state => {
    if (state === 'banned') row!.isBanned = true
    if (state === 'inactive') row!.isActive = false
    if (state === 'missing') row = null
    await expect(resolveJwt()).rejects.toThrow('Account unavailable')
    mocks.session.mockResolvedValue({ user: { id: 'user-1', role: 'ADMIN' } })
    expect(await getAuthUser(request('/api/users/me'))).toBeNull()
    mocks.getToken.mockResolvedValue({ sub: 'user-1', email: 'member@example.com' })
    expect((await mobileSession(request('/api/auth/mobile/session'))).status).toBe(401)
    mocks.decode.mockResolvedValue({ sub: 'user-1' })
    expect(await decodeMobileToken('synthetic-nextauth-token')).toBeNull()
    mocks.verifyAccess.mockReturnValue({ sub: 'user-1', role: 'ADMIN' })
    expect(await withMobileAuth(request('/api/private', undefined, 'synthetic-access'))).toBeInstanceOf(NextResponse)
  })

  it('rejects a revoked-state mobile JWT without a web session', async () => {
    row!.isBanned = true
    mocks.verifyAccess.mockReturnValue({ sub: 'user-1', role: 'ADMIN' })
    expect(await getAuthUser(request('/api/users/me', undefined, 'synthetic-access'))).toBeNull()
  })

  it('denies invalid tokens before DB authorization', async () => {
    mocks.verifyAccess.mockImplementation(() => { throw new Error('Invalid token') })
    expect(await getAuthUser(request('/api/users/me', undefined, 'synthetic-invalid'))).toBeNull()
    expect(mocks.db.user.findUnique).not.toHaveBeenCalled()
  })

  it('does not fall back to stale claims when DB lookup fails', async () => {
    mocks.db.user.findUnique.mockRejectedValue(new Error('Synthetic outage'))
    await expect(getCurrentAccount('user-1')).rejects.toThrow()
    await expect(resolveJwt()).rejects.toThrow()
    mocks.getToken.mockResolvedValue({ sub: 'user-1', role: 'ADMIN' })
    await expect(getMobileToken(request('/api/private'))).rejects.toThrow()
  })

  it('does not treat a password lock as a global session suspension', async () => {
    row!.lockedUntil = new Date(Date.now() + 60000)
    expect(await resolveJwt()).toMatchObject({ sub: 'user-1', role: 'USER' })
  })
})

describe('verified provider identity and account eligibility', () => {
  it.each(['google', 'apple'])('rejects suspended users in the %s web callback', async name => {
    row!.isBanned = true
    expect(await webOAuth(name)).toBe(false)
  })

  it('rejects an unverified Google email on web', async () => {
    expect(await webOAuth('google', false)).toBe(false)
  })

  it.each(['apple', 'google'])('does not link or issue tokens for a disabled %s mobile user', async name => {
    row!.isActive = false
    const handler = name === 'apple' ? apple : google
    const response = await handler(request(`/api/auth/mobile/${name}`, name === 'apple' ? { identityToken: 'synthetic-id' } : { idToken: 'synthetic-id' }))
    expect(response.status).toBe(403)
    expect(mocks.db.account.create).not.toHaveBeenCalled()
    expect(mocks.generatePair).not.toHaveBeenCalled()
  })

  it('ignores a client email if the verified Apple token contains no email', async () => {
    mocks.verifyApple.mockResolvedValue({ sub: 'apple-subject' })
    const response = await apple(request('/api/auth/mobile/apple', {
      identityToken: 'synthetic-id', user: { email: 'member@example.com' },
    }))
    expect(response.status).toBe(401)
    expect(mocks.db.user.findUnique).not.toHaveBeenCalled()
    expect(mocks.db.account.create).not.toHaveBeenCalled()
    expect(mocks.generatePair).not.toHaveBeenCalled()
  })

  it.each([false, 'false', undefined])('requires verified Apple email before linking (%s)', async verified => {
    mocks.verifyApple.mockResolvedValue({ sub: 'apple-subject', email: 'member@example.com', email_verified: verified })
    expect((await apple(request('/api/auth/mobile/apple', { identityToken: 'synthetic-id' }))).status).toBe(401)
    expect(mocks.db.account.create).not.toHaveBeenCalled()
  })

  it('allows an existing Apple subject link without email and without a password', async () => {
    row!.password = ''
    mocks.verifyApple.mockResolvedValue({ sub: 'apple-subject' })
    mocks.db.account.findUnique.mockResolvedValue({ user: row })
    expect((await apple(request('/api/auth/mobile/apple', { identityToken: 'synthetic-id' }))).status).toBe(200)
    expect(mocks.db.account.create).not.toHaveBeenCalled()
    expect(mocks.password).not.toHaveBeenCalled()
  })

  it('links only the signed verified Apple email, ignoring a different client email', async () => {
    row!.password = ''
    const response = await apple(request('/api/auth/mobile/apple', {
      identityToken: 'synthetic-id', user: { email: 'attacker-input@example.com' },
    }))
    expect(response.status).toBe(200)
    expect(mocks.db.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { email: 'member@example.com' } }))
    expect(mocks.db.account.create).toHaveBeenCalledWith({ data: {
      userId: 'user-1', type: 'oauth', provider: 'apple', providerAccountId: 'apple-subject',
    } })
  })

  it.each(['apple', 'google'])('refuses %s email linking to a password account with an unverified email', async name => {
    const handler = name === 'apple' ? apple : google
    const response = await handler(request(`/api/auth/mobile/${name}`, name === 'apple' ? { identityToken: 'synthetic-id' } : { idToken: 'synthetic-id' }))
    expect(response.status).toBe(409)
    expect(await response.json()).toMatchObject({ error: 'ACCOUNT_LINK_REQUIRED' })
    expect(mocks.db.account.create).not.toHaveBeenCalled()
    expect(mocks.db.user.create).not.toHaveBeenCalled()
    expect(mocks.generatePair).not.toHaveBeenCalled()
  })

  it('links a password account only once its email ownership is verified, without exposing the hash', async () => {
    row!.emailVerified = new Date('2026-01-01')
    const resolved = await resolveMobileOAuthAccount({ provider: 'google', subject: 'subject-1', verifiedEmail: 'member@example.com' })
    expect(resolved).toMatchObject({ success: true, isNewUser: false, user: { id: 'user-1' } })
    expect(resolved.success && resolved.user).not.toHaveProperty('password')
    expect(resolved.success && resolved.user).not.toHaveProperty('emailVerified')
    expect(mocks.db.account.create).toHaveBeenCalledTimes(1)
  })

  it('still allows an existing subject link for a password account with an unverified email', async () => {
    mocks.db.account.findUnique.mockResolvedValue({ user: row })
    expect((await google(request('/api/auth/mobile/google', { idToken: 'synthetic-id' }))).status).toBe(200)
    expect(mocks.db.account.create).not.toHaveBeenCalled()
  })

  it('creates a new user and provider link atomically without persisting the identity token', async () => {
    mocks.db.user.findUnique.mockResolvedValue(null)
    mocks.db.user.create.mockResolvedValue(account())
    expect(await resolveMobileOAuthAccount({ provider: 'google', subject: 'subject-1', verifiedEmail: 'new@example.com' })).toMatchObject({ success: true, isNewUser: true })
    expect(mocks.db.user.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
      accounts: { create: { type: 'oauth', provider: 'google', providerAccountId: 'subject-1' } },
    }) }))
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid provider signatures without DB access', async () => {
    mocks.verifyApple.mockRejectedValue(new Error('Synthetic invalid signature'))
    expect((await apple(request('/api/auth/mobile/apple', { identityToken: 'synthetic-id' }))).status).toBe(401)
    expect(mocks.db.account.findUnique).not.toHaveBeenCalled()
  })
})

describe('administrative authorization and refresh revocation', () => {
  function adminSession() {
    row!.role = 'ADMIN'
    row!.email = 'admin@latinterritory.com'
    mocks.session.mockResolvedValue({ user: { id: 'user-1', role: 'ADMIN' } })
  }

  it('denies a stale ADMIN role after demotion, including direct Server Actions', async () => {
    mocks.session.mockResolvedValue({ user: { id: 'user-1', role: 'ADMIN' } })
    expect(await getAuthorizedAdminSession()).toBeNull()
    await expect(updateUserRole('target-1', 'ADMIN')).rejects.toThrow()
    expect(mocks.db.user.update).not.toHaveBeenCalled()
  })

  it('checks corporate domain on the server instead of relying on middleware', async () => {
    row!.role = 'ADMIN'
    mocks.session.mockResolvedValue({ user: { id: 'user-1', role: 'ADMIN' } })
    await expect(toggleUserBan('target-1', false)).rejects.toThrow()
    expect(mocks.db.mobileRefreshToken.updateMany).not.toHaveBeenCalled()
  })

  it('preserves the MODERATOR restriction on user management', async () => {
    adminSession()
    row!.role = 'MODERATOR'
    await expect(updateUserRole('target-1', 'ADMIN')).rejects.toThrow()
    expect(mocks.db.user.update).not.toHaveBeenCalled()
  })

  it('suspends and revokes refresh tokens with the audit record in one transaction', async () => {
    adminSession()
    const result = await toggleUserBan('target-1', false)
    expect(result).toEqual({ success: true })
    expect(mocks.db.user.updateMany).toHaveBeenCalledWith({ where: { id: 'target-1', isBanned: false }, data: { isBanned: true } })
    expect(mocks.db.mobileRefreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 'target-1', isRevoked: false }, data: { isRevoked: true },
    })
    expect(mocks.db.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'USER_BAN' }) }))
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(1)
  })

  it('does not restore refresh tokens on unban', async () => {
    adminSession()
    mocks.db.user.findUnique.mockResolvedValueOnce(row).mockResolvedValueOnce({ isBanned: true })
    expect(await toggleUserBan('target-1', true)).toEqual({ success: true })
    expect(mocks.db.mobileRefreshToken.updateMany).not.toHaveBeenCalled()
  })

  it('denies renewal and revokes all refresh tokens for suspended accounts', async () => {
    row!.isBanned = true
    mocks.db.mobileRefreshToken.findUnique.mockResolvedValue({ user: row, userId: 'user-1', isRevoked: false, expiresAt: new Date('2030-01-01') })
    expect((await refresh(request('/api/auth/mobile/refresh', { refreshToken: 'synthetic-refresh' }))).status).toBe(403)
    expect(mocks.generatePair).not.toHaveBeenCalled()
    expect(mocks.db.mobileRefreshToken.updateMany).toHaveBeenCalledWith({ where: { userId: 'user-1' }, data: { isRevoked: true } })
  })

  it('preserves rotation and uses the current role for active accounts', async () => {
    row!.lockedUntil = new Date(Date.now() + 60000)
    mocks.db.mobileRefreshToken.findUnique.mockResolvedValue({ id: 'refresh-1', family: 'family-1', user: row, userId: 'user-1', isRevoked: false, expiresAt: new Date('2030-01-01') })
    expect((await refresh(request('/api/auth/mobile/refresh', { refreshToken: 'synthetic-refresh' }))).status).toBe(200)
    expect(mocks.generatePair).toHaveBeenCalledWith(expect.objectContaining({ role: 'USER' }))
    expect(mocks.db.$transaction).toHaveBeenCalledTimes(1)
  })
})

describe('resource ownership through both supported client mechanisms', () => {
  it.each(['web', 'mobile'])('denies editing/deleting resources belonging to someone else (%s)', async client => {
    if (client === 'web') mocks.session.mockResolvedValue({ user: { id: 'user-1', role: 'USER' } })
    else mocks.verifyAccess.mockReturnValue({ sub: 'user-1', role: 'USER' })
    mocks.db.jobOffer.findUnique.mockResolvedValue({ userId: 'other-user', deletedAt: null })
    mocks.db.event.findUnique.mockResolvedValue({ userId: 'other-user' })
    mocks.db.business.findUnique.mockResolvedValue({ ownerId: 'other-user' })
    const params = { params: Promise.resolve({ id: 'resource-1' }) }
    const req = () => request('/api/private/resource-1', {}, client === 'mobile' ? 'synthetic-access' : undefined)
    expect((await editJob(req(), params)).status).toBe(403)
    expect((await editEvent(req(), params)).status).toBe(403)
    expect((await deleteBusiness(req(), params)).status).toBe(403)
    expect(mocks.db.jobOffer.update).not.toHaveBeenCalled()
    expect(mocks.db.event.update).not.toHaveBeenCalled()
    expect(mocks.db.business.delete).not.toHaveBeenCalled()
  })

  it.each(['web', 'mobile'])('allows the owner to edit an event (%s)', async client => {
    if (client === 'web') mocks.session.mockResolvedValue({ user: { id: 'user-1', role: 'USER' } })
    else mocks.verifyAccess.mockReturnValue({ sub: 'user-1', role: 'USER' })
    mocks.db.event.findUnique.mockResolvedValue({ userId: 'user-1' })
    mocks.db.event.update.mockResolvedValue({ id: 'event-1' })
    const response = await editEvent(
      request('/api/events/event-1', { title: 'Updated event' }, client === 'mobile' ? 'synthetic-access' : undefined),
      { params: Promise.resolve({ id: 'event-1' }) }
    )
    expect(response.status).toBe(200)
    expect(mocks.db.event.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'event-1' } }))
  })
})
