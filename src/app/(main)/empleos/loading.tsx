import { PageSkeleton, SkeletonBox } from '@/components/lh/skeletons'

/** Skeleton del muro de empleos: banner + filtros + grid de tarjetas. */
export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonBox style={{ height: 72, borderRadius: 16, marginBottom: 28 }} />
      <SkeletonBox style={{ height: 48, borderRadius: 12, marginBottom: 32 }} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} aria-hidden="true" style={{ borderRadius: 18, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <SkeletonBox style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0 }} />
              <SkeletonBox style={{ flex: 1, height: 20, borderRadius: 6, marginTop: 4 }} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <SkeletonBox style={{ width: 90, height: 26, borderRadius: 99 }} />
              <SkeletonBox style={{ width: 70, height: 26, borderRadius: 99 }} />
            </div>
            <SkeletonBox style={{ height: 60, borderRadius: 8 }} />
            <SkeletonBox style={{ height: 16, width: '40%', borderRadius: 6 }} />
          </div>
        ))}
      </div>
    </PageSkeleton>
  )
}
