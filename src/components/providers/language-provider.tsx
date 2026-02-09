'use client'

import * as React from 'react'
import { getLocaleCookieName, getMessages, getSupportedLocales, type SupportedLocale } from '@/lib/i18n'

type MessagesMap = Record<string, string>

type LanguageContextValue = {
  locale: SupportedLocale
  messages: MessagesMap
  t: (key: string, fallback?: string) => string
  setLocale: (locale: SupportedLocale) => Promise<void>
  translateText: (text: string, target?: SupportedLocale, source?: string) => Promise<string>
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined)

async function fetchMessages(locale: SupportedLocale): Promise<MessagesMap> {
  const res = await fetch(`/api/i18n/messages?locale=${locale}`, { cache: 'no-store' })
  if (!res.ok) return {}
  const json = await res.json()
  return json?.data?.messages ?? {}
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<SupportedLocale>('es')
  // Pre-populate with static translations so keys render immediately
  const [messages, setMessages] = React.useState<MessagesMap>(() => getMessages('es'))
  const [mounted, setMounted] = React.useState(false)

  // Initialize from cookie on mount
  React.useEffect(() => {
    const cookieName = getLocaleCookieName()
    const cookieMap = Object.fromEntries(document.cookie.split('; ').map(c => c.split('=')))
    const initial = (cookieMap[cookieName] as SupportedLocale | undefined) ?? 'es'
    const validLocales = getSupportedLocales()
    const startLocale = validLocales.includes(initial) ? initial : 'es'
    setLocaleState(startLocale)
    // Load static messages for the resolved locale immediately
    setMessages(getMessages(startLocale))
    setMounted(true)
  }, [])

  // Refresh messages from API when locale changes (picks up auto-translated keys)
  React.useEffect(() => {
    if (!mounted) return
    fetchMessages(locale).then(setMessages).catch(() => {
      // Fallback to static messages if API fails
      setMessages(getMessages(locale))
    })
    // Update cookie client-side
    const cookieName = getLocaleCookieName()
    document.cookie = `${cookieName}=${locale}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`
    // Update <html lang>
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale, mounted])

  const translate = React.useCallback(
    (key: string, fallback?: string) => {
      return messages[key] ?? fallback ?? key
    },
    [messages]
  )

  const setLocale = React.useCallback(async (newLocale: SupportedLocale) => {
    // Load static messages immediately to avoid showing raw keys
    setMessages(getMessages(newLocale))
    setLocaleState(newLocale)
  }, [])

  const translateText = React.useCallback(async (
    text: string,
    target: SupportedLocale = locale,
    source?: string
  ) => {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target, source }),
    })
    if (!res.ok) return text
    const json = await res.json()
    return json?.data?.translated ?? text
  }, [locale])

  const value: LanguageContextValue = React.useMemo(
    () => ({ locale, messages, t: translate, setLocale, translateText }),
    [locale, messages, translate, setLocale, translateText]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useTranslations() {
  const ctx = React.useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslations must be used within LanguageProvider')
  return ctx
}


