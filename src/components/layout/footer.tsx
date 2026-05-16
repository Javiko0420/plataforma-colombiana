"use client"

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { useTranslations } from '@/components/providers/language-provider'
import { SunMotif } from '@/components/lt/SunMotif'
import { Squiggle } from '@/components/lt/Squiggle'

const SOCIAL_LINKS = [
  { icon: Facebook,  href: '#', label: 'Facebook',  rotate: -2 },
  { icon: Instagram, href: '#', label: 'Instagram', rotate: 1.5 },
  { icon: Twitter,   href: '#', label: 'Twitter / X', rotate: -1 },
  { icon: Youtube,   href: '#', label: 'YouTube',   rotate: 2 },
  { icon: Mail,      href: 'mailto:privacy@latinterritory.com', label: 'Correo', rotate: -1.5 },
]

function FooterColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3
        className="text-lg font-bold italic mb-1"
        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-sun)' }}
      >
        {children}
      </h3>
      <Squiggle width={80} height={10} color="var(--lt-sun-core)" amplitude={3} />
    </div>
  )
}

export function Footer() {
  const { t } = useTranslations()
  const year = new Date().getFullYear()

  return (
    <footer
      className="relative"
      style={{ background: 'var(--lt-ink)', color: 'var(--lt-paper)' }}
      role="contentinfo"
    >
      {/* Patrón weave decorativo al 4% opacity */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.04 }}
      >
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" fill="url(#lt-weave)" color="var(--lt-paper)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* ── Columna 1: Marca ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <SunMotif size={44} className="shrink-0" />
              <div className="flex flex-col leading-tight">
                <span
                  className="text-lg font-bold"
                  style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-paper)' }}
                >
                  Latin <em style={{ color: 'var(--lt-sun)', fontStyle: 'italic' }}>Territory</em>
                </span>
              </div>
            </div>

            <p
              className="text-sm mb-5 leading-relaxed"
              style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
            >
              {t('footer.tagline')}
            </p>

            {/* Social icons en círculos sticker */}
            <div className="flex items-center gap-2 flex-wrap">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label, rotate }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-full border-[1.8px] transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-sun)] focus:ring-offset-2 focus:ring-offset-[var(--lt-ink)]"
                  style={{
                    borderColor: 'var(--lt-paper)',
                    color: 'var(--lt-paper)',
                    background: 'transparent',
                    transform: `rotate(${rotate}deg)`,
                    boxShadow: '2px 2px 0 rgba(255,243,216,0.25)',
                  }}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* Newsletter input */}
            <form
              className="mt-5"
              onSubmit={e => e.preventDefault()}
              aria-label="Suscribirse al newsletter"
            >
              <label
                htmlFor="footer-newsletter"
                className="block text-xs mb-1.5 font-medium"
                style={{ color: 'var(--lt-ink-soft)' }}
              >
                Novedades directo a tu correo
              </label>
              <div className="flex gap-2">
                <input
                  id="footer-newsletter"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  autoComplete="email"
                  className="flex-1 px-3 py-2 text-sm rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-paper)]/40 bg-white/10 placeholder:text-[var(--lt-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lt-sun)] focus:border-[var(--lt-sun)]"
                  style={{ color: 'var(--lt-paper)' }}
                />
                <button
                  type="submit"
                  className="px-3 py-2 text-sm font-semibold rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-sun)] transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-sun)] focus:ring-offset-2 focus:ring-offset-[var(--lt-ink)]"
                  style={{
                    background: 'var(--lt-sun)',
                    color: 'var(--lt-ink)',
                    boxShadow: '2px 2px 0 var(--lt-sun-core)',
                  }}
                >
                  ✓
                </button>
              </div>
            </form>
          </div>

          {/* ── Columna 2: Enlaces Rápidos ── */}
          <div>
            <FooterColumnTitle>{t('footer.quickLinks')}</FooterColumnTitle>
            <ul className="space-y-2">
              {[
                { href: '/directorio', label: t('footer.links.directory') },
                { href: '/empleos',    label: t('nav.jobs') },
                { href: '/eventos',    label: t('nav.events') },
                { href: '/foros',      label: t('footer.links.forums') },
                { href: '/deportes',   label: t('footer.links.sports') },
                { href: '/clima',      label: t('footer.links.weather') },
                { href: '/tasas',      label: t('nav.rates') },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-[var(--lt-sun)] focus:outline-none focus:underline"
                    style={{ color: 'var(--lt-ink-soft)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Columna 3: Categorías ── */}
          <div>
            <FooterColumnTitle>{t('footer.categories')}</FooterColumnTitle>
            <ul className="space-y-2">
              {[
                { href: '/directorio?categoria=Gastronomía', label: t('footer.category.gastronomy') },
                { href: '/directorio?categoria=Tecnología',  label: t('footer.category.technology') },
                { href: '/directorio?categoria=Artesanías',  label: t('footer.category.handicrafts') },
                { href: '/directorio',                       label: t('footer.category.fashion') },
                { href: '/directorio?categoria=Servicios',   label: 'Servicios Profesionales' },
                { href: '/directorio?categoria=Educación',   label: 'Educación' },
              ].map(({ href, label }) => (
                <li key={href + label}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-[var(--lt-sun)] focus:outline-none focus:underline"
                    style={{ color: 'var(--lt-ink-soft)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Columna 4: Contacto ── */}
          <div>
            <FooterColumnTitle>{t('footer.contact')}</FooterColumnTitle>
            <div className="space-y-3 mb-4">
              {[
                { icon: Mail,    label: 'Email',    value: 'privacy@latinterritory.com', href: 'mailto:privacy@latinterritory.com' },
                { icon: Phone,   label: 'Teléfono', value: '+61 0468771870',             href: 'tel:+610468771870' },
                { icon: MapPin,  label: 'Ubicación', value: 'Brisbane, Australia',       href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" style={{ color: 'var(--lt-sun)' }} />
                  {href
                    ? <a href={href} className="text-sm transition-colors hover:text-[var(--lt-sun)] focus:outline-none focus:underline" style={{ color: 'var(--lt-ink-soft)' }}>{value}</a>
                    : <span className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>{value}</span>
                  }
                </div>
              ))}
            </div>

            <Link
              href="/soporte"
              className="inline-flex items-center gap-1 text-sm transition-colors hover:text-[var(--lt-sun)] focus:outline-none focus:underline"
              style={{ color: 'var(--lt-ink-soft)' }}
            >
              Soporte y Reclamos →
            </Link>

            {/* Sticker "Hecho con ❤️ en Brisbane" */}
            <div
              className="mt-6 inline-block px-3 py-2 text-xs font-semibold rounded-[var(--lt-radius-sm)] border-[1.6px]"
              style={{
                background: 'var(--lt-terracota)',
                color: 'var(--lt-paper)',
                borderColor: 'var(--lt-paper)',
                boxShadow: '3px 3px 0 rgba(255,243,216,0.3)',
                transform: 'rotate(-2deg)',
              }}
              data-lt-rotate="true"
              aria-label="Hecho con amor en Brisbane"
            >
              Hecho con ❤️ en Brisbane
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="flex justify-center mb-6" aria-hidden="true">
          <Squiggle width={200} height={12} color="var(--lt-ink-soft)" amplitude={4} />
        </div>

        {/* ── Pie de página ── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
              © {year} {t('app.name')}. {t('footer.rights')}
            </p>
            <span className="hidden sm:inline" style={{ color: 'var(--lt-ink-soft)', opacity: 0.4 }}>|</span>
            <div className="flex gap-4">
              {[
                { href: '/privacidad',      label: t('footer.privacy') },
                { href: '/terminos',        label: t('footer.terms') },
                { href: '/normas-comunidad', label: 'Normas' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm transition-colors hover:text-[var(--lt-sun)] focus:outline-none focus:underline"
                  style={{ color: 'var(--lt-ink-soft)' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs font-medium" style={{ color: 'var(--lt-ink-soft)' }}>
              Operado por{' '}
              <a
                href="https://javiwarrior.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold transition-colors hover:text-[var(--lt-sun)] focus:outline-none focus:underline"
                style={{ color: 'var(--lt-paper)' }}
              >
                JaviWarrior Studio
              </a>
            </p>
            <p className="text-[10px] tracking-wider mt-0.5" style={{ color: 'var(--lt-ink-soft)', opacity: 0.6 }}>
              ABN: 34 656 367 780
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
