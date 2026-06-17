import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'

interface SectionHeaderProps {
  /** Eyebrow en Geist Mono (color de acento de la sección) */
  eyebrow: string
  title: string
  /** Color del eyebrow; usa el sistema de acentos por área */
  accent?: string
  /** Acción "ver todos →" opcional */
  action?: { label: string; href: string }
  align?: 'between' | 'center'
  className?: string
  style?: CSSProperties
}

/** Encabezado de sección: eyebrow + H2 + acción opcional. Patrón 1:1 con la landing. */
export function SectionHeader({
  eyebrow,
  title,
  accent = 'var(--lh-accent)',
  action,
  align = 'between',
  className = '',
  style,
}: SectionHeaderProps) {
  if (align === 'center') {
    return (
      <div
        className={className}
        style={{ textAlign: 'center', maxWidth: 620, marginLeft: 'auto', marginRight: 'auto', ...style }}
      >
        <span className="lh-eyebrow" style={{ color: accent }}>{eyebrow}</span>
        <h2 className="lh-h2" style={{ margin: '12px 0 0' }}>{title}</h2>
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, ...style }}
    >
      <div>
        <span className="lh-eyebrow" style={{ color: accent }}>{eyebrow}</span>
        <h2 className="lh-h2" style={{ margin: '12px 0 0' }}>{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="lh-seemore">
          {action.label} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  )
}
