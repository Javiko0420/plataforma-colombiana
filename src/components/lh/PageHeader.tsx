import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  /** Color del eyebrow (acento por área) */
  accent?: string
  /** Contenido extra debajo del subtítulo (ej. buscador, acciones) */
  children?: ReactNode
}

/**
 * Cabecera de página interna: aurora sutil + eyebrow + H1 + subtítulo.
 * Coherente con el lenguaje visual del hero de la landing, sin sobrecargar.
 */
export function PageHeader({ eyebrow, title, subtitle, accent = 'var(--lh-accent)', children }: PageHeaderProps) {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--lh-border2)',
        background: 'var(--lh-bg)',
      }}
    >
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div
          className="lh-aurora-blob"
          style={{
            position: 'absolute', width: 540, height: 540, left: -160, top: -260, borderRadius: '50%',
            background: 'radial-gradient(circle,var(--lh-aurora1),transparent 62%)',
            filter: 'blur(22px)', animation: 'lh-float 18s ease-in-out infinite',
          }}
        />
        <div
          className="lh-aurora-blob"
          style={{
            position: 'absolute', width: 460, height: 460, right: -160, top: -180, borderRadius: '50%',
            background: 'radial-gradient(circle,var(--lh-aurora2),transparent 64%)',
            filter: 'blur(24px)', animation: 'lh-float2 22s ease-in-out infinite',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          maxWidth: 1220,
          margin: '0 auto',
          padding: 'clamp(56px,8vw,96px) 24px clamp(40px,6vw,64px)',
          textAlign: 'center',
        }}
      >
        {eyebrow && (
          <span className="lh-eyebrow" style={{ color: accent, display: 'block', marginBottom: 16 }}>
            {eyebrow}
          </span>
        )}
        <h1 className="lh-h1" style={{ margin: 0 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 'clamp(16px,2vw,19px)', lineHeight: 1.55, color: 'var(--lh-fg2)', maxWidth: 600, margin: '18px auto 0' }}>
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
