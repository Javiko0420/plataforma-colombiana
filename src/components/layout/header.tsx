'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, User, LogOut, UserCircle, Settings, Building2, PlusCircle, Shield } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ScreenReader } from '@/lib/accessibility'
import { useTranslations } from '@/components/providers/language-provider'
import { SunMotif } from '@/components/lt/SunMotif'
import { LtButton } from '@/components/lt/Button'
import { cn } from '@/lib/utils'

const ALLOWED_ADMIN_DOMAINS = ['@latinterritory.com', '@javiwarrior.com']

const NAV_LINKS = [
  { href: '/',          labelKey: 'nav.home' },
  { href: '/directorio', labelKey: 'nav.directory' },
  { href: '/empleos',   labelKey: 'nav.jobs' },
  { href: '/eventos',   labelKey: 'nav.events' },
  { href: '/foros',     labelKey: 'nav.forums' },
  { href: '/deportes',  labelKey: 'nav.sports' },
  { href: '/clima',     labelKey: 'nav.weather' },
  { href: '/tasas',     labelKey: 'nav.rates' },
]

export function Header() {
  const { t } = useTranslations()
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)

  const userEmail = session?.user?.email || ''
  const hasAdminRole = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR'
  const hasCorporateEmail = ALLOWED_ADMIN_DOMAINS.some(domain => userEmail.endsWith(domain))
  const showAdminPanel = hasAdminRole && hasCorporateEmail

  const toggleMobileMenu = () => {
    const next = !isMenuOpen
    setIsMenuOpen(next)
    ScreenReader.announce(next ? t('sr.menu.open') : t('sr.menu.closed'), 'polite')
  }

  const toggleUserMenu = () => setIsUserMenuOpen(prev => !prev)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current && !userMenuRef.current.contains(e.target as Node) &&
        userMenuButtonRef.current && !userMenuButtonRef.current.contains(e.target as Node)
      ) setIsUserMenuOpen(false)
    }
    if (isUserMenuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isUserMenuOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isMenuOpen) return
      if (e.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
        ScreenReader.announce(t('sr.menu.closed.short'), 'polite')
      }
    }
    if (isMenuOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isMenuOpen, t])

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      className="border-b-[2px] border-[var(--lt-ink)]"
      style={{ background: 'var(--lt-bg)' }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] focus:ring-offset-2 rounded-lg p-1 group"
            aria-label={`${t('app.name')} - ${t('nav.home')}`}
          >
            <SunMotif size={40} className="shrink-0 transition-transform group-hover:scale-105" />
            <div className="flex flex-col leading-tight">
              <span
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
              >
                Latin <em style={{ color: 'var(--lt-terracota)', fontStyle: 'italic' }}>Territory</em>
              </span>
              <span
                className="text-[10px] font-medium tracking-wide"
                style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
              >
                ¡Australia, esto es nuestro! ✦
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav
            className="hidden md:flex items-center gap-1"
            role="navigation"
            aria-label={t('app.name')}
          >
            {NAV_LINKS.map(({ href, labelKey }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm font-medium rounded-[var(--lt-radius-pill)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] focus:ring-offset-2"
                style={isActive(href)
                  ? { background: 'var(--lt-ink)', color: 'var(--lt-paper)' }
                  : { color: 'var(--lt-ink)' }
                }
                aria-current={isActive(href) ? 'page' : undefined}
              >
                {t(labelKey)}
              </Link>
            ))}
          </nav>

          {/* ── Right controls ── */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageToggle />

            {/* User menu */}
            <div className="relative">
              {status === 'loading' ? (
                <div className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <div
                    className="animate-spin h-5 w-5 rounded-full border-2"
                    style={{ borderColor: 'var(--lt-ink-soft)', borderTopColor: 'var(--lt-terracota)' }}
                  />
                </div>
              ) : session ? (
                <>
                  <button
                    ref={userMenuButtonRef}
                    onClick={toggleUserMenu}
                    className="p-2 rounded-[var(--lt-radius-sm)] min-h-[44px] min-w-[44px] flex items-center justify-center border-[1.6px] border-[var(--lt-ink)] hover:bg-[var(--lt-paper)] focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] focus:ring-offset-2"
                    style={{ color: 'var(--lt-ink)', boxShadow: 'var(--lt-shadow-sticker)' }}
                    aria-label={t('header.userMenu')}
                    aria-expanded={isUserMenuOpen}
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      ref={userMenuRef}
                      className="absolute right-0 mt-2 w-56 rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)] py-2 z-50"
                      style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
                      role="menu"
                    >
                      <div
                        className="px-4 py-3 border-b-[2px] border-[var(--lt-ink)]"
                        style={{ borderColor: 'var(--lt-ink)' }}
                      >
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--lt-ink)', fontFamily: 'var(--lt-font-serif)' }}>
                          {session.user?.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--lt-ink-soft)' }}>
                          {session.user?.email}
                        </p>
                      </div>

                      {showAdminPanel && (
                        <>
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2 text-sm font-semibold transition-colors hover:opacity-80"
                            style={{ color: 'var(--lt-terracota)' }}
                            onClick={() => setIsUserMenuOpen(false)}
                            role="menuitem"
                          >
                            <Shield className="h-4 w-4" aria-hidden="true" />
                            Panel de Control
                          </Link>
                          <div className="border-t border-[var(--lt-ink)]/20 my-1" />
                        </>
                      )}

                      {[
                        { href: '/perfil', icon: UserCircle, label: t('auth.profile') },
                        { href: '/perfil/configuracion', icon: Settings, label: t('profile.settings.title') },
                        { href: '/registrar-negocio', icon: PlusCircle, label: 'Registrar mi Negocio' },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-[var(--lt-bg)]"
                          style={{ color: 'var(--lt-ink)' }}
                          onClick={() => setIsUserMenuOpen(false)}
                          role="menuitem"
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {label}
                        </Link>
                      ))}

                      <div className="border-t border-[var(--lt-ink)]/20 my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors hover:bg-[var(--lt-bg)]"
                        style={{ color: 'var(--lt-terracota)' }}
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {t('auth.logout')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <LtButton
                  variant="sticker"
                  tone="sun"
                  size="sm"
                  rotate={-1.2}
                  iconLeft={<User className="h-4 w-4" aria-hidden="true" />}
                  className="hidden md:inline-flex"
                  onClick={() => { window.location.href = '/auth/signin' }}
                  aria-label={t('auth.login.title')}
                >
                  {t('auth.login.title')}
                </LtButton>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              ref={menuButtonRef}
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-[var(--lt-radius-sm)] min-h-[44px] min-w-[44px] flex items-center justify-center border-[1.6px] border-[var(--lt-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] focus:ring-offset-2"
              style={{ color: 'var(--lt-ink)', boxShadow: 'var(--lt-shadow-sticker)' }}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? t('sr.menu.closed') : t('sr.menu.open')}
            >
              {isMenuOpen
                ? <X className="h-6 w-6" aria-hidden="true" />
                : <Menu className="h-6 w-6" aria-hidden="true" />
              }
            </button>
          </div>
        </div>

        {/* ── Mobile Nav ── */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            role="navigation"
            aria-label="Menú de navegación móvil"
            className="md:hidden"
          >
            <div
              ref={mobileMenuRef}
              className="px-2 pt-2 pb-4 space-y-1 rounded-[var(--lt-radius-lg)] mt-2 mb-2 border-[2px] border-[var(--lt-ink)]"
              style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
            >
              {NAV_LINKS.map(({ href, labelKey }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center px-4 py-3 text-base font-medium rounded-[var(--lt-radius-sm)] min-h-[48px] focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] focus:ring-offset-2 transition-colors"
                  style={isActive(href) ? { background: 'var(--lt-ink)', color: 'var(--lt-paper)' } : { color: 'var(--lt-ink)' }}
                  aria-current={isActive(href) ? 'page' : undefined}
                  onClick={() => {
                    setIsMenuOpen(false)
                    ScreenReader.announce(t(`sr.nav.to.${labelKey.split('.')[1]}`), 'polite')
                  }}
                >
                  {t(labelKey)}
                </Link>
              ))}

              <div className="border-t-[2px] border-[var(--lt-ink)] my-2 mx-2" />

              {status === 'loading' ? (
                <div className="px-4 py-3 flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 rounded-full border-2" style={{ borderColor: 'var(--lt-ink-soft)', borderTopColor: 'var(--lt-terracota)' }} />
                </div>
              ) : session ? (
                <>
                  <div className="px-4 py-2 text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
                    {session.user?.name}
                  </div>

                  {showAdminPanel && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 font-semibold rounded-[var(--lt-radius-sm)] min-h-[48px] transition-colors hover:opacity-80"
                      style={{ color: 'var(--lt-terracota)' }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield className="h-5 w-5" aria-hidden="true" />
                      Panel de Control
                    </Link>
                  )}

                  <Link href="/perfil" className="flex items-center gap-3 px-4 py-3 rounded-[var(--lt-radius-sm)] min-h-[48px] transition-colors hover:bg-[var(--lt-bg)]" style={{ color: 'var(--lt-ink)' }} onClick={() => setIsMenuOpen(false)}>
                    <UserCircle className="h-5 w-5" aria-hidden="true" />
                    {t('auth.profile')}
                  </Link>
                  <Link href="/registrar-negocio" className="flex items-center gap-3 px-4 py-3 rounded-[var(--lt-radius-sm)] min-h-[48px] transition-colors hover:bg-[var(--lt-bg)]" style={{ color: 'var(--lt-ink)' }} onClick={() => setIsMenuOpen(false)}>
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                    Registrar Negocio
                  </Link>
                  <button onClick={() => { setIsMenuOpen(false); handleLogout() }} className="flex items-center gap-3 w-full px-4 py-3 rounded-[var(--lt-radius-sm)] min-h-[48px] transition-colors hover:bg-[var(--lt-bg)]" style={{ color: 'var(--lt-terracota)' }}>
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    {t('auth.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="flex items-center gap-3 px-4 py-3 rounded-[var(--lt-radius-sm)] min-h-[48px] transition-colors hover:bg-[var(--lt-bg)]" style={{ color: 'var(--lt-ink)' }} onClick={() => setIsMenuOpen(false)}>
                    <User className="h-5 w-5" aria-hidden="true" />
                    {t('auth.login.title')}
                  </Link>
                  <Link href="/auth/signup" className="flex items-center gap-3 px-4 py-3 rounded-[var(--lt-radius-sm)] min-h-[48px] font-semibold" style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)' }} onClick={() => setIsMenuOpen(false)}>
                    <User className="h-5 w-5" aria-hidden="true" />
                    {t('auth.signup.title')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
