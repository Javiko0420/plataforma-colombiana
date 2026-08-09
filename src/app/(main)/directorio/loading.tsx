import { PageSkeleton, CardSkeleton, SkeletonBox } from '@/components/lh/skeletons'

/** Skeleton del directorio: buscador + grid de tarjetas de negocio. */
export default function Loading() {
  return (
    <PageSkeleton>
      <SkeletonBox style={{ height: 52, borderRadius: 15, marginBottom: 28 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </PageSkeleton>
  )
}
