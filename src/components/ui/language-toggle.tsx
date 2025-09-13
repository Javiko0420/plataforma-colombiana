'use client'

import * as React from 'react'
import { Languages } from 'lucide-react'
import { useTranslations } from '@/components/providers/language-provider'

export function LanguageToggle() {
  const { locale, setLocale } = useTranslations()

  const toggleLanguage = React.useCallback(() => {
    const newLang = locale === 'es' ? 'en' : 'es'
    void setLocale(newLang)
  }, [locale, setLocale])

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
