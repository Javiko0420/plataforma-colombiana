import { prisma } from '@/lib/prisma'
import { accountAuthSelect, getAccountDenial, type AuthAccount } from '@/lib/account-policy'

type OAuthResult =
  | { success: true; user: AuthAccount; isNewUser: boolean }
  | { success: false; reason: 'banned' | 'inactive' | 'unverified-email' }

/** Inputs must come from a verified provider token, never the request's email. */
export async function resolveMobileOAuthAccount(identity: {
  provider: 'apple' | 'google'
  subject: string
  verifiedEmail?: string
  name?: string | null
  image?: string | null
}): Promise<OAuthResult> {
  return prisma.$transaction(async (tx): Promise<OAuthResult> => {
    const linked = await tx.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: identity.provider, providerAccountId: identity.subject,
        },
      },
      select: { user: { select: accountAuthSelect } },
    })
    if (linked) {
      const denial = getAccountDenial(linked.user)
      if (denial) return { success: false, reason: denial === 'banned' ? 'banned' : 'inactive' }
      return { success: true, user: linked.user, isNewUser: false }
    }

    // Returning Apple users may omit email; only an existing subject link is enough then.
    if (!identity.verifiedEmail) return { success: false, reason: 'unverified-email' }
    const existing = await tx.user.findUnique({
      where: { email: identity.verifiedEmail }, select: accountAuthSelect,
    })
    if (existing) {
      const denial = getAccountDenial(existing)
      if (denial) return { success: false, reason: denial === 'banned' ? 'banned' : 'inactive' }
      await tx.account.create({
        data: {
          userId: existing.id, type: 'oauth', provider: identity.provider,
          providerAccountId: identity.subject,
        },
      })
      return { success: true, user: existing, isNewUser: false }
    }

    const user = await tx.user.create({
      data: {
        email: identity.verifiedEmail,
        name: identity.name ?? null,
        image: identity.image ?? null,
        emailVerified: new Date(),
        accounts: {
          create: {
            type: 'oauth', provider: identity.provider, providerAccountId: identity.subject,
          },
        },
      },
      select: accountAuthSelect,
    })
    return { success: true, user, isNewUser: true }
  })
}
