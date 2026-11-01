import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// Never select password hashes or provider tokens for session authorization.
export const accountAuthSelect = {
  id: true,
  email: true,
  name: true,
  nickname: true,
  image: true,
  role: true,
  isActive: true,
  isBanned: true,
  dateOfBirth: true,
  contractAcceptedAt: true,
} satisfies Prisma.UserSelect

export type AuthAccount = Prisma.UserGetPayload<{ select: typeof accountAuthSelect }>
export type AccountDenial = 'missing' | 'banned' | 'inactive'

export function getAccountDenial(
  user: Pick<AuthAccount, 'isActive' | 'isBanned'> | null
): AccountDenial | null {
  if (!user) return 'missing'
  if (user.isBanned) return 'banned'
  if (!user.isActive) return 'inactive'
  return null
}

export function hasCompletedProfile(
  user: Pick<AuthAccount, 'dateOfBirth' | 'contractAcceptedAt'>
): boolean {
  return !!(user.dateOfBirth && user.contractAcceptedAt)
}

/** DB failures propagate: callers must never fall back to stale token claims. */
export async function getCurrentAccount(userId: string): Promise<AuthAccount | null> {
  if (!userId) return null
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: accountAuthSelect,
  })
  return getAccountDenial(user) ? null : user
}
