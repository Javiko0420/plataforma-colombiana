/**
 * Forum formatting helpers
 * Pure, dependency-free utilities shared by forum UI (rooms, trending, rows).
 */

import type { SupportedLocale } from '@/lib/i18n'

/**
 * Compact, locale-aware relative time ("hace 2 h" / "2h ago").
 * Matches the compact style already used in the landing forum widget.
 * Computed server-side and passed down as a plain string, so there is no
 * hydration mismatch in the client row.
 */
export function formatRelativeTime(date: Date | string, locale: SupportedLocale = 'es'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diffMs = Date.now() - d.getTime()
  const sec = Math.max(0, Math.floor(diffMs / 1000))
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)
  const wk = Math.floor(day / 7)

  if (locale === 'en') {
    if (sec < 60) return 'now'
    if (min < 60) return `${min}m ago`
    if (hr < 24) return `${hr}h ago`
    if (day < 7) return `${day}d ago`
    return `${wk}w ago`
  }

  // Spanish (default)
  if (sec < 60) return 'ahora'
  if (min < 60) return `hace ${min} min`
  if (hr < 24) return `hace ${hr} h`
  if (day < 7) return `hace ${day} d`
  return `hace ${wk} sem`
}

/**
 * Two-letter initials for an avatar from a nickname.
 * Nicknames are single-token (regex enforced), so this usually takes the
 * first two characters; multi-word names take the first letter of each word.
 */
export function getInitials(nickname: string): string {
  const cleaned = nickname.trim()
  if (!cleaned) return '·'
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
