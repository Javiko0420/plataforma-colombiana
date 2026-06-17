import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  /** Acción opcional (ej. <Button>) */
  action?: ReactNode
}

/** Estado vacío del sistema: icono tonal + título + descripción + acción. */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
      {icon && (
        <div
          aria-hidden="true"
          style={{
            width: 60, height: 60, borderRadius: 17, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--lh-surface2)', border: '1px solid var(--lh-border)',
            color: 'var(--lh-fg3)', marginBottom: 20,
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 8px' }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: '0 0 22px' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
