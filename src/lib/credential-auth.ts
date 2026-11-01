import { prisma } from '@/lib/prisma'
import { PasswordSecurity } from '@/lib/password-security'
import { accountAuthSelect, getAccountDenial, type AuthAccount } from '@/lib/account-policy'

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

export type CredentialAuthResult =
  | { success: true; user: AuthAccount }
  | { success: false; reason: 'invalid' | 'no-password' | 'banned' | 'inactive' }
  | { success: false; reason: 'locked'; retryAfter: number }

/** Shared password policy for web, legacy mobile and refresh-capable mobile. */
export async function authenticateCredentials(
  email: string,
  password: string
): Promise<CredentialAuthResult> {
  return prisma.$transaction(async (tx): Promise<CredentialAuthResult> => {
    const user = await tx.user.findUnique({
      where: { email },
      select: {
        ...accountAuthSelect,
        password: true,
        lockedUntil: true,
      },
    })
    const denial = getAccountDenial(user)
    if (!user || denial) {
      return { success: false, reason: denial === 'missing' ? 'invalid' : denial ?? 'invalid' }
    }

    const now = new Date()
    if (user.lockedUntil && user.lockedUntil > now) {
      return {
        success: false,
        reason: 'locked',
        retryAfter: Math.max(1, Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 1000)),
      }
    }

    // A missing hash never authenticates, even if a password verifier is replaced.
    if (!user.password) return { success: false, reason: 'no-password' }

    // Reset an expired window once. The predicate protects concurrent attempts.
    if (user.lockedUntil) {
      await tx.user.updateMany({
        where: { id: user.id, lockedUntil: { lte: now } },
        data: { loginAttempts: 0, lockedUntil: null },
      })
    }

    const valid = await PasswordSecurity.verifyPassword(password, user.password)
    if (!valid) {
      const attempts = await tx.user.update({
        where: { id: user.id },
        data: { loginAttempts: { increment: 1 } },
        select: { loginAttempts: true },
      })
      if (attempts.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        await tx.user.updateMany({
          where: {
            id: user.id,
            OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
          },
          data: { lockedUntil: new Date(now.getTime() + LOCKOUT_MS) },
        })
      }
      return { success: false, reason: 'invalid' }
    }

    // Recheck eligibility and the hash after bcrypt, before issuing any identity.
    const accepted = await tx.user.updateMany({
      where: {
        id: user.id,
        password: user.password,
        isActive: true,
        isBanned: false,
        OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
      },
      data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: now },
    })
    if (!accepted.count) return { success: false, reason: 'invalid' }

    const current = await tx.user.findUnique({
      where: { id: user.id },
      select: accountAuthSelect,
    })
    if (!current || getAccountDenial(current)) return { success: false, reason: 'invalid' }
    return { success: true, user: current }
  })
}
