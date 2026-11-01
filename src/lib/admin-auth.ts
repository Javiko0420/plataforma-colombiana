import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCurrentAccount, hasCompletedProfile } from '@/lib/account-policy'
import { canAccessAdmin } from '@/lib/admin-policy'

/** Middleware is an early filter; every administrative operation rechecks DB state. */
export async function getAuthorizedAdminSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  const user = await getCurrentAccount(session.user.id)
  if (!user || !canAccessAdmin(user) || !hasCompletedProfile(user)) return null
  return {
    ...session,
    user: { ...session.user, ...user, hasCompletedProfile: hasCompletedProfile(user) },
  }
}
