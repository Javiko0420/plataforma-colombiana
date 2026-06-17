import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'sm'

interface Shared {
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
}

type ButtonProps = Shared & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined }
type LinkProps = Shared & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/**
 * Botón del sistema. Renderiza <button> por defecto o <Link> si se pasa `href`.
 * Variantes: primary (accent), secondary (surface), ghost.
 */
export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'primary', size = 'md', className = '', children, ...rest } = props
  const cls = `lh-btn lh-btn--${size} lh-btn--${variant}${className ? ` ${className}` : ''}`

  if ('href' in rest && rest.href !== undefined) {
    return (
      <Link className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })}>
        {children}
      </Link>
    )
  }

  return (
    <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
