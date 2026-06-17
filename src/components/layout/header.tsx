'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu, X, User, LogOut, UserCircle, Settings,
  Building2, PlusCircle, Shield, Sun, Moon, Globe,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { ScreenReader } from '@/lib/accessibility'
import { useTranslations } from '@/components/providers/language-provider'
import { cn } from '@/lib/utils'

const ALLOWED_ADMIN_DOMAINS = ['@latinterritory.com', '@javiwarrior.com']

const NAV_LINKS = [
  { href: '#categorias', label: 'Explorar',   page: '/'         },
  { href: '/directorio', label: 'Negocios',   page: '/directorio' },
  { href: '/empleos',    label: 'Empleos',    page: '/empleos'  },
  { href: '/eventos',    label: 'Eventos',    page: '/eventos'  },
  { href: '/foros',      label: 'Comunidad',  page: '/foros'    },
]

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [threshold])
  return scrolled
}

export function Header() {
  const { t } = useTranslations()
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const scrolled = useScrolled()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuBtnRef = useRef<HTMLButtonElement>(null)

  const userEmail = session?.user?.email || ''
  const hasAdminRole = session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR'
  const hasCorporateEmail = ALLOWED_ADMIN_DOMAINS.some(d => userEmail.endsWith(d))
  const showAdmin = hasAdminRole && hasCorporateEmail

  const isHome = pathname === '/'

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        userMenuRef.current && !userMenuRef.current.contains(e.target as Node) &&
        userMenuBtnRef.current && !userMenuBtnRef.current.contains(e.target as Node)
      ) setUserMenuOpen(false)
    }
    if (userMenuOpen) document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [userMenuOpen])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
        menuBtnRef.current?.focus()
        ScreenReader.announce(t('sr.menu.closed.short'), 'polite')
      }
    }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [menuOpen, t])

  const navHref = (link: typeof NAV_LINKS[0]) =>
    link.href.startsWith('#') && !isHome ? '/' + link.href : link.href

  const isActive = (page: string) => {
    if (page === '/') return pathname === '/'
    return pathname.startsWith(page)
  }

  const btnBase: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 40, height: 40, borderRadius: 11,
    border: '1px solid var(--lh-border)',
    background: 'var(--lh-surface)',
    color: 'var(--lh-fg)', cursor: 'pointer',
    transition: '.2s', fontFamily: 'var(--lh-font)',
  }

  return (
    <header
      role="banner"
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'var(--lh-glass)' : 'var(--lh-glass)',
        backdropFilter: 'blur(22px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.5)',
        borderBottom: '1px solid var(--lh-border2)',
        transition: 'box-shadow .2s',
        boxShadow: scrolled ? 'var(--lh-shadow)' : 'none',
      }}
    >
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 24px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

        {/* ── Logo ── */}
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}
          aria-label="Latin Territory — Inicio"
        >
          <Image
            src="/latin-territory-logo.png"
            alt="Latin Territory"
            width={40}
            height={40}
            style={{ display: 'block', width: 40, height: 40, objectFit: 'contain', borderRadius: 8 }}
          />
          <span style={{ fontWeight: 600, fontSize: 16.5, letterSpacing: '-.02em', color: 'var(--lh-fg)', fontFamily: 'var(--lh-font)' }}>
            Latin<span style={{ color: 'var(--lh-fg3)', fontWeight: 500 }}> Territory</span>
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav
          className="hidden md:flex"
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          role="navigation"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              href={navHref(link)}
              style={{
                padding: '9px 14px', borderRadius: 10,
                fontSize: 14.5, fontWeight: 500,
                color: isActive(link.page) ? 'var(--lh-fg)' : 'var(--lh-fg2)',
                background: isActive(link.page) ? 'var(--lh-surface2)' : 'transparent',
                transition: '.2s', fontFamily: 'var(--lh-font)', textDecoration: 'none',
              }}
              aria-current={isActive(link.page) ? 'page' : undefined}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                if (!isActive(link.page)) { el.style.color = 'var(--lh-fg)'; el.style.background = 'var(--lh-surface2)' }
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                if (!isActive(link.page)) { el.style.color = 'var(--lh-fg2)'; el.style.background = 'transparent' }
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Controles derecha ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            style={btnBase}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--lh-surface2)'; el.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--lh-surface)'; el.style.transform = '' }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User / Auth */}
          {status === 'loading' ? (
            <div style={{ ...btnBase, cursor: 'default' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--lh-border)', borderTopColor: 'var(--lh-accent)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : session ? (
            <div style={{ position: 'relative' }}>
              <button
                ref={userMenuBtnRef}
                onClick={() => setUserMenuOpen(p => !p)}
                style={btnBase}
                aria-label="Menú de usuario"
                aria-expanded={userMenuOpen}
              >
                <User size={17} />
              </button>
              {userMenuOpen && (
                <div
                  ref={userMenuRef}
                  role="menu"
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 220, borderRadius: 16,
                    background: 'var(--lh-surface)',
                    border: '1px solid var(--lh-border)',
                    boxShadow: 'var(--lh-shadow-lg)',
                    padding: '6px',
                    zIndex: 60,
                    fontFamily: 'var(--lh-font)',
                  }}
                >
                  <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--lh-border2)', marginBottom: 4 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>{session.user?.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--lh-fg2)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user?.email}</p>
                  </div>
                  {showAdmin && (
                    <Link href="/admin" onClick={() => setUserMenuOpen(false)} role="menuitem"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 14, fontWeight: 600, color: 'var(--lh-accent)', textDecoration: 'none', transition: '.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--lh-surface2)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                    >
                      <Shield size={15} /> Panel de Control
                    </Link>
                  )}
                  {[
                    { href: '/perfil',                  Icon: UserCircle, label: t('auth.profile') },
                    { href: '/perfil/configuracion',    Icon: Settings,   label: t('profile.settings.title') },
                    { href: '/registrar-negocio',       Icon: PlusCircle, label: 'Registrar negocio' },
                  ].map(({ href, Icon, label }) => (
                    <Link key={href} href={href} onClick={() => setUserMenuOpen(false)} role="menuitem"
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 14, color: 'var(--lh-fg)', textDecoration: 'none', transition: '.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--lh-surface2)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                    >
                      <Icon size={15} style={{ color: 'var(--lh-fg2)' }} /> {label}
                    </Link>
                  ))}
                  <div style={{ height: 1, background: 'var(--lh-border2)', margin: '4px 4px' }} />
                  <button
                    onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                    role="menuitem"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 10, fontSize: 14, color: 'var(--lh-terra)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--lh-font)', transition: '.15s', textAlign: 'left' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--lh-surface2)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                  >
                    <LogOut size={15} /> {t('auth.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Registrar negocio CTA — solo desktop */}
          <Link
            href="/registrar-negocio"
            className="hidden md:inline-flex"
            style={{
              display: 'inline-flex', alignItems: 'center', padding: '10px 18px',
              borderRadius: 11, background: 'var(--lh-accent)', color: '#fff',
              fontSize: 14.5, fontWeight: 600, letterSpacing: '-.01em',
              boxShadow: '0 8px 20px -10px var(--lh-accent)', transition: '.22s',
              textDecoration: 'none', fontFamily: 'var(--lh-font)',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 12px 26px -10px var(--lh-accent)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '0 8px 20px -10px var(--lh-accent)' }}
          >
            Registrar negocio
          </Link>

          {/* Mobile menu button */}
          <button
            ref={menuBtnRef}
            className="md:hidden"
            onClick={() => {
              const next = !menuOpen
              setMenuOpen(next)
              ScreenReader.announce(next ? t('sr.menu.open') : t('sr.menu.closed'), 'polite')
            }}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('sr.menu.closed') : t('sr.menu.open')}
            style={btnBase}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Menú móvil"
          style={{
            borderTop: '1px solid var(--lh-border2)',
            background: 'var(--lh-glass)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
          }}
        >
          <div style={{ maxWidth: 1220, margin: '0 auto', padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'var(--lh-font)' }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={navHref(link)}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '13px 16px',
                  borderRadius: 12, fontSize: 15, fontWeight: 500,
                  color: isActive(link.page) ? '#fff' : 'var(--lh-fg)',
                  background: isActive(link.page) ? 'var(--lh-accent)' : 'transparent',
                  textDecoration: 'none', minHeight: 48, transition: '.15s',
                }}
                aria-current={isActive(link.page) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}

            <div style={{ height: 1, background: 'var(--lh-border2)', margin: '8px 0' }} />

            {!session ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link href="/auth/signin" onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, fontSize: 15, color: 'var(--lh-fg)', textDecoration: 'none', minHeight: 48 }}>
                  <User size={18} style={{ color: 'var(--lh-fg2)' }} /> {t('auth.login.title')}
                </Link>
                <Link href="/auth/signup" onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, fontSize: 15, fontWeight: 600, background: 'var(--lh-accent)', color: '#fff', textDecoration: 'none', minHeight: 48 }}>
                  <PlusCircle size={18} /> {t('auth.signup.title')}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ padding: '8px 16px', fontSize: 13, color: 'var(--lh-fg2)' }}>{session.user?.name}</div>
                {showAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: 'var(--lh-accent)', textDecoration: 'none', minHeight: 48 }}>
                    <Shield size={18} /> Panel de Control
                  </Link>
                )}
                <Link href="/perfil" onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, fontSize: 15, color: 'var(--lh-fg)', textDecoration: 'none', minHeight: 48 }}>
                  <UserCircle size={18} style={{ color: 'var(--lh-fg2)' }} /> {t('auth.profile')}
                </Link>
                <Link href="/registrar-negocio" onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, fontSize: 15, color: 'var(--lh-fg)', textDecoration: 'none', minHeight: 48 }}>
                  <Building2 size={18} style={{ color: 'var(--lh-fg2)' }} /> Registrar Negocio
                </Link>
                <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, fontSize: 15, color: 'var(--lh-terra)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--lh-font)', minHeight: 48, textAlign: 'left' }}>
                  <LogOut size={18} /> {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
