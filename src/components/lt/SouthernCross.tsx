import { SVGAttributes } from 'react'

interface SouthernCrossProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string
  color?: string
}

export function SouthernCross({
  size = 36,
  color = 'var(--lt-sun)',
  className,
  style,
  ...props
}: SouthernCrossProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
      {...props}
    >
      {/* Cruz del Sur — 4 estrellas principales + 1 pequeña */}
      {/* Alfa Crucis (abajo) */}
      <g transform="translate(30, 50)">
        <polygon points="0,-5.5 1.3,-1.7 5.2,-1.7 2.1,1 3.2,5 0,2.8 -3.2,5 -2.1,1 -5.2,-1.7 -1.3,-1.7" fill={color} />
      </g>
      {/* Beta Crucis (izquierda) */}
      <g transform="translate(8, 34)">
        <polygon points="0,-4.5 1.1,-1.4 4.3,-1.4 1.7,0.8 2.6,4.1 0,2.3 -2.6,4.1 -1.7,0.8 -4.3,-1.4 -1.1,-1.4" fill={color} />
      </g>
      {/* Gamma Crucis (arriba) */}
      <g transform="translate(30, 10)">
        <polygon points="0,-4.5 1.1,-1.4 4.3,-1.4 1.7,0.8 2.6,4.1 0,2.3 -2.6,4.1 -1.7,0.8 -4.3,-1.4 -1.1,-1.4" fill={color} />
      </g>
      {/* Delta Crucis (derecha) */}
      <g transform="translate(52, 22)">
        <polygon points="0,-4 1,-1.2 3.8,-1.2 1.5,0.7 2.3,3.7 0,2 -2.3,3.7 -1.5,0.7 -3.8,-1.2 -1,-1.2" fill={color} />
      </g>
      {/* Epsilon Crucis (pequeña, entre beta y delta) */}
      <g transform="translate(44, 36)">
        <polygon points="0,-2.8 0.7,-0.9 2.7,-0.9 1.1,0.5 1.6,2.6 0,1.4 -1.6,2.6 -1.1,0.5 -2.7,-0.9 -0.7,-0.9" fill={color} opacity="0.75" />
      </g>
    </svg>
  )
}
