'use client'

import * as React from 'react'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const [language, setLanguage] = React.useState('es')

  const toggleLanguage = () => {
    const newLang = language === 'es' ? 'en' : 'es'
    setLanguage(newLang)
    // Here we would implement the actual language switching logic
    // For now, we'll just store it in localStorage
    localStorage.setItem('language', newLang)
  }

  React.useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'es'
    setLanguage(savedLang)
  }, [])

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
    >
      <Languages className="h-[1.2rem] w-[1.2rem] mr-2" />
      <span className="text-sm font-medium">
        {language.toUpperCase()}
      </span>
    </button>
  )
}
