'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'

const NAV_LINKS = [
  { label: 'Negocios', href: '/directorio' },
  { label: 'Empleos',  href: '/empleos' },
  { label: 'Eventos',  href: '/eventos' },
  { label: 'Emisoras', href: '/emisoras' },
  { label: 'Foros',    href: '/foros' },
]

function useHideOnScroll(threshold = 80, delta = 6) {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const onScroll = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (!reduce && Math.abs(y - lastY.current) > delta) {
          setHidden(y > lastY.current && y > threshold)
          lastY.current = y
        }
        ticking.current = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold, delta])

  return hidden
}

export function SiteHeader() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const hidden = useHideOnScroll()

  useEffect(() => { setMounted(true) }, [])

  const toggleTheme = useCallback(() => {
    const html = document.documentElement
    html.classList.add('lt-notrans')
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove('lt-notrans')))
  }, [resolvedTheme, setTheme])

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 10)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Spacer — mantiene el flujo del documento con position:fixed */}
      <div style={{ height: 66, flexShrink: 0 }} aria-hidden="true" />

      <header
        className="lt-site-nav"
        data-hidden={String(hidden && !menuOpen)}
        data-scrolled={String(scrolled)}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'var(--glass)',
          backdropFilter: 'blur(22px) saturate(1.5)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.5)',
          borderBottom: '1px solid var(--glassbrd)',
          fontFamily: 'var(--font)',
        }}
      >
      <div style={{
        maxWidth: 1220,
        margin: '0 auto',
        padding: '0 24px',
        height: 66,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
      }}>

        {/* Logo + wordmark */}
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}
        >
          <Image
            src="/lt-logo.png"
            alt="Latin Territory"
            width={44}
            height={44}
            style={{ width: 44, height: 44, objectFit: 'contain', display: 'block' }}
          />
          <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-.02em', color: 'var(--fg)' }}>
            Latin{' '}
            <span style={{ color: 'var(--fg3)' }}>Territory</span>
          </span>
        </Link>

        {/* Nav links — ocultos ≤880px */}
        <nav
          className="lt-desk-links"
          style={{ gap: 4, marginLeft: 8 }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--fg2)',
                textDecoration: 'none',
                transition: '.18s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'var(--fg)'
                el.style.background = 'rgba(24,27,33,.06)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'var(--fg2)'
                el.style.background = 'transparent'
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Acciones — derecha */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--fg2)',
              cursor: 'pointer',
              transition: '.18s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'var(--fg)'
              el.style.background = 'var(--surface2)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.color = 'var(--fg2)'
              el.style.background = 'transparent'
            }}
          >
            {mounted ? (resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />) : <Moon size={16} />}
          </button>

          {/* CTA — oculto ≤880px */}
          <Link
            href="/registrar-negocio"
            className="lt-desk-cta"
            style={{
              alignItems: 'center',
              padding: '8px 18px',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: 'none',
              transition: '.18s',
              letterSpacing: '-.01em',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-ink)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)' }}
          >
            Registrar negocio
          </Link>

          {/* Hamburger — visible ≤880px */}
          <button
            className="lt-mob-btn"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--fg2)',
              cursor: 'pointer',
            }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="lt-site-nav"
          style={{
            borderTop: '1px solid var(--border2)',
            padding: '12px 24px 20px',
            background: 'var(--bg)',
          }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                padding: '11px 4px',
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--fg2)',
                textDecoration: 'none',
                borderBottom: '1px solid var(--border2)',
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/registrar-negocio"
            onClick={() => setMenuOpen(false)}
            style={{
              display: 'block',
              marginTop: 16,
              padding: '11px 18px',
              borderRadius: 10,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            Registrar negocio
          </Link>
        </div>
      )}
      </header>
    </>
  )
}
