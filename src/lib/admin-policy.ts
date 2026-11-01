/** Edge-safe policy shared by middleware and server-side admin authorization. */
export function canAccessAdmin(user: { role?: string; email?: string | null }): boolean {
  const roleAllowed = user.role === 'ADMIN' || user.role === 'MODERATOR'
  const domain = user.email?.toLowerCase().split('@')
  return roleAllowed && domain?.length === 2 &&
    (domain[1] === 'latinterritory.com' || domain[1] === 'javiwarrior.com')
}
