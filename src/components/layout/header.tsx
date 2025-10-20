'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, Search, User, LogOut, UserCircle, Settings } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ScreenReader } from '@/lib/accessibility'
import { useTranslations } from '@/components/providers/language-provider'

export function Header() {
  const { t } = useTranslations()
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)

  // Handle mobile menu toggle with accessibility
  const toggleMobileMenu = () => {
    const newState = !isMenuOpen
    setIsMenuOpen(newState)
    
    // Announce state change to screen readers
    ScreenReader.announce(
      newState ? t('sr.menu.open') : t('sr.menu.closed'),
      'polite'
    )
  }

  // Handle user menu toggle
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node) &&
        userMenuButtonRef.current &&
        !userMenuButtonRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false)
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  // Handle keyboard navigation for mobile menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMenuOpen) return

      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
        ScreenReader.announce(t('sr.menu.closed.short'), 'polite')
      }
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen, t])

  return (
    <header 
      className="bg-background text-foreground shadow-lg border-b border-border"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md p-1"
              aria-label={`${t('app.name')} - ${t('nav.home')}`}
            >
              <div 
                className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                {t('app.name')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav 
            className="hidden md:flex items-center gap-x-10"
            role="navigation"
            aria-label={t('app.name')}
          >
            <Link 
              href="/" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              {t('nav.home')}
            </Link>
            <Link 
              href="/directorio" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              {t('nav.directory')}
            </Link>
            <Link 
              href="/foros" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              {t('nav.forums')}
            </Link>
            <Link 
              href="/deportes" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              {t('nav.sports')}
            </Link>
            <Link 
              href="/clima" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              {t('nav.weather')}
            </Link>
            <Link 
              href="/tasas" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              {t('nav.rates')}
            </Link>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button 
              className="p-2 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={t('header.search.aria')}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Language toggle */}
            <LanguageToggle />

            {/* User menu */}
            <div className="relative">
              {status === 'loading' ? (
                <div className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                </div>
              ) : session ? (
                <>
                  <button
                    ref={userMenuButtonRef}
                    onClick={toggleUserMenu}
                    className="p-2 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={t('header.userMenu')}
                    aria-expanded={isUserMenuOpen}
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* User dropdown menu */}
                  {isUserMenuOpen && (
                    <div
                      ref={userMenuRef}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                      role="menu"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {session.user?.email}
                        </p>
                      </div>

                      <Link
                        href="/perfil"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <UserCircle className="h-4 w-4" aria-hidden="true" />
                        {t('auth.profile')}
                      </Link>

                      <Link
                        href="/perfil/configuracion"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        {t('profile.settings.title')}
                      </Link>

                      <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {t('auth.logout')}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  aria-label={t('auth.login.title')}
                >
                  <User className="h-4 w-4" aria-hidden="true" />
                  <span>{t('auth.login.title')}</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              ref={menuButtonRef}
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? t('sr.menu.closed') : t('sr.menu.open')}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            className="md:hidden"
            id="mobile-menu"
            role="navigation"
            aria-label="Menú de navegación móvil"
          >
            <div 
              ref={mobileMenuRef}
              className="px-2 pt-2 pb-3 space-y-3 sm:px-3 bg-background rounded-lg mt-2 border border-border"
            >
              <Link
                href="/"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce(t('sr.nav.to.home'), 'polite')
                }}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/directorio"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce(t('sr.nav.to.directory'), 'polite')
                }}
              >
                {t('nav.directory')}
              </Link>
              <Link
                href="/foros"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce(t('sr.nav.to.forums'), 'polite')
                }}
              >
                {t('nav.forums')}
              </Link>
              <Link
                href="/deportes"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce(t('sr.nav.to.sports'), 'polite')
                }}
              >
                {t('nav.sports')}
              </Link>
              <Link
                href="/clima"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce(t('sr.nav.to.weather'), 'polite')
                }}
              >
                {t('nav.weather')}
              </Link>
              <Link
                href="/tasas"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce(t('sr.nav.to.rates'), 'polite')
                }}
              >
                {t('nav.rates')}
              </Link>

              {/* Mobile user menu */}
              <div className="border-t border-border my-2" />
              
              {status === 'loading' ? (
                <div className="px-4 py-3 flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                </div>
              ) : session ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {session.user?.name}
                  </div>
                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCircle className="h-5 w-5" aria-hidden="true" />
                    {t('auth.profile')}
                  </Link>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false)
                      handleLogout()
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 dark:text-red-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px]"
                  >
                    <LogOut className="h-5 w-5" aria-hidden="true" />
                    {t('auth.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-5 w-5" aria-hidden="true" />
                    {t('auth.login.title')}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px]"
                    onClick={() => setIsMenuOpen(false)}
                  >
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
