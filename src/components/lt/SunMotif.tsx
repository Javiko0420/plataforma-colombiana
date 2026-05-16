import { SVGAttributes } from 'react'

interface SunMotifProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string
  color?: string
  coreColor?: string
}

export function SunMotif({
  size = 52,
  color = 'var(--lt-sun)',
  coreColor = 'var(--lt-sun-core)',
  className,
  style,
  ...props
}: SunMotifProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
      {...props}
    >
      {/* Rayos exteriores */}
      <g stroke={color} strokeWidth="3.5" strokeLinecap="round">
        <line x1="40" y1="4"  x2="40" y2="14" />
        <line x1="40" y1="66" x2="40" y2="76" />
        <line x1="4"  y1="40" x2="14" y2="40" />
        <line x1="66" y1="40" x2="76" y2="40" />
        <line x1="12.7" y1="12.7" x2="19.8" y2="19.8" />
        <line x1="60.2" y1="60.2" x2="67.3" y2="67.3" />
        <line x1="67.3" y1="12.7" x2="60.2" y2="19.8" />
        <line x1="19.8" y1="60.2" x2="12.7" y2="67.3" />
        {/* Rayos intermedios */}
        <line x1="25"  y1="6"   x2="27"  y2="15" opacity="0.6" />
        <line x1="55"  y1="65"  x2="53"  y2="74" opacity="0.6" />
        <line x1="6"   y1="25"  x2="15"  y2="27" opacity="0.6" />
        <line x1="65"  y1="55"  x2="74"  y2="53" opacity="0.6" />
        <line x1="6"   y1="55"  x2="15"  y2="53" opacity="0.6" />
        <line x1="65"  y1="25"  x2="74"  y2="27" opacity="0.6" />
        <line x1="25"  y1="74"  x2="27"  y2="65" opacity="0.6" />
        <line x1="55"  y1="6"   x2="53"  y2="15" opacity="0.6" />
      </g>
      {/* Círculo exterior */}
      <circle cx="40" cy="40" r="18" fill={color} />
      {/* Núcleo */}
      <circle cx="40" cy="40" r="11" fill={coreColor} />
    </svg>
  )
}
