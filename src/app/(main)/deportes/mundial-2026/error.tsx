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
      className="max-w-5xl mx-auto px-4 py-20 text-center"
      style={{ background: 'var(--lt-bg)', minHeight: '100vh' }}
    >
      <h2
        className="text-xl font-bold mb-3"
        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
      >
        No se pudo cargar el Mundial 2026
      </h2>
      <p
        className="text-sm mb-8"
        style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
      >
        Ocurrió un error al cargar los datos. Por favor intenta de nuevo.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-sm font-bold"
          style={{
            background: 'var(--lt-terracota)',
            color: 'var(--lt-paper)',
            boxShadow: '2px 2px 0 var(--lt-ink)',
          }}
        >
          Reintentar
        </button>
        <Link
          href="/deportes"
          className="px-4 py-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] text-sm font-bold"
          style={{ background: 'var(--lt-paper)', color: 'var(--lt-ink)' }}
        >
          ← Deportes
        </Link>
      </div>
    </div>
  )
}
