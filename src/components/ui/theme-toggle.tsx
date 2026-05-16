'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslations } from '@/components/providers/language-provider'

export function getNextTheme(current: string | undefined): 'light' | 'dark' {
  return current === 'light' ? 'dark' : 'light'
}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const { t } = useTranslations()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--lt-terracota)]"
      style={{ color: 'var(--lt-ink)' }}
      onMouseOver={e => (e.currentTarget.style.background = 'rgba(34,21,15,0.05)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
    >
      {mounted ? (
        isDark
          ? <Sun className="h-5 w-5" aria-hidden="true" />
          : <Moon className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="sr-only">{t('theme.toggle', 'Toggle theme')}</span>
    </button>
  )
}
