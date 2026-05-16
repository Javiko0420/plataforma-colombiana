import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface LtIconProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  wobble?: boolean
  size?: number | string
}

export function LtIcon({ children, wobble = true, size, className, style, ...props }: LtIconProps) {
  return (
    <span
      aria-hidden="true"
      data-lt-wobble={wobble ? 'true' : undefined}
      className={cn('inline-flex items-center justify-center shrink-0', className)}
      style={{
        filter: wobble ? 'url(#lt-wobble)' : undefined,
        width: size,
        height: size,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}
