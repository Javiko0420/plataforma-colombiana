import { Button } from '@/components/lh/Button'

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      style={{ background: 'var(--lh-bg)', fontFamily: 'var(--lh-font)' }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: 'var(--lh-font)',
          fontSize: 'clamp(96px, 18vw, 160px)',
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-.04em',
          background: 'linear-gradient(120deg,var(--lh-accent),var(--lh-terra) 60%,var(--lh-warm))',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          marginBottom: 16,
        }}
      >
        404
      </span>

      <h1 className="lh-h2" style={{ fontSize: 'clamp(22px,3.4vw,30px)', margin: '0 0 10px' }}>
        Esta página no existe
      </h1>
      <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--lh-fg2)', maxWidth: 420, margin: '0 0 32px' }}>
        Puede que el enlace esté roto o que la página haya sido movida. ¡Pero no te preocupes, hay mucho más por explorar!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button href="/" variant="primary" size="md">Volver al inicio</Button>
        <Button href="/directorio" variant="secondary" size="md">Ver el directorio</Button>
      </div>
    </div>
  )
}
