function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse ${className ?? ''}`}
      style={{ background: 'var(--lt-ink-soft)', opacity: 0.15 }}
    />
  )
}

export default function Loading() {
  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh' }}>
      {/* Hero skeleton */}
      <div
        className="border-b-[2px] border-[var(--lt-ink)] py-14 px-4"
        style={{ background: 'var(--lt-paper)' }}
      >
        <div className="max-w-5xl mx-auto space-y-3">
          <SkeletonBar className="h-4 w-16" />
          <SkeletonBar className="h-10 w-80" />
          <SkeletonBar className="h-4 w-64" />
        </div>
      </div>

      {/* Content skeleton */}
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        <SkeletonBar className="h-40 w-full rounded-[var(--lt-radius-md)]" />
        <SkeletonBar className="h-64 w-full rounded-[var(--lt-radius-md)]" />
        <div className="grid gap-6 md:grid-cols-3">
          <SkeletonBar className="h-40 rounded-[var(--lt-radius-md)]" />
          <SkeletonBar className="h-40 rounded-[var(--lt-radius-md)]" />
          <SkeletonBar className="h-40 rounded-[var(--lt-radius-md)]" />
        </div>
      </main>
    </div>
  )
}
