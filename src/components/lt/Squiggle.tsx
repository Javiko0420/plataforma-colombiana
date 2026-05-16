import { SVGAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SquiggleProps extends SVGAttributes<SVGSVGElement> {
  width?: number | string
  height?: number
  color?: string
  amplitude?: number
}

export function Squiggle({
  width = 120,
  height = 12,
  color = 'var(--lt-terracota)',
  amplitude = 4,
  className,
  style,
  ...props
}: SquiggleProps) {
  const w = typeof width === 'number' ? width : 120
  const h = height
  const mid = h / 2
  const wavelength = 20

  const points: string[] = []
  for (let x = 0; x <= w; x += 2) {
    const y = mid + amplitude * Math.sin((x / wavelength) * Math.PI * 2)
    points.push(`${x},${y.toFixed(2)}`)
  }
  const d = `M ${points.join(' L ')}`

  return (
    <svg
      width={width}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={cn('overflow-visible', className)}
      style={style}
      {...props}
    >
      <path d={d} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
