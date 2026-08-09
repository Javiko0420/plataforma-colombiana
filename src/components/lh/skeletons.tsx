/**
 * Primitivas de skeleton para los loading.tsx por ruta.
 * Server components puros: siluetas con pulso que calcan la forma de cada
 * página (menos "salto" percibido que el spinner genérico).
 */

const boxBase: React.CSSProperties = { background: 'var(--lh-surface2)', borderRadius: 8 }

export function SkeletonBox({ style }: { style?: React.CSSProperties }) {
  return <div aria-hidden="true" style={{ ...boxBase, ...style }} />
}

/** Silueta de PageHeader: mismo padding que el real → sin salto al hidratar. */
export function PageHeaderSkeleton() {
  return (
    <section style={{ borderBottom: '1px solid var(--lh-border2)', background: 'var(--lh-bg)' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: 'clamp(56px,8vw,96px) 24px clamp(40px,6vw,64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <SkeletonBox style={{ width: 120, height: 14, borderRadius: 99 }} />
        <SkeletonBox style={{ width: 'min(420px, 70%)', height: 40 }} />
        <SkeletonBox style={{ width: 'min(520px, 85%)', height: 18 }} />
      </div>
    </section>
  )
}

/** Envoltorio común de página en carga (fondo + pulso + a11y). */
export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="animate-pulse"
      role="status"
      aria-label="Cargando contenido"
      aria-live="polite"
      style={{ background: 'var(--lh-bg)', minHeight: '100vh', paddingBottom: '4rem', fontFamily: 'var(--lh-font)' }}
    >
      <PageHeaderSkeleton />
      <div className="lh-container" style={{ paddingTop: 40 }}>
        {children}
      </div>
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

/** Tarjeta genérica con "imagen" arriba y líneas de texto (negocios/eventos). */
export function CardSkeleton({ imageHeight = 148 }: { imageHeight?: number }) {
  return (
    <div aria-hidden="true" style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--lh-surface)', border: '1px solid var(--lh-border)' }}>
      <div style={{ height: imageHeight, background: 'var(--lh-surface2)' }} />
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        <SkeletonBox style={{ width: 80, height: 18, borderRadius: 99 }} />
        <SkeletonBox style={{ width: '70%', height: 18, borderRadius: 6 }} />
        <SkeletonBox style={{ width: '50%', height: 14, borderRadius: 6 }} />
      </div>
    </div>
  )
}

/** Fila con avatar + líneas (foros, listados compactos). */
export function RowSkeleton() {
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '17px 19px', borderRadius: 15, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)' }}>
      <SkeletonBox style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SkeletonBox style={{ width: '70%', height: 15, borderRadius: 6 }} />
        <SkeletonBox style={{ width: '40%', height: 12, borderRadius: 6 }} />
      </div>
      <SkeletonBox style={{ width: 36, height: 16, borderRadius: 6, flexShrink: 0 }} />
    </div>
  )
}
