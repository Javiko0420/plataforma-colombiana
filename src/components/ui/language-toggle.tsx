'use client'

import * as React from 'react'
import { Globe } from 'lucide-react'
import { useTranslations } from '@/components/providers/language-provider'
import { useRouter } from 'next/navigation'
import { getLocaleCookieName } from '@/lib/i18n'

export function LanguageToggle() {
  const { locale, setLocale } = useTranslations()
  const router = useRouter()

  const toggleLanguage = React.useCallback(() => {
    const newLang = locale === 'es' ? 'en' : 'es'
    // Update context (client messages)
    void setLocale(newLang)
    // Persist cookie immediately for server-rendered pages and refresh
    try {
      const name = getLocaleCookieName()
      document.cookie = `${name}=${newLang}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
    } catch {}
    router.refresh()
  }, [locale, setLocale, router])

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Cambiar idioma"
      className="inline-flex items-center gap-1.5 px-2 h-10 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--lt-terracota)]"
      style={{ color: 'var(--lt-ink)', fontFamily: 'var(--lt-font-sans)' }}
      onMouseOver={e => (e.currentTarget.style.background = 'rgba(34,21,15,0.05)')}
      onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
    >
      <Globe className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
      <span className="text-sm font-semibold uppercase tracking-wide">
        {locale}
      </span>
    </button>
  )
}
