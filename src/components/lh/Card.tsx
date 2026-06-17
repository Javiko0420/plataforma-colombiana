import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Activa hover premium (translateY + shadow-lg) */
  interactive?: boolean
  children: ReactNode
}

/** Tarjeta del sistema: surface, border 1px, radius 20px, shadow. */
export function Card({ interactive = false, className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`lh-card${interactive ? ' lh-card--interactive' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </div>
  )
}
