import { SVGAttributes } from 'react'

interface LeafSprigProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string
  color?: string
}

export function LeafSprig({
  size = 40,
  color = 'var(--lt-verde)',
  className,
  style,
  ...props
}: LeafSprigProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
      {...props}
    >
      {/* Tallo */}
      <path d="M 24 58 Q 24 32 24 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Hoja izquierda grande */}
      <path d="M 24 38 Q 8 28 10 14 Q 22 20 24 38 Z" fill={color} opacity="0.9" />
      {/* Hoja derecha grande */}
      <path d="M 24 28 Q 40 18 38 4 Q 26 10 24 28 Z" fill={color} />
      {/* Hoja izquierda pequeña */}
      <path d="M 24 20 Q 14 14 16 6 Q 22 10 24 20 Z" fill={color} opacity="0.7" />
      {/* Venas */}
      <path d="M 14 22 Q 18 26 24 38" stroke="var(--lt-ink)" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <path d="M 34 10 Q 30 18 24 28" stroke="var(--lt-ink)" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}
