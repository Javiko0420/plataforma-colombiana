"use client"

import Link from 'next/link'
import {
  ArrowRight, Star, Users, TrendingUp, MapPin,
  Radio, Cloud, Trophy, Briefcase, CalendarDays, Search,
} from 'lucide-react'
import { useTranslations } from '@/components/providers/language-provider'
import { SunMotif }          from '@/components/lt/SunMotif'
import { LeafSprig }         from '@/components/lt/LeafSprig'
import { SouthernCross }     from '@/components/lt/SouthernCross'
import { Squiggle }          from '@/components/lt/Squiggle'
import { HandDrawnUnderline} from '@/components/lt/HandDrawnUnderline'
import { HandDrawnBox }      from '@/components/lt/HandDrawnBox'
import { LtButton }          from '@/components/lt/Button'
import { LtBadge }           from '@/components/lt/Badge'
import { LtCard, LtCardHeader, LtCardBody } from '@/components/lt/Card'

/* ─────────────────────────────────────────
   Datos estáticos — no cambia lógica
───────────────────────────────────────── */
const STATS = [
  { value: '1,200+', labelKey: 'home.stats.entrepreneurs', ariaKey: 'Mil doscientos emprendedores', icon: Users,     tone: 'terracota' as const },
  { value: '5,000+', labelKey: 'home.stats.products',      ariaKey: 'Cinco mil productos',          icon: Star,      tone: 'sun'      as const },
  { value: '32',     labelKey: 'home.stats.departments',   ariaKey: 'Treinta y dos ciudades',        icon: MapPin,    tone: 'verde'    as const },
  { value: '98%',    labelKey: 'home.stats.satisfaction',  ariaKey: 'Noventa y ocho por ciento',     icon: TrendingUp,tone: 'accent'   as const },
]

const FEATURES = [
  { href: '/directorio', icon: Users,      titleKey: 'home.features.directory.title', descKey: 'home.features.directory.desc', linkKey: 'home.features.directory.link', iconTone: 'terracota' as const },
  { href: '/emisoras',   icon: Radio,      titleKey: 'home.features.radios.title',    descKey: 'home.features.radios.desc',    linkKey: 'home.features.radios.link',    iconTone: 'sun'       as const },
  { href: '/clima',      icon: Cloud,      titleKey: 'home.features.weather.title',   descKey: 'home.features.weather.desc',   linkKey: 'home.features.weather.link',   iconTone: 'verde'     as const },
  { href: '/deportes',   icon: Trophy,     titleKey: 'home.features.sports.title',    descKey: 'home.features.sports.desc',    linkKey: 'home.features.sports.link',    iconTone: 'sun'       as const },
  { href: '/foros',      icon: Users,      titleKey: 'home.features.forums.title',    descKey: 'home.features.forums.desc',    linkKey: 'home.features.forums.link',    iconTone: 'accent'    as const },
  { href: '/tasas',      icon: TrendingUp, titleKey: 'home.features.rates.title',     descKey: 'home.features.rates.desc',     linkKey: 'home.features.rates.link',     iconTone: 'terracota' as const },
]

const CTA_LINKS = [
  { href: '/directorio', labelKey: 'home.cta.directory', tone: 'terracota' as const, rotate: -2,   icon: ArrowRight },
  { href: '/empleos',    labelKey: 'home.cta.jobs',      tone: 'verde'     as const, rotate:  1.5, icon: Briefcase  },
  { href: '/eventos',    labelKey: 'home.cta.events',    tone: 'sun'       as const, rotate: -1,   icon: CalendarDays },
  { href: '/foros',      labelKey: 'home.cta.forums',    tone: 'accent'    as const, rotate:  2,   icon: Users      },
]

/* ─────────────────────────────────────────
   Componente principal
───────────────────────────────────────── */
export default function Home() {
  const { t } = useTranslations()

  return (
    <div style={{ background: 'var(--lt-bg)' }}>
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-[var(--lt-radius-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
        style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)' }}
      >
        {t('home.skip')}
      </a>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        aria-labelledby="hero-title"
      >
        {/* Decoraciones de fondo */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          {/* Sol grande central */}
          <SunMotif
            size={420}
            className="absolute opacity-[0.08]"
            style={{ top: '-80px', right: '-60px' }}
          />
          {/* Hoja inferior izquierda */}
          <LeafSprig
            size={140}
            className="absolute opacity-20"
            style={{ bottom: '20px', left: '20px', transform: 'rotate(-15deg)' }}
          />
          {/* Cruz del Sur */}
          <SouthernCross
            size={56}
            color="var(--lt-sun)"
            className="absolute opacity-40"
            style={{ top: '24px', left: '48px' }}
          />
          {/* Squiggles decorativos */}
          <Squiggle
            width={200} height={14}
            color="var(--lt-sun)"
            amplitude={5}
            className="absolute opacity-25"
            style={{ bottom: '40px', right: '10%' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          {/* Badges flotantes */}
          <div className="flex flex-wrap justify-center gap-3 mb-8" aria-hidden="true">
            <LtBadge tone="terracota" rotate={-1.5}>¡Hecho aquí! 🇨🇴</LtBadge>
            <LtBadge tone="sun" rotate={1}>Comunidad ✦ Latina</LtBadge>
            <LtBadge tone="verde" rotate={-0.8}>Brisbane, Australia 🌏</LtBadge>
          </div>

          {/* Título Hero */}
          <div className="text-center mb-4">
            <h1
              id="hero-title"
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-2"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              Bienvenidos a{' '}
              <em style={{ color: 'var(--lt-terracota)', fontStyle: 'italic' }}>
                tu territorio.
              </em>
            </h1>
            <div className="flex justify-center mb-6" aria-hidden="true">
              <HandDrawnUnderline width={320} color="var(--lt-sun-core)" thickness={3} />
            </div>
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
            >
              {t('home.hero.tagline')}
            </p>
          </div>

          {/* 4 CTAs sticker */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-12">
            {CTA_LINKS.map(({ href, labelKey, tone, rotate, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-label={t(labelKey)}
                tabIndex={0}
              >
                <LtButton
                  variant="sticker"
                  tone={tone}
                  size="md"
                  rotate={rotate}
                  iconLeft={<Icon className="h-4 w-4" aria-hidden="true" />}
                >
                  {t(labelKey)}
                </LtButton>
              </Link>
            ))}
          </div>

          {/* Search bar en HandDrawnBox */}
          <div className="max-w-xl mx-auto">
            <HandDrawnBox
              padding="0.5rem"
              className="flex items-center gap-2"
              role="search"
              aria-label="Buscar en Latin Territory"
            >
              <label htmlFor="hero-search" className="sr-only">Buscar negocios, eventos o empleos</label>
              <Search
                className="h-5 w-5 ml-1 shrink-0"
                aria-hidden="true"
                style={{ color: 'var(--lt-ink-soft)' }}
              />
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Buscar negocios, eventos o empleos…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--lt-ink-soft)]"
                style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
              />
              <LtButton variant="pill" tone="terracota" size="sm">
                Buscar
              </LtButton>
            </HandDrawnBox>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <main id="main-content">

        {/* ── Stats ── */}
        <section
          className="py-16 border-y-[2px] border-[var(--lt-ink)]"
          style={{ background: 'var(--lt-paper)' }}
          aria-labelledby="stats-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="stats-title" className="sr-only">{t('home.stats.title')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STATS.map(({ value, labelKey, ariaKey, icon: Icon, tone }, i) => {
                const rotations = [-1.5, 1.2, -1, 1.8]
                const rot = rotations[i]
                return (
                  <div
                    key={labelKey}
                    className="flex flex-col items-center gap-3"
                    aria-label={`${ariaKey} ${t(labelKey)}`}
                  >
                    {/* Icono sticker */}
                    <div
                      aria-hidden="true"
                      className="w-16 h-16 rounded-[var(--lt-radius-sm)] flex items-center justify-center border-[2px] border-[var(--lt-ink)]"
                      style={{
                        background: `var(--lt-${tone})`,
                        boxShadow: 'var(--lt-shadow-sticker)',
                        transform: `rotate(${rot}deg)`,
                        color: tone === 'sun' ? 'var(--lt-ink)' : 'var(--lt-paper)',
                      }}
                      data-lt-rotate="true"
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    {/* Número */}
                    <span
                      className="text-4xl font-black"
                      style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                    >
                      {value}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
                    >
                      {t(labelKey)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-20" aria-labelledby="features-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Encabezado de sección */}
            <div className="text-center mb-14">
              <h2
                id="features-title"
                className="text-3xl md:text-4xl font-bold mb-3"
                style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
              >
                {t('home.features.title')}
              </h2>
              <div className="flex justify-center mb-4" aria-hidden="true">
                <Squiggle width={160} height={12} color="var(--lt-terracota)" amplitude={4} />
              </div>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
              >
                {t('home.features.subtitle')}
              </p>
            </div>

            {/* Grid de features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map(({ href, icon: Icon, titleKey, descKey, linkKey, iconTone }, i) => (
                <LtCard key={href} index={i} shadow="md" className="flex flex-col">
                  <LtCardHeader
                    icon={<Icon className="h-5 w-5" aria-hidden="true" />}
                    iconTone={iconTone}
                  >
                    <h3
                      className="text-lg font-bold"
                      style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                    >
                      {t(titleKey)}
                    </h3>
                  </LtCardHeader>
                  <LtCardBody className="flex flex-col flex-1 gap-4">
                    <p
                      className="text-sm leading-relaxed flex-1"
                      style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
                    >
                      {t(descKey)}
                    </p>
                    <Link
                      href={href}
                      className="inline-flex items-center gap-1 text-sm font-semibold transition-colors hover:gap-2 focus:outline-none focus:underline"
                      style={{ color: 'var(--lt-terracota)' }}
                    >
                      {t(linkKey)}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </LtCardBody>
                </LtCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA emprendedor ── */}
        <section
          className="py-20 relative overflow-hidden"
          aria-labelledby="cta-title"
        >
          {/* Fondo terracota con sombra sticker XL */}
          <div
            className="max-w-4xl mx-auto mx-4 sm:mx-6 lg:mx-auto px-8 py-14 rounded-[var(--lt-radius-lg)] border-[2.5px] border-[var(--lt-ink)] text-center relative"
            style={{
              background: 'var(--lt-terracota)',
              boxShadow: 'var(--lt-shadow-sticker-xl)',
              transform: 'rotate(-0.4deg)',
            }}
            data-lt-rotate="true"
          >
            {/* Decoraciones internas */}
            <div aria-hidden="true" className="absolute top-4 right-6 opacity-20">
              <SunMotif size={80} color="var(--lt-paper)" coreColor="var(--lt-sun)" />
            </div>
            <div aria-hidden="true" className="absolute bottom-4 left-6 opacity-15">
              <LeafSprig size={60} color="var(--lt-paper)" />
            </div>

            <h2
              id="cta-title"
              className="text-3xl md:text-4xl font-black mb-4 relative"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-paper)' }}
            >
              {t('home.cta.hero.title')}
            </h2>
            <p
              className="text-lg mb-8 max-w-xl mx-auto relative"
              style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-paper)', opacity: 0.9 }}
            >
              {t('home.cta.hero.desc')}
            </p>
            <div className="flex justify-center relative">
              <Link href="/registrar-negocio">
                <LtButton variant="sticker" tone="paper" size="lg" rotate={-1.2}>
                  {t('home.cta.hero.link')}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </LtButton>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
