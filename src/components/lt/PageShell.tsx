import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LtPageShellProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '5xl' | '7xl' | 'full'
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
}

export function LtPageShell({
  children,
  maxWidth = '7xl',
  className,
  ...props
}: LtPageShellProps) {
  return (
    <main
      className={cn('min-h-screen py-10 px-4 sm:px-6 lg:px-8', className)}
      style={{ background: 'var(--lt-bg)' }}
      {...props}
    >
      <div className={cn('mx-auto', maxWidthMap[maxWidth])}>
        {children}
      </div>
    </main>
  )
}
