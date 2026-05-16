'use client'

import { cn } from '@/lib/utils'

type Tone = 'terracota' | 'sun' | 'verde' | 'accent' | 'ink'

const toneClasses: Record<Tone, string> = {
  terracota: 'bg-[var(--lt-terracota)] text-white',
  sun:       'bg-[var(--lt-sun)] text-[var(--lt-ink)]',
  verde:     'bg-[var(--lt-verde)] text-white',
  accent:    'bg-[var(--lt-accent)] text-white',
  ink:       'bg-[var(--lt-ink)] text-[var(--lt-paper)]',
}

export function StickerBadge({
  tone = 'terracota',
  text,
  className,
}: {
  tone?: Tone
  text: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative inline-block px-5 py-3 rounded-[12px] font-semibold text-lg whitespace-nowrap',
        'border-2 border-[var(--lt-ink)] shadow-[4px_5px_0_var(--lt-ink)]',
        toneClasses[tone],
        className,
      )}
      data-lt-wobble="true"
      style={{ filter: 'url(#lt-wobble-soft)', fontFamily: 'var(--lt-font-serif)', fontStyle: 'italic' }}
    >
      {text}
    </div>
  )
}
