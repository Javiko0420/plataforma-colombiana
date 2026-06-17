import type { ReactNode } from 'react'

interface LegalLayoutProps {
  title: string
  /** Texto de "Última actualización: …" */
  lastUpdated: string
  children: ReactNode
}

/**
 * Envoltorio para páginas legales (términos, privacidad, normas…).
 * El contenido legal va como children en HTML plano (h2/h3/p/ul);
 * el estilo lo aplica la clase `.lh-legal` sobre los descendientes.
 */
export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ maxWidth: 900, paddingTop: 40, paddingBottom: 64 }}>
        <div className="lh-card" style={{ padding: 'clamp(24px,5vw,48px)' }}>
          <div style={{ borderBottom: '1px solid var(--lh-border)', paddingBottom: 28, marginBottom: 28 }}>
            <h1 className="lh-h2" style={{ fontSize: 'clamp(26px,4vw,36px)', margin: '0 0 12px' }}>{title}</h1>
            <p style={{ color: 'var(--lh-fg3)', fontSize: 14, margin: 0 }}>{lastUpdated}</p>
          </div>
          <article className="lh-legal">
            {children}
          </article>
        </div>
      </div>
    </div>
  )
}
