'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, Search, User } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { ScreenReader } from '@/lib/accessibility'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Handle mobile menu toggle with accessibility
  const toggleMobileMenu = () => {
    const newState = !isMenuOpen
    setIsMenuOpen(newState)
    
    // Announce state change to screen readers
    ScreenReader.announce(
      newState ? 'Menú de navegación abierto' : 'Menú de navegación cerrado',
      'polite'
    )
  }

  // Handle keyboard navigation for mobile menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isMenuOpen) return

      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        menuButtonRef.current?.focus()
        ScreenReader.announce('Menú cerrado', 'polite')
      }
    }

    if (isMenuOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

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
              aria-label="Plataforma Colombiana - Ir a página principal"
            >
              <div 
                className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-white font-bold text-sm">PC</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Plataforma Colombiana
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav 
            className="hidden md:flex items-center gap-x-10"
            role="navigation"
            aria-label="Navegación principal"
          >
            <Link 
              href="/" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              Inicio
            </Link>
            <Link 
              href="/directorio" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              Directorio
            </Link>
            <Link 
              href="/foros" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              Foros
            </Link>
            <Link 
              href="/deportes" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              Deportes
            </Link>
            <Link 
              href="/clima" 
              className="text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md px-3 py-2"
            >
              Clima
            </Link>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Search button */}
            <button 
              className="p-2 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Abrir búsqueda"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Language toggle */}
            <LanguageToggle />

            {/* User menu */}
            <button 
              className="p-2 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Menú de usuario"
            >
              <User className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Mobile menu button */}
            <button
              ref={menuButtonRef}
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-foreground/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
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
                  ScreenReader.announce('Navegando a Inicio', 'polite')
                }}
              >
                Inicio
              </Link>
              <Link
                href="/directorio"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce('Navegando a Directorio', 'polite')
                }}
              >
                Directorio
              </Link>
              <Link
                href="/foros"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce('Navegando a Foros', 'polite')
                }}
              >
                Foros
              </Link>
              <Link
                href="/deportes"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce('Navegando a Deportes', 'polite')
                }}
              >
                Deportes
              </Link>
              <Link
                href="/clima"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-md min-h-[48px] flex items-center"
                onClick={() => {
                  setIsMenuOpen(false)
                  ScreenReader.announce('Navegando a Clima', 'polite')
                }}
              >
                Clima
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
