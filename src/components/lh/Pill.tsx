import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Estado seleccionado (texto invertido sobre accent) */
  active?: boolean
  children: ReactNode
}

/** Pastilla de filtro/tag. Estado activo invierte el color. */
export function Pill({ active = false, className = '', children, ...rest }: PillProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`lh-pill${active ? ' lh-pill--active' : ''}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {children}
    </button>
  )
}
