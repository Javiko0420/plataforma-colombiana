import { SVGAttributes } from 'react'

interface SunMotifProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string
  color?: string
  coreColor?: string
  /** Ring delgado de contorno del núcleo (mismo color que `color`); por defecto true */
  showCoreRing?: boolean
}

export function SunMotif({
  size = 52,
  color = 'var(--lt-sun)',
  coreColor = 'var(--lt-sun-core)',
  showCoreRing = true,
  className,
  style,
  ...props
}: SunMotifProps) {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * 360) / 16
    return (
      <line
        key={i}
        x1="50"
        y1="14"
        x2="50"
        y2="22"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        transform={`rotate(${angle} 50 50)`}
      />
    )
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ filter: 'url(#lt-wobble-soft)', ...style }}
      data-lt-wobble="true"
      {...props}
    >
      <circle cx="50" cy="50" r="20" fill={color} />
      <circle cx="50" cy="50" r="20" fill={coreColor} />
      {showCoreRing && (
        <circle cx="50" cy="50" r="20" fill="none" stroke={color} strokeWidth="1.4" />
      )}
      {rays}
    </svg>
  )
}
