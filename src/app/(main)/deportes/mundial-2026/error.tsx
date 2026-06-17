'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function WorldcupError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[mundial-2026]', error.message)
  }, [error])

  return (
    <div
      className="lh-container text-center"
      style={{ maxWidth: 980, padding: '80px 24px', minHeight: '100vh', background: 'var(--lh-bg)', fontFamily: 'var(--lh-font)' }}
    >
      <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: '0 0 12px' }}>
        No se pudo cargar el Mundial 2026
      </h2>
      <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '0 0 28px' }}>
        Ocurrió un error al cargar los datos. Por favor intenta de nuevo.
      </p>
      <div className="flex justify-center gap-3">
        <button onClick={reset} className="lh-btn lh-btn--md lh-btn--primary">
          Reintentar
        </button>
        <Link href="/deportes" className="lh-btn lh-btn--md lh-btn--secondary">
          ← Deportes
        </Link>
      </div>
    </div>
  )
}
