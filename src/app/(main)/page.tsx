"use client"

import Link from 'next/link'
import {
  ArrowRight, Users, TrendingUp, MapPin,
  Radio, Cloud, Trophy, Briefcase, CalendarDays, Search,
} from 'lucide-react'
import { useTranslations } from '@/components/providers/language-provider'
import { SunMotif }           from '@/components/lt/SunMotif'
import { LeafSprig }          from '@/components/lt/LeafSprig'
import { SouthernCross }      from '@/components/lt/SouthernCross'
import { Squiggle }           from '@/components/lt/Squiggle'
import { HandDrawnBox }       from '@/components/lt/HandDrawnBox'
import { LtButton }           from '@/components/lt/Button'
import { LtCard, LtCardBody } from '@/components/lt/Card'
import { StickerBadge }       from '@/components/lt/StickerBadge'

/* ─────────────────────────────────────────
   Datos estáticos
───────────────────────────────────────── */
const STATS = [
  { n: '1,200+', label: 'emprendedores',      tone: 'terracota', italic: false },
  { n: '5,000+', label: 'productos & servicios', tone: 'sun-core',  italic: true  },
  { n: '32',     label: 'ciudades AU',         tone: 'verde',     italic: false },
  { n: '98%',    label: 'comunidad feliz',     tone: 'accent',    italic: true  },
]

const FEATURE_TONES = ['terracota', 'verde', 'sun', 'accent', 'sun-core', 'verde']
const FEATURE_ROTATIONS = [-1, 1.5, -0.5, 1, -1.5, 0.5]

const FEATURES = [
  { href: '/directorio', icon: Users,      titleKey: 'home.features.directory.title', descKey: 'home.features.directory.desc' },
  { href: '/emisoras',   icon: Radio,      titleKey: 'home.features.radios.title',    descKey: 'home.features.radios.desc'    },
  { href: '/clima',      icon: Cloud,      titleKey: 'home.features.weather.title',   descKey: 'home.features.weather.desc'   },
  { href: '/deportes',   icon: Trophy,     titleKey: 'home.features.sports.title',    descKey: 'home.features.sports.desc'    },
  { href: '/foros',      icon: Users,      titleKey: 'home.features.forums.title',    descKey: 'home.features.forums.desc'    },
  { href: '/tasas',      icon: TrendingUp, titleKey: 'home.features.rates.title',     descKey: 'home.features.rates.desc'     },
]

const CTA_LINKS = [
  { href: '/directorio', labelKey: 'home.cta.directory', tone: 'terracota' as const, rotate: -2,   icon: ArrowRight   },
  { href: '/empleos',    labelKey: 'home.cta.jobs',      tone: 'verde'     as const, rotate:  1.5, icon: Briefcase    },
  { href: '/eventos',    labelKey: 'home.cta.events',    tone: 'sun'       as const, rotate: -1,   icon: CalendarDays },
  { href: '/foros',      labelKey: 'home.cta.forums',    tone: 'accent'    as const, rotate:  2,   icon: Users        },
]

// TODO: replace with real data from server action when available
const MOCK_EVENTS = [
  {
    id: '1',
    day: '14',
    month: 'JUN',
    title: 'Festival de Gastronomía Latina',
    location: 'South Bank, Brisbane',
    tone: 'terracota',
    attendees: 42,
  },
  {
    id: '2',
    day: '21',
    month: 'JUN',
    title: 'Networking Emprendedores AU',
    location: 'CBD, Sydney',
    tone: 'verde',
    attendees: 28,
  },
  {
    id: '3',
    day: '28',
    month: 'JUN',
    title: 'Noche de Cumbia & Salsa',
    location: 'Fortitude Valley, Brisbane',
    tone: 'accent',
    attendees: 87,
  },
]

const EVENT_CARD_ROTATIONS = [-0.6, 0.8, -0.6]

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
        className="relative overflow-hidden pt-12 pb-20 px-6 md:pt-16 md:pb-28"
        aria-labelledby="hero-title"
      >
        {/* ── Sol gigante centrado detrás ── */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none select-none"
          style={{ top: '-120px', opacity: 0.85, zIndex: 0 }}
          data-lt-wobble="true"
        >
          <SunMotif size={640} />
        </div>

        {/* ── LeafSprigs laterales ── */}
        <LeafSprig
          size={140}
          aria-hidden="true"
          className="absolute pointer-events-none select-none hidden md:block"
          style={{ left: '36px', top: '80px', opacity: 0.85, transform: 'rotate(-25deg)' }}
          data-lt-rotate="true"
        />
        <LeafSprig
          size={120}
          aria-hidden="true"
          className="absolute pointer-events-none select-none hidden md:block"
          style={{ right: '56px', top: '144px', opacity: 0.8, transform: 'rotate(40deg) scaleX(-1)' }}
          data-lt-rotate="true"
        />

        {/* ── SouthernCross decorativo ── */}
        <SouthernCross
          size={48}
          color="var(--lt-sun)"
          aria-hidden="true"
          className="absolute top-6 left-12 opacity-40 pointer-events-none select-none hidden md:block"
        />

        {/* ── Contenido, empujado bajo el sol ── */}
        <div className="relative max-w-4xl mx-auto text-center pt-28 md:pt-36" style={{ zIndex: 1 }}>

          {/* Badge centrada oscura */}
          <div
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full text-[13px] uppercase tracking-[0.14em] font-semibold mb-8 border-2 border-[var(--lt-ink)]"
            style={{
              background: 'var(--lt-ink)',
              color: 'var(--lt-paper)',
              transform: 'rotate(-1deg)',
              filter: 'url(#lt-wobble-soft)',
              fontFamily: 'var(--lt-font-sans)',
            }}
            data-lt-rotate="true"
            data-lt-wobble="true"
            aria-hidden="true"
          >
            <SouthernCross size={16} color="var(--lt-sun)" />
            <span>Latinos en Australia</span>
            <SouthernCross size={16} color="var(--lt-sun)" />
          </div>

          {/* Sticker izquierda — zona alta, flanqueando el badge superior */}
          <div
            className="absolute left-[6%] top-[14%] hidden lg:block z-[2]"
            style={{ transform: 'rotate(-8deg)' }}
            data-lt-rotate="true"
            aria-hidden="true"
          >
            <StickerBadge tone="terracota" text="¡Hecho aquí!" />
          </div>

          {/* Sticker derecha — zona alta, flanqueando el badge superior */}
          <div
            className="absolute right-[6%] top-[18%] hidden lg:block z-[2]"
            style={{ transform: 'rotate(9deg)' }}
            data-lt-rotate="true"
            aria-hidden="true"
          >
            <StickerBadge tone="verde" text="Comunidad ✦ Latina" />
          </div>

          {/* H1 */}
          <h1
            id="hero-title"
            className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-3"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Bienvenidos a{' '}
            <em style={{ color: 'var(--lt-terracota)', fontStyle: 'italic' }}>
              tu territorio.
            </em>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 mt-4"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            {t('home.hero.tagline')}
          </p>

          {/* 4 CTAs sticker */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
            {CTA_LINKS.map(({ href, labelKey, tone, rotate, icon: Icon }) => (
              <Link key={href} href={href} aria-label={t(labelKey)}>
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

          {/* Search bar */}
          <div className="max-w-xl mx-auto">
            <HandDrawnBox
              padding="0.5rem"
              className="flex items-center gap-2"
              role="search"
              aria-label="Buscar en Latin Territory"
            >
              <label htmlFor="hero-search" className="sr-only">Buscar negocios, eventos o empleos</label>
              <Search className="h-5 w-5 ml-1 shrink-0" aria-hidden="true" style={{ color: 'var(--lt-ink-soft)' }} />
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Buscar negocios, eventos o empleos…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--lt-ink-soft)]"
                style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
              />
              <LtButton variant="pill" tone="terracota" size="sm">Buscar</LtButton>
            </HandDrawnBox>
          </div>

          {/* ── 4 pills de stats inline ── */}
          <div
            className="flex justify-center items-center flex-wrap gap-3.5 mt-10"
            aria-label="Estadísticas de la comunidad"
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border-[1.8px] border-[var(--lt-ink)]"
                style={{
                  background: 'var(--lt-paper)',
                  boxShadow: '3px 3px 0 var(--lt-ink)',
                  transform: `rotate(${i % 2 ? 1 : -1}deg)`,
                  filter: 'url(#lt-wobble-soft)',
                }}
                data-lt-rotate="true"
                data-lt-wobble="true"
                aria-label={`${s.n} ${s.label}`}
              >
                <span
                  className="text-[22px] font-extrabold leading-none"
                  style={{
                    fontFamily: 'var(--lt-font-serif)',
                    color: `var(--lt-${s.tone})`,
                    fontStyle: s.italic ? 'italic' : 'normal',
                  }}
                >
                  {s.n}
                </span>
                <span
                  className="text-xs uppercase tracking-[0.08em] font-semibold"
                  style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <main id="main-content">

        {/* ── Features ── */}
        <section className="py-24" aria-labelledby="features-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Encabezado */}
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-3 mb-5">
                <Squiggle color="var(--lt-terracota)" width={70} height={10} amplitude={3} aria-hidden="true" />
                <span
                  className="text-[13px] font-bold uppercase tracking-[0.32em]"
                  style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-terracota)' }}
                >
                  Lo que ofrecemos
                </span>
                <Squiggle color="var(--lt-terracota)" width={70} height={10} amplitude={3} aria-hidden="true" />
              </div>
              <h2
                id="features-title"
                className="font-bold leading-none tracking-tight"
                style={{
                  fontFamily: 'var(--lt-font-serif)',
                  color: 'var(--lt-ink)',
                  fontSize: 'clamp(40px, 6vw, 64px)',
                  margin: 0,
                }}
              >
                Una{' '}
                <em style={{ color: 'var(--lt-terracota)', fontStyle: 'italic' }}>plataforma,</em>
                <br />
                mil{' '}
                <em style={{ color: 'var(--lt-verde)', fontStyle: 'italic' }}>posibilidades.</em>
              </h2>
            </div>

            {/* Grid de features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map(({ href, icon: Icon, titleKey, descKey }, i) => {
                const tone = FEATURE_TONES[i]
                const rotation = FEATURE_ROTATIONS[i]
                return (
                  <div
                    key={href}
                    className="relative flex flex-col rounded-[22px] border-[2.2px] border-[var(--lt-ink)] overflow-hidden transition-all duration-200 hover:-translate-y-1"
                    style={{
                      background: 'var(--lt-paper)',
                      boxShadow: '6px 7px 0 var(--lt-ink)',
                      transform: `rotate(${rotation}deg)`,
                    }}
                    data-lt-rotate="true"
                  >
                    {/* Círculo tonal decorativo */}
                    <div
                      aria-hidden="true"
                      className="absolute -top-5 -right-5 w-24 h-24 rounded-full opacity-15"
                      style={{ background: `var(--lt-${tone})` }}
                    />

                    <div className="p-6 flex flex-col flex-1 gap-4 relative">
                      {/* Icono sticker */}
                      <div
                        className="w-16 h-16 flex items-center justify-center rounded-[18px] border-2 border-[var(--lt-ink)]"
                        style={{
                          background: `var(--lt-${tone})`,
                          color: tone === 'sun' ? 'var(--lt-ink)' : 'var(--lt-paper)',
                          boxShadow: '3px 3px 0 var(--lt-ink)',
                          filter: 'url(#lt-wobble-soft)',
                        }}
                        data-lt-wobble="true"
                        aria-hidden="true"
                      >
                        <Icon className="w-7 h-7" />
                      </div>

                      <h3
                        className="text-lg font-bold"
                        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                      >
                        {t(titleKey)}
                      </h3>

                      <p
                        className="text-sm leading-relaxed flex-1"
                        style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
                      >
                        {t(descKey)}
                      </p>

                      {/* CTA pill */}
                      <Link href={href} tabIndex={0} aria-label={`${t(titleKey)} — Explorar ahora`}>
                        <div
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-[1.6px] border-[var(--lt-ink)] text-[13px] font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
                          style={{
                            background: `var(--lt-${tone})`,
                            color: tone === 'sun' ? 'var(--lt-ink)' : 'var(--lt-paper)',
                            boxShadow: '2px 2px 0 var(--lt-ink)',
                          }}
                        >
                          Explorar ahora
                          <ArrowRight size={14} aria-hidden="true" />
                        </div>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Eventos próximos ── */}
        <section className="py-20" aria-labelledby="events-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header de sección */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
              <div>
                <div
                  className="text-[13px] font-bold uppercase tracking-[0.28em] mb-3"
                  style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-verde)' }}
                >
                  ✦ Próximamente ✦
                </div>
                <h2
                  id="events-title"
                  className="font-bold leading-none tracking-tight"
                  style={{
                    fontFamily: 'var(--lt-font-serif)',
                    color: 'var(--lt-ink)',
                    fontSize: 'clamp(36px, 5vw, 56px)',
                    margin: 0,
                  }}
                >
                  Eventos que{' '}
                  <em style={{ color: 'var(--lt-terracota)', fontStyle: 'italic' }}>laten.</em>
                </h2>
              </div>
              <Link href="/eventos">
                <LtButton
                  variant="sticker"
                  tone="ink"
                  size="md"
                  rotate={1}
                >
                  Ver todos los eventos →
                </LtButton>
              </Link>
            </div>

            {/* Grid de cards de eventos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MOCK_EVENTS.map((ev, i) => (
                <div
                  key={ev.id}
                  className="rounded-[var(--lt-radius-md)] border-[2.2px] border-[var(--lt-ink)] overflow-hidden transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: 'var(--lt-paper)',
                    boxShadow: 'var(--lt-shadow-sticker-lg)',
                    transform: `rotate(${EVENT_CARD_ROTATIONS[i]}deg)`,
                  }}
                  data-lt-rotate="true"
                >
                  {/* Fila superior: fecha + info */}
                  <div className="flex items-start gap-4 p-5 border-b-[2px] border-[var(--lt-ink)]">
                    {/* Fecha-pill */}
                    <div
                      className="flex flex-col items-center justify-center px-3 py-2 rounded-[var(--lt-radius-sm)] border-[1.8px] border-[var(--lt-ink)] shrink-0"
                      style={{
                        background: `var(--lt-${ev.tone})`,
                        color: ev.tone === 'sun' ? 'var(--lt-ink)' : 'var(--lt-paper)',
                        boxShadow: '2px 2px 0 var(--lt-ink)',
                        minWidth: '52px',
                      }}
                      aria-label={`${ev.day} de ${ev.month}`}
                    >
                      <span
                        className="font-black leading-none"
                        style={{ fontFamily: 'var(--lt-font-serif)', fontSize: '28px' }}
                      >
                        {ev.day}
                      </span>
                      <span
                        className="font-bold tracking-widest mt-0.5"
                        style={{ fontFamily: 'var(--lt-font-sans)', fontSize: '10px', letterSpacing: '0.12em' }}
                      >
                        {ev.month}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-bold text-base leading-snug line-clamp-2 mb-1"
                        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                      >
                        {ev.title}
                      </h3>
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
                        <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" style={{ color: 'var(--lt-terracota)' }} />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: avatares + asistentes + CTA */}
                  <div className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-2">
                      {/* Avatares apilados */}
                      <div className="flex" aria-hidden="true">
                        {['terracota', 'verde', 'sun'].map((t, ai) => (
                          <div
                            key={ai}
                            className="w-7 h-7 rounded-full border-2 border-[var(--lt-paper)] flex items-center justify-center text-[10px] font-bold"
                            style={{
                              background: `var(--lt-${t})`,
                              color: t === 'sun' ? 'var(--lt-ink)' : 'var(--lt-paper)',
                              marginLeft: ai === 0 ? 0 : '-8px',
                            }}
                          />
                        ))}
                      </div>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
                      >
                        +{ev.attendees} asistiendo
                      </span>
                    </div>
                    <Link
                      href="/eventos"
                      className="text-xs font-bold transition-colors hover:opacity-80 focus:outline-none focus:underline"
                      style={{ color: `var(--lt-${ev.tone})`, fontFamily: 'var(--lt-font-sans)' }}
                    >
                      Asistir →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA emprendedor ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-title">
          <div
            className="max-w-4xl mx-auto px-8 py-16 rounded-[var(--lt-radius-lg)] border-[2.5px] border-[var(--lt-ink)] text-center relative overflow-hidden"
            style={{
              background: 'var(--lt-terracota)',
              boxShadow: '8px 10px 0 var(--lt-ink)',
              transform: 'rotate(-0.4deg)',
            }}
            data-lt-rotate="true"
          >
            {/* Patrón diamonds overlay */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ opacity: 0.12 }}>
              <svg width="100%" height="100%">
                <rect width="100%" height="100%" fill="url(#lt-diamonds)" color="var(--lt-sun)" />
              </svg>
            </div>

            {/* Sol gigante decorativo */}
            <div
              aria-hidden="true"
              className="absolute pointer-events-none select-none"
              style={{ right: '-80px', bottom: '-120px', opacity: 0.7 }}
            >
              <SunMotif size={400} color="var(--lt-sun)" coreColor="var(--lt-paper)" />
            </div>

            {/* LeafSprig izquierda */}
            <div aria-hidden="true" className="absolute bottom-4 left-6 opacity-20 pointer-events-none">
              <LeafSprig size={70} color="var(--lt-paper)" />
            </div>

            {/* Contenido */}
            <div className="relative">
              <h2
                id="cta-title"
                className="font-black leading-tight mb-4"
                style={{
                  fontFamily: 'var(--lt-font-serif)',
                  color: 'var(--lt-paper)',
                  fontSize: 'clamp(32px, 5vw, 56px)',
                }}
              >
                {t('home.cta.hero.title').split('latino').length > 1
                  ? <>¿Eres emprendedor<br /><em style={{ color: 'var(--lt-sun)', fontStyle: 'italic' }}>latino?</em></>
                  : t('home.cta.hero.title')
                }
              </h2>
              <p
                className="text-lg mb-10 max-w-xl mx-auto"
                style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-paper)', opacity: 0.9 }}
              >
                {t('home.cta.hero.desc')}
              </p>

              {/* 2 botones */}
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/registrar-negocio">
                  <LtButton variant="sticker" tone="sun" size="lg" rotate={-2}>
                    Registrar mi negocio
                  </LtButton>
                </Link>
                <Link href="/soporte">
                  <LtButton variant="sticker" tone="paper" size="lg" rotate={1.2}>
                    Hablar con alguien
                  </LtButton>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
