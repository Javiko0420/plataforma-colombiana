import type { HTMLAttributes, ReactNode } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/** Contenedor estándar: max-width 1220px, padding lateral 24px. */
export function Container({ className = '', children, ...rest }: ContainerProps) {
  return (
    <div className={`lh-container${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  )
}
