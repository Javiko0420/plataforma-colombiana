'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Globe, Users, Radio, Facebook, Instagram, Mail } from 'lucide-react'

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  )
}

const FOOT_COLS = [
  {
    head: 'Explorar',
    links: [
      { label: 'Negocios',  href: '/directorio' },
      { label: 'Empleos',   href: '/empleos' },
      { label: 'Eventos',   href: '/eventos' },
      { label: 'Foros',     href: '/foros' },
      { label: 'Radio',     href: '/emisoras' },
    ],
  },
  {
    head: 'Comunidad',
    links: [
      { label: 'Registrarse',       href: '/auth/signup' },
      { label: 'Publicar negocio',  href: '/registrar-negocio' },
      { label: 'Publicar empleo',   href: '/empleos' },
      { label: 'Ayuda',             href: '/soporte' },
    ],
  },
  {
    head: 'Latin Territory',
    links: [
      { label: 'Sobre nosotros', href: '/' },
      { label: 'Contacto',       href: '/soporte' },
      { label: 'Privacidad',     href: '/privacidad' },
      { label: 'Términos',       href: '/terminos' },
    ],
  },
]

const SOCIAL_LINKS = [
  { Icon: Facebook,  href: 'https://www.facebook.com/profile.php?id=61590612274534', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com/latinterritory/',              label: 'Instagram' },
  { Icon: Mail,      href: 'mailto:privacy@latinterritory.com',                      label: 'Email' },
]

const iconBtn: React.CSSProperties = {
  width: 38, height: 38, borderRadius: 10,
  border: '1px solid var(--lh-border)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--lh-fg2)', transition: '.18s', cursor: 'pointer',
  background: 'transparent', textDecoration: 'none',
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--lh-bg)',
        borderTop: '1px solid var(--lh-border2)',
        fontFamily: 'var(--lh-font)',
      }}
    >
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '56px 24px 40px' }}>

        {/* Grid principal */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 40 }}>

          {/* ── Columna marca ── */}
          <div style={{ gridColumn: 'span 1', minWidth: 200 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, textDecoration: 'none' }}>
              <Image
                src="/latin-territory-logo.png"
                alt="Latin Territory"
                width={42}
                height={42}
                style={{ display: 'block', width: 42, height: 42, objectFit: 'contain', borderRadius: 8 }}
              />
              <span style={{ fontWeight: 600, fontSize: 16.5, letterSpacing: '-.02em', color: 'var(--lh-fg)' }}>
                Latin Territory
              </span>
            </Link>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)', lineHeight: 1.55, margin: '0 0 18px', maxWidth: 280 }}>
              La comunidad latinoamericana en Australia y el mundo, conectada en un solo lugar.
            </p>
            {/* Social icons */}
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={iconBtn}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--lh-fg)'; el.style.background = 'var(--lh-surface2)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--lh-fg2)'; el.style.background = 'transparent' }}
                >
                  <Icon size={16} />
                </a>
              ))}
              <a
                href="https://www.tiktok.com/@latin.territory"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                style={iconBtn}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--lh-fg)'; el.style.background = 'var(--lh-surface2)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = 'var(--lh-fg2)'; el.style.background = 'transparent' }}
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* ── Columnas de links ── */}
          {FOOT_COLS.map(({ head, links }) => (
            <div key={head}>
              <div style={{
                fontSize: 12, fontFamily: 'var(--lh-mono)',
                letterSpacing: '.12em', textTransform: 'uppercase',
                color: 'var(--lh-fg3)', marginBottom: 15,
              }}>
                {head}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {links.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    style={{ fontSize: 14, color: 'var(--lh-fg2)', textDecoration: 'none', transition: '.18s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lh-fg)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lh-fg2)' }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Pie de página ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap', marginTop: 44, paddingTop: 24,
          borderTop: '1px solid var(--lh-border2)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--lh-fg3)' }}>
            © {year} Latin Territory. Hecho con cariño para la comunidad latina.
            {' · '}
            <a
              href="https://javiwarrior.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--lh-fg2)', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lh-fg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--lh-fg2)' }}
            >
              JaviWarrior Studio
            </a>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--lh-fg3)' }}>
            <Globe size={15} style={{ color: 'var(--lh-fg3)' }} />
            Español · English
          </div>
        </div>
      </div>
    </footer>
  )
}
