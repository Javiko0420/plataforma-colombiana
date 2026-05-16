'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode, CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export type ButtonVariant = 'sticker' | 'outline' | 'pill'
export type ButtonTone = 'terracota' | 'sun' | 'verde' | 'accent' | 'ink' | 'paper'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface LtButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  tone?: ButtonTone
  size?: ButtonSize
  iconLeft?: ReactNode
  iconRight?: ReactNode
  rotate?: number
  loading?: boolean
  loadingText?: string
}

const toneStyles: Record<ButtonTone, { bg: string; text: string; border: string }> = {
  terracota: { bg: 'bg-[var(--lt-terracota)]', text: 'text-[var(--lt-paper)]', border: 'border-[var(--lt-ink)]' },
  sun:       { bg: 'bg-[var(--lt-sun)]',       text: 'text-[var(--lt-ink)]',   border: 'border-[var(--lt-ink)]' },
  verde:     { bg: 'bg-[var(--lt-verde)]',      text: 'text-[var(--lt-paper)]', border: 'border-[var(--lt-ink)]' },
  accent:    { bg: 'bg-[var(--lt-accent)]',     text: 'text-[var(--lt-paper)]', border: 'border-[var(--lt-ink)]' },
  ink:       { bg: 'bg-[var(--lt-ink)]',        text: 'text-[var(--lt-paper)]', border: 'border-[var(--lt-ink)]' },
  paper:     { bg: 'bg-[var(--lt-paper)]',      text: 'text-[var(--lt-ink)]',   border: 'border-[var(--lt-ink)]' },
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-5 py-2.5 text-base min-h-[44px]',
  lg: 'px-7 py-3.5 text-lg min-h-[52px]',
}

export const LtButton = forwardRef<HTMLButtonElement, LtButtonProps>(({
  variant = 'sticker',
  tone = 'terracota',
  size = 'md',
  iconLeft,
  iconRight,
  rotate = 0,
  loading = false,
  loadingText = 'Cargando...',
  disabled,
  className,
  style,
  children,
  ...props
}, ref) => {
  const { bg, text, border } = toneStyles[tone]
  const isDisabled = disabled || loading

  const inlineStyle: CSSProperties = {
    '--rot': `${rotate}deg`,
    transform: `rotate(${rotate}deg)`,
    ...(variant !== 'pill' ? { filter: 'url(#lt-wobble-soft)' } : {}),
    ...style,
  } as CSSProperties

  const base = [
    'inline-flex items-center justify-center gap-2 font-medium transition-all cursor-pointer',
    'border-2 select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--lt-terracota)]',
    'disabled:pointer-events-none disabled:opacity-50',
    border,
    sizeStyles[size],
  ]

  const variantClasses = {
    sticker: [
      bg, text,
      'rounded-[var(--lt-radius-sm)]',
      'shadow-[var(--lt-shadow-sticker)]',
      'hover:-translate-y-0.5 hover:shadow-[var(--lt-shadow-sticker-lg)] active:translate-y-0 active:shadow-[var(--lt-shadow-sticker)]',
    ],
    outline: [
      'bg-transparent text-[var(--lt-ink)]',
      'rounded-[var(--lt-radius-sm)]',
      'hover:bg-[var(--lt-paper)] hover:-translate-y-0.5',
    ],
    pill: [
      bg, text,
      'rounded-[var(--lt-radius-pill)]',
      'shadow-[var(--lt-shadow-sticker)]',
      'hover:-translate-y-0.5 hover:shadow-[var(--lt-shadow-sticker-lg)] active:translate-y-0',
    ],
  }

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      data-lt-rotate={rotate !== 0 ? 'true' : undefined}
      data-lt-wobble={variant !== 'pill' ? 'true' : undefined}
      className={cn(base, variantClasses[variant], className)}
      style={inlineStyle}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && iconLeft && <span className="shrink-0" aria-hidden="true">{iconLeft}</span>}
      <span>{loading ? loadingText : children}</span>
      {!loading && iconRight && <span className="shrink-0" aria-hidden="true">{iconRight}</span>}
    </button>
  )
})

LtButton.displayName = 'LtButton'
