import { PageSkeleton, RowSkeleton, SkeletonBox } from '@/components/lh/skeletons'

/** Skeleton del hub de foros: salas del día + hilos trending. */
export default function Loading() {
  return (
    <PageSkeleton>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18, marginBottom: 32 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} aria-hidden="true" style={{ borderRadius: 20, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <SkeletonBox style={{ width: '55%', height: 22, borderRadius: 6 }} />
            <SkeletonBox style={{ width: '80%', height: 14, borderRadius: 6 }} />
            <SkeletonBox style={{ height: 44, borderRadius: 12 }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)}
      </div>
    </PageSkeleton>
  )
}
