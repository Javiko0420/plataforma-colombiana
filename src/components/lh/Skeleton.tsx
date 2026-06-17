import type { CSSProperties } from 'react'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: number
  style?: CSSProperties
}

/** Placeholder de carga con shimmer (se desactiva con prefers-reduced-motion). */
export function Skeleton({ width = '100%', height = 16, radius = 8, style }: SkeletonProps) {
  return <span className="lh-skeleton" style={{ width, height, borderRadius: radius, ...style }} />
}
