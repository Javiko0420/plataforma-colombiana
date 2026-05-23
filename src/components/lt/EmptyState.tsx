import { ReactNode } from 'react'
import { SunMotif } from './SunMotif'

interface LtEmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}

export function LtEmptyState({ title, description, action, icon }: LtEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-[var(--lt-radius-lg)] border-[2px] border-dashed border-[var(--lt-ink)]"
      style={{ background: 'var(--lt-bg)' }}
    >
      <div aria-hidden="true" className="mb-4 opacity-25">
        {icon ?? <SunMotif size={56} />}
      </div>
      <p
        className="text-base font-semibold mb-1"
        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
      >
        {title}
      </p>
      {description && (
        <p
          className="text-sm max-w-md mx-auto mb-5"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
