import { SVGAttributes } from 'react'

interface HandDrawnUnderlineProps extends SVGAttributes<SVGSVGElement> {
  width?: number | string
  color?: string
  thickness?: number
}

export function HandDrawnUnderline({
  width = 200,
  color = 'var(--lt-terracota)',
  thickness = 3,
  className,
  style,
  ...props
}: HandDrawnUnderlineProps) {
  const w = typeof width === 'number' ? width : 200
  return (
    <svg
      width={width}
      height={thickness * 3 + 4}
      viewBox={`0 0 ${w} ${thickness * 3 + 4}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: 'block', ...style }}
      {...props}
    >
      {/* Línea principal levemente ondulada */}
      <path
        d={`M 2 ${thickness + 2} Q ${w * 0.25} ${thickness - 1} ${w * 0.5} ${thickness + 2} Q ${w * 0.75} ${thickness + 5} ${w - 2} ${thickness + 1}`}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        filter="url(#lt-wobble-soft)"
      />
    </svg>
  )
}
