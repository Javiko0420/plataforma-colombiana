import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LtCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Índice en el mapa — determina rotación determinística (no random en runtime) */
  index?: number
  /** Tono de fondo */
  tone?: 'paper' | 'bg' | 'terracota' | 'sun' | 'verde' | 'accent'
  /** Desactiva la rotación */
  noRotate?: boolean
  /** Sombra sticker: sm | md | xl */
  shadow?: 'sm' | 'md' | 'xl'
}

const toneMap: Record<string, string> = {
  paper:     'bg-[var(--lt-paper)]',
  bg:        'bg-[var(--lt-bg)]',
  terracota: 'bg-[var(--lt-terracota)] text-[var(--lt-paper)]',
  sun:       'bg-[var(--lt-sun)] text-[var(--lt-ink)]',
  verde:     'bg-[var(--lt-verde)] text-[var(--lt-paper)]',
  accent:    'bg-[var(--lt-accent)] text-[var(--lt-paper)]',
}

const shadowMap = {
  sm: 'shadow-[var(--lt-shadow-sticker)]',
  md: 'shadow-[var(--lt-shadow-sticker-lg)]',
  xl: 'shadow-[var(--lt-shadow-sticker-xl)]',
}

/** Rotación determinística ±1.5° basada en el índice para evitar reflow */
function indexRotation(index: number): number {
  const rotations = [-1.5, 1.2, -0.8, 1.5, -1.2, 0.9, -1.4, 1.1]
  return rotations[index % rotations.length]
}

export function LtCard({
  children,
  index = 0,
  tone = 'paper',
  noRotate = false,
  shadow = 'md',
  className,
  style,
  ...props
}: LtCardProps) {
  const rotation = noRotate ? 0 : indexRotation(index)

  return (
    <div
      data-lt-rotate={!noRotate && rotation !== 0 ? 'true' : undefined}
      className={cn(
        'rounded-[var(--lt-radius-md)] border-[2.2px] border-[var(--lt-ink)]',
        'overflow-hidden transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-[var(--lt-shadow-sticker-xl)]',
        toneMap[tone],
        shadowMap[shadow],
        className,
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/** Header de card con icono tonal */
interface LtCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  iconTone?: 'terracota' | 'sun' | 'verde' | 'accent'
  children: ReactNode
}

const iconToneMap: Record<string, string> = {
  terracota: 'bg-[var(--lt-terracota)] text-[var(--lt-paper)]',
  sun:       'bg-[var(--lt-sun)] text-[var(--lt-ink)]',
  verde:     'bg-[var(--lt-verde)] text-[var(--lt-paper)]',
  accent:    'bg-[var(--lt-accent)] text-[var(--lt-paper)]',
}

export function LtCardHeader({ icon, iconTone = 'terracota', children, className, ...props }: LtCardHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3 p-4 border-b-[2.2px] border-[var(--lt-ink)]', className)} {...props}>
      {icon && (
        <div
          aria-hidden="true"
          className={cn(
            'w-10 h-10 rounded-[var(--lt-radius-sm)] flex items-center justify-center shrink-0',
            'border-2 border-[var(--lt-ink)] shadow-[2px_2px_0_var(--lt-ink)]',
            iconToneMap[iconTone],
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

export function LtCardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  )
}

export function LtCardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-4 py-3 border-t-[2.2px] border-[var(--lt-ink)] flex items-center justify-between gap-3', className)} {...props}>
      {children}
    </div>
  )
}
