import { SunMotif } from '@/components/lt/SunMotif'

export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4"
      style={{ background: 'var(--lt-bg)' }}
      role="status"
      aria-live="polite"
      aria-label="Cargando contenido"
    >
      <div className="animate-spin" style={{ animationDuration: '1.4s' }}>
        <SunMotif size={64} />
      </div>
      <p
        className="text-sm font-medium"
        style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
      >
        Cargando…
      </p>
    </div>
  )
}
