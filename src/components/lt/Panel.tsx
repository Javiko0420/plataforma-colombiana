import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LtPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  tone?: 'paper' | 'bg'
  shadow?: 'sm' | 'md' | 'lg' | 'none'
}

const toneMap = {
  paper: 'bg-[var(--lt-paper)]',
  bg: 'bg-[var(--lt-bg)]',
}

const shadowMap = {
  none: '',
  sm: 'shadow-[var(--lt-shadow-sticker)]',
  md: 'shadow-[var(--lt-shadow-sticker-lg)]',
  lg: 'shadow-[var(--lt-shadow-sticker-xl)]',
}

/** Tarjeta estática sin rotación — ideal para secciones de formulario y admin */
export function LtPanel({
  children,
  tone = 'paper',
  shadow = 'md',
  className,
  ...props
}: LtPanelProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)]',
        toneMap[tone],
        shadowMap[shadow],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
