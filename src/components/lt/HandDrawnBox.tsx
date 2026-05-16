import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface HandDrawnBoxProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  borderColor?: string
  bgColor?: string
  padding?: string
}

export function HandDrawnBox({
  children,
  borderColor = 'var(--lt-ink)',
  bgColor = 'var(--lt-paper)',
  padding = '1rem 1.25rem',
  className,
  style,
  ...props
}: HandDrawnBoxProps) {
  return (
    <div
      data-lt-wobble="true"
      className={cn('relative', className)}
      style={{
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 'var(--lt-radius-md)',
        boxShadow: 'var(--lt-shadow-sticker)',
        filter: 'url(#lt-wobble-soft)',
        padding,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
