'use client'

import { useEffect } from 'react'

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
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4"
      style={{ background: 'var(--lt-bg)' }}
    >
      <div
        className="w-full max-w-md rounded-[var(--lt-radius-lg)] border-[2.5px] border-[var(--lt-terracota)] p-8"
        style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
      >
        <h2
          className="text-xl font-bold mb-3"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          Error al cargar el perfil
        </h2>
        <p className="text-sm mb-2" style={{ color: 'var(--lt-ink-soft)' }}>
          {error.message || 'Ocurrió un error inesperado.'}
        </p>
        {error.digest && (
          <p className="text-xs font-mono mb-4" style={{ color: 'var(--lt-ink-soft)' }}>
            ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="mt-2 px-5 py-2 rounded-[var(--lt-radius-sm)] border-[2px] border-[var(--lt-ink)] text-sm font-semibold transition-colors hover:bg-[var(--lt-ink)] hover:text-[var(--lt-paper)]"
          style={{ color: 'var(--lt-ink)' }}
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
