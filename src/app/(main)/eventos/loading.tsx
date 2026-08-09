import { PageSkeleton, SkeletonBox } from '@/components/lh/skeletons'

/** Skeleton de eventos: banner + filtros + grid de tarjetas "poster". */
export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonBox style={{ height: 72, borderRadius: 16, marginBottom: 28 }} />
      <SkeletonBox style={{ height: 48, borderRadius: 12, marginBottom: 32 }} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonBox key={i} style={{ minHeight: 280, borderRadius: 20, border: '1px solid var(--lh-border)' }} />
        ))}
      </div>
    </PageSkeleton>
  )
}
