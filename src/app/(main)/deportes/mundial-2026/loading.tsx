function SkeletonBar({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`lh-skeleton ${className ?? ''}`} style={{ borderRadius: 8, ...style }} />
}

export default function Loading() {
  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>
      {/* Hero skeleton — mantiene el ambiente oscuro del torneo */}
      <div
        style={{
          background: 'radial-gradient(ellipse 110% 90% at 50% -10%, #1e5c35 0%, #0d2a1a 50%, #071410 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '3.5rem 16px',
        }}
      >
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="animate-pulse" style={{ height: 16, width: 64, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }} />
          <div className="animate-pulse" style={{ height: 40, width: 320, borderRadius: 8, background: 'rgba(255,255,255,0.12)' }} />
          <div className="animate-pulse" style={{ height: 16, width: 256, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }} />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="lh-container" style={{ maxWidth: 980, paddingTop: 40, paddingBottom: 56, display: 'flex', flexDirection: 'column', gap: 48 }}>
        <SkeletonBar style={{ height: 160, borderRadius: 16 }} />
        <SkeletonBar style={{ height: 256, borderRadius: 16 }} />
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonBar style={{ height: 160, borderRadius: 16 }} />
          <SkeletonBar style={{ height: 160, borderRadius: 16 }} />
          <SkeletonBar style={{ height: 160, borderRadius: 16 }} />
        </div>
      </main>
    </div>
  )
}
