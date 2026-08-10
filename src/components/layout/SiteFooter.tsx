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
      { label: 'Negocios', href: '/directorio' },
      { label: 'Empleos',  href: '/empleos' },
      { label: 'Eventos',  href: '/eventos' },
      { label: 'Foros',    href: '/foros' },
      { label: 'Radio',    href: '/emisoras' },
    ],
  },
  {
    head: 'Comunidad',
    links: [
      { label: 'Registrarse',      href: '/auth/signup' },
      { label: 'Publicar negocio', href: '/registrar-negocio' },
      { label: 'Publicar empleo',  href: '/empleos/publicar' },
      { label: 'Ayuda',            href: '/soporte' },
    ],
  },
  {
    head: 'Latin Territory',
    links: [
      { label: 'Sobre nosotros', href: '/sobre-nosotros' },
      { label: 'Contacto',       href: '/soporte' },
      { label: 'Privacidad',     href: '/privacidad' },
      { label: 'Términos',       href: '/terminos' },
    ],
  },
]

const SOCIAL = [
  { Icon: Facebook,  href: 'https://www.facebook.com/profile.php?id=61590612274534', label: 'Facebook' },
  { Icon: Instagram, href: 'https://www.instagram.com/latinterritory/', label: 'Instagram' },
  { Icon: Mail,      href: 'mailto:privacy@latinterritory.com', label: 'Email' },
]

const INFO_BTNS = [
  { Icon: Globe,  label: 'Comunidad global' },
  { Icon: Users,  label: 'Miembros' },
  { Icon: Radio,  label: 'Emisoras' },
]

const iconBtn: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 10,
  border: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--fg2)',
  transition: '.18s',
  cursor: 'pointer',
  background: 'transparent',
  textDecoration: 'none',
}

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      className="lt-site-footer"
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border2)',
        fontFamily: 'var(--font)',
      }}
    >
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '56px 24px 40px' }}>

        {/* Grid principal — 1.6fr 1fr 1fr 1fr → 1fr en móvil */}
        <div className="lt-foot-grid">

          {/* Columna marca */}
          <div>
            <Link
              href="/"
              style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16, textDecoration: 'none' }}
            >
              <Image
                src="/lt-logo.png"
                alt="Latin Territory"
                width={42}
                height={42}
                style={{ width: 42, height: 42, objectFit: 'contain', display: 'block' }}
              />
              <span style={{ fontWeight: 600, fontSize: 16.5, letterSpacing: '-.02em', color: 'var(--fg)' }}>
                Latin{' '}
                <span style={{ color: 'var(--fg3)' }}>Territory</span>
              </span>
            </Link>

            <p style={{ fontSize: 14, color: 'var(--fg2)', lineHeight: 1.55, margin: '0 0 18px', maxWidth: 280 }}>
              La comunidad latinoamericana en Australia y el mundo, conectada en un solo lugar.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              {SOCIAL.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  style={iconBtn}
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
                  <Icon size={16} />
                </a>
              ))}
              <a
                href="https://www.tiktok.com/@latin.territory"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                style={iconBtn}
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
                <TikTokIcon />
              </a>
            </div>

            {/* Globe / Users / Radio */}
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginTop: 12 }}>
              {INFO_BTNS.map(({ Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  style={{ ...iconBtn, border: '1px solid var(--border2)' } as React.CSSProperties}
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
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Columnas de links */}
          {FOOT_COLS.map(({ head, links }) => (
            <div key={head}>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--mono)',
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'var(--fg3)',
                marginBottom: 15,
              }}>
                {head}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {links.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    style={{ fontSize: 14, color: 'var(--fg2)', textDecoration: 'none', transition: '.18s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg2)' }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Barra inferior */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginTop: 44,
          paddingTop: 24,
          borderTop: '1px solid var(--border2)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--fg3)' }}>
            © {year} Latin Territory. Hecho con cariño para la comunidad latina.
            {' · '}
            <a
              href="https://javiwarrior.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--fg2)', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fg2)' }}
            >
              JaviWarrior Studio
            </a>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--fg3)' }}>
            <Globe size={15} />
            Español · English
          </div>
        </div>
      </div>
    </footer>
  )
}
