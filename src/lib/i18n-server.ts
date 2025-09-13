import { cookies } from 'next/headers'
import { getDefaultLocale, isSupportedLocale, type SupportedLocale } from '@/lib/i18n'

const LOCALE_COOKIE = 'locale'

export async function getServerLocale(): Promise<SupportedLocale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return isSupportedLocale(value) ? value : getDefaultLocale()
}

export async function setServerLocaleCookie(locale: SupportedLocale) {
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  })
}


