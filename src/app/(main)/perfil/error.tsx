'use client'

import { useEffect } from 'react'
import { Button } from '@/components/lh/Button'

export default function PerfilError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[/perfil error boundary]', error)
  }, [error])

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '0 24px', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-card" style={{ width: '100%', maxWidth: 440, padding: 'clamp(24px,5vw,32px)', borderColor: 'color-mix(in oklch, var(--lh-terra) 35%, var(--lh-border))' }}>
        <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 20, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 12px' }}>
          Error al cargar el perfil
        </h2>
        <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '0 0 8px' }}>
          {error.message || 'Ocurrió un error inesperado.'}
        </p>
        {error.digest && (
          <p style={{ fontSize: 12, fontFamily: 'var(--lh-mono)', color: 'var(--lh-fg3)', margin: '0 0 16px' }}>
            ID: {error.digest}
          </p>
        )}
        <Button onClick={reset} variant="primary" size="sm" style={{ marginTop: 8 }}>
          Reintentar
        </Button>
      </div>
    </div>
  )
}
