export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--lh-bg)', minHeight: '60vh', fontFamily: 'var(--lh-font)' }}
      role="status"
      aria-live="polite"
      aria-label="Cargando contenido"
    >
      <span
        className="animate-spin"
        style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid var(--lh-border)', borderTopColor: 'var(--lh-accent)' }}
        aria-hidden="true"
      />
      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-fg3)' }}>Cargando…</p>
    </div>
  )
}
