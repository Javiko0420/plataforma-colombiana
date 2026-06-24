/**
 * Per-forum color identity palette.
 * Single source of truth shared by thread rows, room cards and the trending strip.
 * colorIdx is assigned by forum order: 0=accent, 1=terra, 2=warm, 3=green.
 */
export const ACCENT_TINTS = [
  'var(--lh-accent)',
  'var(--lh-terra)',
  'var(--lh-warm)',
  'var(--lh-green)',
] as const

/** Solid accent color for a given colorIdx (wraps around the palette). */
export function forumColor(colorIdx: number): string {
  return ACCENT_TINTS[colorIdx % ACCENT_TINTS.length]
}

/** 14% tonal tint of the forum color, for chips and soft backgrounds. */
export function forumChip(colorIdx: number): string {
  return `color-mix(in oklch, ${forumColor(colorIdx)} 14%, transparent)`
}
