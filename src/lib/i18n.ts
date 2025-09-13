import es from '@/i18n/es.json'
import en from '@/i18n/en.json'

export type SupportedLocale = 'es' | 'en'

const supportedLocales: SupportedLocale[] = ['es', 'en']
const defaultLocale: SupportedLocale = 'es'
const LOCALE_COOKIE = 'locale'

const messagesByLocale: Record<SupportedLocale, Record<string, string>> = {
  es,
  en,
}

export function isSupportedLocale(locale: string | undefined | null): locale is SupportedLocale {
  return !!locale && (supportedLocales as string[]).includes(locale)
}

export function getDefaultLocale(): SupportedLocale {
  return defaultLocale
}

export function getMessages(locale: SupportedLocale): Record<string, string> {
  return messagesByLocale[locale]
}

export function translate(
  key: string,
  options?: { locale?: SupportedLocale; fallback?: string }
): string {
  const locale = options?.locale ?? defaultLocale
  const messages = getMessages(locale)
  return messages[key] ?? options?.fallback ?? key
}

export function getSupportedLocales(): SupportedLocale[] {
  return supportedLocales
}

export function getLocaleCookieName(): string {
  return LOCALE_COOKIE
}


