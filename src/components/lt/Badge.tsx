import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone = 'terracota' | 'sun' | 'verde' | 'accent' | 'ink' | 'paper' | 'neutral'

interface LtBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
  rotate?: number
  children: ReactNode
}

const toneMap: Record<BadgeTone, string> = {
  terracota: 'bg-[var(--lt-terracota)] text-[var(--lt-paper)] border-[var(--lt-ink)]',
  sun:       'bg-[var(--lt-sun)] text-[var(--lt-ink)] border-[var(--lt-ink)]',
  verde:     'bg-[var(--lt-verde)] text-[var(--lt-paper)] border-[var(--lt-ink)]',
  accent:    'bg-[var(--lt-accent)] text-[var(--lt-paper)] border-[var(--lt-ink)]',
  ink:       'bg-[var(--lt-ink)] text-[var(--lt-paper)] border-[var(--lt-ink)]',
  paper:     'bg-[var(--lt-paper)] text-[var(--lt-ink)] border-[var(--lt-ink)]',
  neutral:   'bg-[var(--lt-paper)] text-[var(--lt-ink-soft)] border-[var(--lt-ink)]',
}

export function LtBadge({ tone = 'neutral', rotate = 0, className, style, children, ...props }: LtBadgeProps) {
  return (
    <span
      data-lt-wobble="true"
      data-lt-rotate={rotate !== 0 ? 'true' : undefined}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold',
        'rounded-[var(--lt-radius-pill)] border-[1.6px]',
        'shadow-[2px_2px_0_var(--lt-ink)]',
        toneMap[tone],
        className,
      )}
      style={{
        transform: rotate !== 0 ? `rotate(${rotate}deg)` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}
