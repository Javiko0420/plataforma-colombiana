import { prisma } from '@/lib/prisma'
import { accountAuthSelect, getAccountDenial, type AuthAccount } from '@/lib/account-policy'

type OAuthResult =
  | { success: true; user: AuthAccount; isNewUser: boolean }
  | { success: false; reason: 'banned' | 'inactive' | 'unverified-email' | 'link-required' }

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
    const found = await tx.user.findUnique({
      where: { email: identity.verifiedEmail },
      select: { ...accountAuthSelect, password: true, emailVerified: true },
    })
    if (found) {
      // The hash is read only to know whether one exists; never return it.
      const { password, emailVerified, ...existing } = found
      const denial = getAccountDenial(existing)
      if (denial) return { success: false, reason: denial === 'banned' ? 'banned' : 'inactive' }
      // Pre-hijacking guard: registration does not verify email ownership, so a
      // password account with an unverified email may belong to whoever chose
      // that password. Linking it would hand the provider user to that party.
      // Mirrors web NextAuth, which refuses email-based linking (OAuthAccountNotLinked).
      if (password && !emailVerified) return { success: false, reason: 'link-required' }
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
