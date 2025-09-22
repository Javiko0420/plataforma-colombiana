'use client'

import * as React from 'react'
import { Languages } from 'lucide-react'
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
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
    >
      <Languages className="h-[1.2rem] w-[1.2rem] mr-2" />
      <span className="text-sm font-medium">
        {locale.toUpperCase()}
      </span>
    </button>
  )
}
