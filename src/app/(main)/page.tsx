'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Store, Briefcase, CalendarDays, MessageCircle, Trophy, Cloud,
  ArrowLeftRight, Radio, Users, Search, ArrowRight, MapPin, Play,
  Sparkles, Heart, Zap, Shield, Layers, Star, Sun, Moon,
} from 'lucide-react'
import { ConstellationCanvas } from '@/components/home/ConstellationCanvas'
import { useTheme } from 'next-themes'

/* ─── paleta de colores helpers ─── */
const ACCENT_TINTS = ['var(--lh-accent)', 'var(--lh-terra)', 'var(--lh-warm)', 'var(--lh-green)']
const chip = (v: string) => `color-mix(in oklch,${v} 14%,transparent)`

/* ─── Datos ─── */
const CATEGORIES = [
  { name: 'Negocios',   desc: 'Directorio latino',   Icon: Store },
  { name: 'Empleos',    desc: 'Oportunidades',        Icon: Briefcase },
  { name: 'Eventos',    desc: 'Agenda cultural',      Icon: CalendarDays },
  { name: 'Foros',      desc: 'Conversa y conecta',  Icon: MessageCircle },
  { name: 'Deportes',   desc: 'Resultados en vivo',  Icon: Trophy },
  { name: 'Clima',      desc: 'Tu ciudad hoy',        Icon: Cloud },
  { name: 'Cambio',     desc: 'Tasas al instante',    Icon: ArrowLeftRight },
  { name: 'Radio',      desc: 'En vivo 24/7',         Icon: Radio },
  { name: 'Comunidad',  desc: 'Conoce gente',         Icon: Users },
]

const CATEGORY_HREFS = ['/directorio', '/empleos', '/eventos', '/foros', '/deportes', '/clima', '/tasas', '/emisoras', '/directorio']

const PH = {
  a: 'repeating-linear-gradient(135deg,#cdd7e2 0 11px,#d9e1ea 11px 22px)',
  b: 'repeating-linear-gradient(135deg,#e6d3c4 0 11px,#efe0d3 11px 22px)',
  c: 'repeating-linear-gradient(135deg,#cfe0d4 0 11px,#dceae0 11px 22px)',
  d: 'repeating-linear-gradient(135deg,#e7d6b8 0 11px,#f0e3c8 11px 22px)',
}

const BUSINESSES = [
  { name: 'Sabor Bogotá',      cat: 'Restaurante', city: 'Sydney, NSW',     rating: '4.9', img: PH.a },
  { name: 'Don Pancho Grocer', cat: 'Mercado',     city: 'Melbourne, VIC',  rating: '4.8', img: PH.b },
  { name: 'Estudio Tango',     cat: 'Baile',       city: 'Brisbane, QLD',   rating: '5.0', img: PH.c },
  { name: 'Café Andino',       cat: 'Cafetería',   city: 'Perth, WA',       rating: '4.7', img: PH.d },
]

const JOBS = [
  { role: 'Chef de cocina latina',  company: 'Sabor Bogotá',    city: 'Sydney',    type: 'Tiempo completo', pay: '$75k', initials: 'SB', colorIdx: 0 },
  { role: 'Barista bilingüe',       company: 'Café Andino',     city: 'Perth',     type: 'Medio tiempo',   pay: '$32/h', initials: 'CA', colorIdx: 1 },
  { role: 'Community Manager',      company: 'Latin Media Co.', city: 'Remoto',    type: 'Contrato',       pay: '$60k',  initials: 'LM', colorIdx: 2 },
  { role: 'Repartidor con auto',    company: 'Don Pancho',      city: 'Melbourne', type: 'Flexible',       pay: '$30/h', initials: 'DP', colorIdx: 3 },
]

const EVENTS = [
  { title: 'Festival Latino Sydney',     day: '21', month: 'Jun', place: 'Darling Harbour', city: 'Sydney',    tag: 'Música',  bg: 'linear-gradient(160deg,#2E5E8C,#1a3a57)' },
  { title: 'Noche de Salsa & Bachata',   day: '28', month: 'Jun', place: 'The Espy',        city: 'Melbourne', tag: 'Baile',   bg: 'linear-gradient(160deg,#D8775F,#b8543c)' },
  { title: 'Mercado Gastronómico',       day: '05', month: 'Jul', place: 'South Bank',      city: 'Brisbane',  tag: 'Comida',  bg: 'linear-gradient(160deg,#5C8A6B,#3f6b4d)' },
]

const FORUMS = [
  { title: '¿Mejor lugar para enviar remesas?',          author: 'María G.',  time: 'hace 2 h', replies: '24', av: 'MG', colorIdx: 0 },
  { title: 'Validar título profesional en Australia',    author: 'Carlos R.', time: 'hace 5 h', replies: '41', av: 'CR', colorIdx: 1 },
  { title: 'Grupos de fútbol los domingos en Sydney',   author: 'Diego T.',  time: 'hace 1 d', replies: '17', av: 'DT', colorIdx: 2 },
]

const FX = [
  { code: 'COP', rate: '2.610', change: '+0,4%', up: true },
  { code: 'MXN', rate: '12,1',  change: '-0,2%', up: false },
  { code: 'ARS', rate: '640',   change: '+1,1%', up: true },
  { code: 'CLP', rate: '612',   change: '+0,3%', up: true },
]

const WHY = [
  { title: 'Todo en un lugar',     desc: 'Negocios, empleos, eventos y comunidad sin saltar entre apps.',              Icon: Layers,  colorIdx: 0 },
  { title: 'Hecho para latinos',   desc: 'Contenido y servicios pensados para nuestra cultura y necesidades.',         Icon: Heart,   colorIdx: 1 },
  { title: 'Rápido y claro',       desc: 'Encuentra lo que buscas en segundos, sin ruido ni saturación.',              Icon: Zap,     colorIdx: 2 },
  { title: 'Comunidad segura',     desc: 'Perfiles verificados y un espacio cuidado para conectar con confianza.',     Icon: Shield,  colorIdx: 3 },
]



const POPULAR = ['Restaurantes', 'Trabajo remoto', 'Salsa', 'Remesas', 'Fútbol', 'Abogados']

/* ─── Scroll reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('lh-in'); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ─── Reveal wrapper component ─── */
function Reveal({ children, delay = 0, className = '', style = {} }: {
  children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties
}) {
  const ref = useReveal()
  return (
    <div
      ref={ref}
      className={`lh-reveal ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════ */
export default function Home() {
  const heroVariant = 2
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <>
      {/* Estilos de reveal (scoped, sin afectar el resto del app) */}
      <style>{`
        #lt-home .lh-reveal {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity .7s cubic-bezier(.22,.61,.36,1), transform .7s cubic-bezier(.22,.61,.36,1);
        }
        #lt-home .lh-reveal.lh-in {
          opacity: 1;
          transform: none;
        }
        #lt-home a { color: inherit; text-decoration: none; }
        #lt-home *  { box-sizing: border-box; }
      `}</style>

      <div
        id="lt-home"
        style={{
          background: 'var(--lh-bg)',
          color: 'var(--lh-fg)',
          fontFamily: 'var(--lh-font)',
          WebkitFontSmoothing: 'antialiased',
          overflowX: 'hidden',
        }}
      >

        {/* ══════ HERO ══════ */}
        <section
          id="top"
          style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--lh-border2)' }}
        >
          {/* Aurora */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', width: 620, height: 620, left: -160, top: -220, borderRadius: '50%', background: 'radial-gradient(circle,var(--lh-aurora1),transparent 62%)', filter: 'blur(20px)', animation: 'lh-float 16s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 560, height: 560, right: -180, top: -120, borderRadius: '50%', background: 'radial-gradient(circle,var(--lh-aurora2),transparent 62%)', filter: 'blur(20px)', animation: 'lh-float2 19s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 520, height: 520, left: '38%', bottom: -280, borderRadius: '50%', background: 'radial-gradient(circle,var(--lh-aurora3),transparent 64%)', filter: 'blur(24px)', animation: 'lh-float 22s ease-in-out infinite' }} />
          </div>

          <ConstellationCanvas variant={heroVariant} />

          <div style={{ position: 'relative', maxWidth: 1000, margin: '0 auto', padding: 'clamp(80px,12vw,118px) 24px 96px', textAlign: 'center' }}>

            {/* Badge */}
            <Reveal style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 15px', borderRadius: 99, background: 'var(--lh-glass)', border: '1px solid var(--lh-glassbrd)', backdropFilter: 'blur(12px)', fontSize: 13, color: 'var(--lh-fg2)', fontWeight: 500, marginBottom: 30, boxShadow: 'var(--lh-shadow)' }}>
              La comunidad latina en Australia, en un solo lugar
            </Reveal>


            {/* H1 */}
            <Reveal delay={80}>
              <h1 style={{
                fontFamily: 'var(--lh-font)',
                fontSize: 'clamp(44px,7vw,84px)',
                lineHeight: 1.02,
                letterSpacing: '-.035em',
                fontWeight: 600,
                margin: '0 0 24px',
              }}>
                Tu territorio latino,{' '}
                <span style={{ background: 'linear-gradient(120deg,var(--lh-accent),var(--lh-terra) 60%,var(--lh-warm))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  conectado.
                </span>
              </h1>
            </Reveal>

            {/* Subtítulo */}
            <Reveal delay={140}>
              <p style={{ fontSize: 'clamp(17px,2.1vw,21px)', lineHeight: 1.55, color: 'var(--lh-fg2)', maxWidth: 600, margin: '0 auto 38px', fontWeight: 400 }}>
                Encuentra negocios, empleos, eventos y comunidad latinoamericana — todo en una plataforma pensada para ti.
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={200} style={{ display: 'flex', gap: 13, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 46 }}>
              <Link
                href="#categorias"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 26px', borderRadius: 13, background: 'var(--lh-accent)', color: '#fff', fontSize: 16, fontWeight: 600, letterSpacing: '-.01em', boxShadow: '0 14px 30px -12px var(--lh-accent)', transition: '.24s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px -12px var(--lh-accent)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 30px -12px var(--lh-accent)' }}
              >
                Explorar comunidad <ArrowRight size={18} />
              </Link>
              <Link
                href="/registrar-negocio"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 26px', borderRadius: 13, background: 'var(--lh-surface)', color: 'var(--lh-fg)', border: '1px solid var(--lh-border)', fontSize: 16, fontWeight: 600, letterSpacing: '-.01em', boxShadow: 'var(--lh-shadow)', transition: '.24s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.background = 'var(--lh-surface2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.background = 'var(--lh-surface)' }}
              >
                Registrar mi negocio
              </Link>
            </Reveal>


          </div>
        </section>

        {/* ══════ QUICK SEARCH ══════ */}
        <section style={{ maxWidth: 1220, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 5, marginTop: -80 }}>
          <Reveal style={{ background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', borderRadius: 24, boxShadow: 'var(--lh-shadow-lg)', padding: 26 }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 8px 6px 18px', border: '1px solid var(--lh-border)', borderRadius: 15, background: 'var(--lh-surface2)', transition: '.2s' }}
            >
              <Search size={18} style={{ color: 'var(--lh-fg3)', flexShrink: 0 }} />
              <input
                placeholder="Busca negocios, empleos, eventos…"
                style={{ flex: 1, border: 0, background: 'transparent', outline: 'none', color: 'var(--lh-fg)', fontSize: 16.5, fontFamily: 'var(--lh-font)', padding: '13px 0' }}
              />
              <button
                style={{ padding: '12px 22px', borderRadius: 11, border: 0, background: 'var(--lh-accent)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--lh-font)', transition: '.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}
              >
                Buscar
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--lh-fg3)', marginRight: 2 }}>Popular</span>
              {POPULAR.map(p => (
                <button
                  key={p}
                  style={{ padding: '7px 14px', borderRadius: 99, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', color: 'var(--lh-fg2)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--lh-font)', transition: '.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lh-accent)'; el.style.color = 'var(--lh-fg)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--lh-border)'; el.style.color = 'var(--lh-fg2)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ══════ CATEGORIES ══════ */}
        <section id="categorias" style={{ maxWidth: 1220, margin: '0 auto', padding: '96px 24px 0' }}>
          <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 36 }}>
            <div>
              <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--lh-accent)', fontWeight: 500 }}>Todo lo que necesitas</span>
              <h2 style={{ fontSize: 'clamp(30px,4vw,44px)', lineHeight: 1.06, letterSpacing: '-.03em', fontWeight: 600, margin: '12px 0 0', fontFamily: 'var(--lh-font)' }}>Explora por categoría</h2>
            </div>
            <p style={{ maxWidth: 300, color: 'var(--lh-fg2)', fontSize: 15.5, lineHeight: 1.55, margin: '0 0 6px', display: 'none' }} className="lt-desk-only">
              Nueve módulos para conectar con tu comunidad, en menos de cinco segundos.
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
            {CATEGORIES.map(({ name, desc, Icon }, i) => {
              const c = ACCENT_TINTS[i % 4]
              return (
                <Reveal key={name} delay={i * 40}>
                  <Link
                    href={CATEGORY_HREFS[i]}
                    style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, borderRadius: 20, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.26s cubic-bezier(.22,.61,.36,1)', textDecoration: 'none' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
                  >
                    <span style={{ width: 46, height: 46, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', background: chip(c), color: c }}>
                      <Icon size={22} />
                    </span>
                    <div>
                      <div style={{ fontSize: 16.5, fontWeight: 600, letterSpacing: '-.01em' }}>{name}</div>
                      <div style={{ fontSize: 13.5, color: 'var(--lh-fg2)', marginTop: 3 }}>{desc}</div>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* ══════ FEATURED BUSINESSES ══════ */}
        <section id="negocios" style={{ maxWidth: 1220, margin: '0 auto', padding: '96px 24px 0' }}>
          <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 36 }}>
            <div>
              <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--lh-terra)', fontWeight: 500 }}>Directorio latino</span>
              <h2 style={{ fontSize: 'clamp(30px,4vw,44px)', lineHeight: 1.06, letterSpacing: '-.03em', fontWeight: 600, margin: '12px 0 0', fontFamily: 'var(--lh-font)' }}>Negocios destacados</h2>
            </div>
            <Link href="/directorio" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--lh-accent)', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', transition: '.2s' }}>
              Ver directorio <ArrowRight size={16} />
            </Link>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
            {BUSINESSES.map(({ name, cat, city, rating, img }, i) => (
              <Reveal key={name} delay={i * 50}>
                <article
                  style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.26s cubic-bezier(.22,.61,.36,1)' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
                >
                  <div style={{ position: 'relative', height: 148, background: img, display: 'flex', alignItems: 'flex-end', padding: 12 }}>
                    <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 10.5, color: 'rgba(255,255,255,.92)', background: 'rgba(0,0,0,.28)', backdropFilter: 'blur(4px)', padding: '4px 8px', borderRadius: 7 }}>foto del local</span>
                    <span style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(8px)', fontSize: 12.5, fontWeight: 600, color: '#181B21' }}>
                      <Star size={11} fill="#D4A24C" stroke="#D4A24C" /> {rating}
                    </span>
                  </div>
                  <div style={{ padding: '18px 18px 20px' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--lh-accent)', background: chip('var(--lh-accent)'), padding: '3px 9px', borderRadius: 99, display: 'inline-block', marginBottom: 9 }}>{cat}</span>
                    <h3 style={{ fontSize: 17.5, fontWeight: 600, letterSpacing: '-.015em', margin: '0 0 6px', fontFamily: 'var(--lh-font)' }}>{name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lh-fg2)', fontSize: 13.5 }}>
                      <MapPin size={14} /> {city}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════ JOBS ══════ */}
        <section id="empleos" style={{ maxWidth: 1220, margin: '0 auto', padding: '96px 24px 0' }}>
          <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 36 }}>
            <div>
              <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--lh-green)', fontWeight: 500 }}>Oportunidades</span>
              <h2 style={{ fontSize: 'clamp(30px,4vw,44px)', lineHeight: 1.06, letterSpacing: '-.03em', fontWeight: 600, margin: '12px 0 0', fontFamily: 'var(--lh-font)' }}>Empleos recientes</h2>
            </div>
            <Link href="/empleos" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--lh-accent)', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>
              Ver todos <ArrowRight size={16} />
            </Link>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {JOBS.map(({ role, company, city, type, pay, initials, colorIdx }, i) => {
              const c = ACCENT_TINTS[colorIdx]
              return (
                <Reveal key={role} delay={i * 45}>
                  <Link
                    href="/empleos"
                    style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px', borderRadius: 16, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.24s', textDecoration: 'none' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateX(4px)'; el.style.borderColor = chip('var(--lh-accent)') }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.borderColor = 'var(--lh-border)' }}
                  >
                    <span style={{ width: 48, height: 48, flexShrink: 0, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, background: `linear-gradient(135deg,${c},var(--lh-accent-ink))`, color: '#fff', letterSpacing: '-.02em' }}>
                      {initials}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 16.5, fontWeight: 600, letterSpacing: '-.01em' }}>{role}</div>
                      <div style={{ fontSize: 13.5, color: 'var(--lh-fg2)', marginTop: 3 }}>{company} · {city}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--lh-fg2)', background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)', padding: '6px 11px', borderRadius: 99 }}>{type}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--lh-green)', background: chip('var(--lh-green)'), padding: '6px 11px', borderRadius: 99 }}>{pay}</span>
                    </div>
                    <ArrowRight size={16} style={{ color: 'var(--lh-fg3)', flexShrink: 0 }} />
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* ══════ EVENTS ══════ */}
        <section id="eventos" style={{ maxWidth: 1220, margin: '0 auto', padding: '96px 24px 0' }}>
          <Reveal style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 36 }}>
            <div>
              <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--lh-warm)', fontWeight: 500 }}>Agenda cultural</span>
              <h2 style={{ fontSize: 'clamp(30px,4vw,44px)', lineHeight: 1.06, letterSpacing: '-.03em', fontWeight: 600, margin: '12px 0 0', fontFamily: 'var(--lh-font)' }}>Eventos próximos</h2>
            </div>
            <Link href="/eventos" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: 'var(--lh-accent)', fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap' }}>
              Ver agenda <ArrowRight size={16} />
            </Link>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 18 }}>
            {EVENTS.map(({ title, day, month, place, city, tag, bg }, i) => (
              <Reveal key={title} delay={i * 60}>
                <article
                  style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: bg, minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 20, boxShadow: 'var(--lh-shadow)', transition: '.26s cubic-bezier(.22,.61,.36,1)', cursor: 'pointer' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 56, padding: '9px 0', borderRadius: 13, background: 'rgba(255,255,255,.92)', color: '#181B21', boxShadow: '0 8px 20px -8px rgba(0,0,0,.4)' }}>
                      <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing: '-.02em' }}>{day}</span>
                      <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#5C616D', marginTop: 2 }}>{month}</span>
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,.32)', backdropFilter: 'blur(6px)', padding: '5px 11px', borderRadius: 99 }}>{tag}</span>
                  </div>
                  <div style={{ color: '#fff', textShadow: '0 1px 14px rgba(0,0,0,.4)' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.015em', margin: '0 0 7px', lineHeight: 1.15, fontFamily: 'var(--lh-font)' }}>{title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, opacity: .95 }}>
                      <MapPin size={14} /> {place} · {city}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════ COMMUNITY / FORUMS ══════ */}
        <section id="comunidad" style={{ maxWidth: 1220, margin: '0 auto', padding: '96px 24px 0' }}>
          <Reveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }}>
              {/* Foros */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--lh-accent)', fontWeight: 500 }}>Foros & comunidad</span>
                  <h2 style={{ fontSize: 'clamp(26px,3.4vw,38px)', lineHeight: 1.08, letterSpacing: '-.03em', fontWeight: 600, margin: '12px 0 0', fontFamily: 'var(--lh-font)' }}>Conversaciones que conectan</h2>
                </div>
                {FORUMS.map(({ title, author, time, replies, av, colorIdx }) => {
                  const c = ACCENT_TINTS[colorIdx]
                  return (
                    <Link
                      key={title}
                      href="/foros"
                      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '17px 19px', borderRadius: 15, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.22s', textDecoration: 'none' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateX(4px)' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = '' }}
                    >
                      <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 12, background: `linear-gradient(135deg,${c},var(--lh-accent-ink))`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15 }}>{av}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-.01em' }}>{title}</div>
                        <div style={{ fontSize: 13, color: 'var(--lh-fg2)', marginTop: 3 }}>{author} · {time}</div>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lh-fg2)', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                        <MessageCircle size={15} /> {replies}
                      </span>
                    </Link>
                  )
                })}
              </div>

              {/* Join CTA card */}
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 28, background: 'linear-gradient(160deg,var(--lh-accent),var(--lh-accent-ink))', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: 'var(--lh-shadow-lg)' }}>
                <div aria-hidden="true" style={{ position: 'absolute', width: 240, height: 240, right: -90, top: -90, borderRadius: '50%', background: 'rgba(255,255,255,.12)', filter: 'blur(10px)' }} />
                <div style={{ position: 'relative' }}>
                  <span style={{ display: 'inline-flex', width: 46, height: 46, borderRadius: 13, background: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <Users size={22} />
                  </span>
                  <h3 style={{ fontSize: 23, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1.15, margin: '0 0 10px', fontFamily: 'var(--lh-font)' }}>Únete a la comunidad</h3>
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, opacity: .9, margin: 0 }}>Más de 12.000 latinos compartiendo consejos, recomendaciones y apoyo cada día.</p>
                </div>
                <Link
                  href="/auth/signup"
                  style={{ position: 'relative', marginTop: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', borderRadius: 12, background: '#fff', color: 'var(--lh-accent)', fontSize: 15, fontWeight: 600, transition: '.22s', textDecoration: 'none' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}
                >
                  Crear cuenta gratis <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ══════ PREMIUM WIDGETS ══════ */}
        <section style={{ maxWidth: 1220, margin: '0 auto', padding: '96px 24px 0' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: 38 }}>
            <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--lh-fg3)', fontWeight: 500 }}>Tu día a día</span>
            <h2 style={{ fontSize: 'clamp(30px,4vw,44px)', lineHeight: 1.06, letterSpacing: '-.03em', fontWeight: 600, margin: '12px 0 0', fontFamily: 'var(--lh-font)' }}>Información útil, en vivo</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 18 }}>

            {/* Clima */}
            <Reveal delay={0}>
              <Link href="/clima" style={{ display: 'block', borderRadius: 20, padding: 22, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.26s', textDecoration: 'none' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lh-fg3)' }}>Clima</span>
                  <Cloud size={20} style={{ color: 'var(--lh-warm)' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                  <span style={{ fontSize: 46, fontWeight: 600, letterSpacing: '-.03em', lineHeight: 1, color: 'var(--lh-fg)' }}>21°</span>
                  <span style={{ color: 'var(--lh-fg2)', fontSize: 14, paddingBottom: 8 }}>Parcial nublado</span>
                </div>
                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: 'var(--lh-fg2)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={13} /> Sydney</span>
                  <span>↑24° ↓15°</span>
                </div>
              </Link>
            </Reveal>

            {/* Tasas */}
            <Reveal delay={60}>
              <Link href="/tasas" style={{ display: 'block', borderRadius: 20, padding: 22, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.26s', textDecoration: 'none' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lh-fg3)' }}>Cambio · AUD</span>
                  <ArrowLeftRight size={20} style={{ color: 'var(--lh-green)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {FX.map(({ code, rate, change, up }) => (
                    <div key={code} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, fontWeight: 600, color: 'var(--lh-fg2)', background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)', padding: '3px 7px', borderRadius: 6 }}>{code}</span>
                        <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--lh-fg)' }}>{rate}</span>
                      </span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: up ? 'var(--lh-green)' : 'var(--lh-terra)' }}>{change}</span>
                    </div>
                  ))}
                </div>
              </Link>
            </Reveal>

            {/* Deportes */}
            <Reveal delay={120}>
              <Link href="/deportes" style={{ display: 'block', borderRadius: 20, padding: 22, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.26s', textDecoration: 'none' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--lh-fg3)' }}>Deportes</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'var(--lh-terra)' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--lh-terra)', display: 'inline-block', animation: 'lh-pulse 1.6s infinite' }} />
                    EN VIVO
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--lh-fg3)', fontWeight: 500, marginBottom: 12 }}>Copa Libertadores</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--lh-fg)' }}>BOC</div></div>
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', padding: '0 14px', color: 'var(--lh-fg)' }}>
                    2<span style={{ color: 'var(--lh-fg3)', margin: '0 6px' }}>·</span>1
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15, color: 'var(--lh-fg)' }}>RIV</div></div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12.5, color: 'var(--lh-fg2)' }}>73&apos;</div>
              </Link>
            </Reveal>

            {/* Radio */}
            <Reveal delay={180}>
              <Link href="/emisoras" style={{ display: 'block', borderRadius: 20, padding: 22, background: 'linear-gradient(160deg,var(--lh-terra),var(--lh-warm))', color: '#fff', boxShadow: 'var(--lh-shadow)', transition: '.26s', textDecoration: 'none' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                  <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .85 }}>Radio</span>
                  <span style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 18 }}>
                    {[0, .2, .1, .3].map((delay, k) => (
                      <span key={k} style={{ width: 3, background: '#fff', borderRadius: 2, animation: `lh-eq ${.8 + k * .1}s ease-in-out infinite`, animationDelay: `${delay}s`, display: 'block', height: '100%' }} />
                    ))}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button
                    aria-label="Reproducir"
                    onClick={e => e.preventDefault()}
                    style={{ width: 50, height: 50, flexShrink: 0, borderRadius: '50%', border: 0, background: '#fff', color: 'var(--lh-terra)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '.2s' }}
                  >
                    <Play size={20} fill="currentColor" />
                  </button>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-.01em' }}>Radio Latina FM</div>
                    <div style={{ fontSize: 13, opacity: .9, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Mañanas con sabor — Mix tropical</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, fontSize: 12, opacity: .85, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={13} /> 1.2k escuchando
                </div>
              </Link>
            </Reveal>

          </div>
        </section>

        {/* ══════ WHY ══════ */}
        <section style={{ maxWidth: 1220, margin: '0 auto', padding: '120px 24px 0' }}>
          <Reveal style={{ maxWidth: 620, margin: '0 auto 52px', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--lh-accent)', fontWeight: 500 }}>Por qué Latin Territory</span>
            <h2 style={{ fontSize: 'clamp(30px,4.2vw,46px)', lineHeight: 1.06, letterSpacing: '-.03em', fontWeight: 600, margin: '14px 0 0', fontFamily: 'var(--lh-font)' }}>Una plataforma, toda tu comunidad</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
            {WHY.map(({ title, desc, Icon, colorIdx }, i) => {
              const c = ACCENT_TINTS[colorIdx]
              return (
                <Reveal key={title} delay={i * 50}>
                  <div
                    style={{ padding: '28px 24px', borderRadius: 20, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', boxShadow: 'var(--lh-shadow)', transition: '.26s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
                  >
                    <span style={{ display: 'inline-flex', width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', background: chip(c), color: c, marginBottom: 18 }}>
                      <Icon size={24} />
                    </span>
                    <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.015em', margin: '0 0 8px', fontFamily: 'var(--lh-font)' }}>{title}</h3>
                    <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0 }}>{desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </section>

        {/* ══════ FINAL CTA ══════ */}
        <section id="registrar" style={{ maxWidth: 1220, margin: '0 auto', padding: '120px 24px 0' }}>
          <Reveal>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 32, padding: 'clamp(40px,6vw,76px)', textAlign: 'center', background: 'linear-gradient(150deg,var(--lh-accent),var(--lh-accent-ink) 55%,#1a2b3d)', color: '#fff', boxShadow: 'var(--lh-shadow-lg)' }}>
              <div aria-hidden="true" style={{ position: 'absolute', width: 420, height: 420, left: -120, bottom: -200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(216,119,95,.5),transparent 62%)', filter: 'blur(20px)' }} />
              <div aria-hidden="true" style={{ position: 'absolute', width: 380, height: 380, right: -120, top: -180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,162,76,.42),transparent 62%)', filter: 'blur(20px)' }} />
              <div style={{ position: 'relative' }}>
                <h2 style={{ fontSize: 'clamp(30px,4.6vw,52px)', lineHeight: 1.04, letterSpacing: '-.035em', fontWeight: 600, margin: '0 0 18px', fontFamily: 'var(--lh-font)' }}>
                  Tu lugar en el territorio<br />latino te espera
                </h2>
                <p style={{ fontSize: 'clamp(16px,2vw,19px)', lineHeight: 1.5, opacity: .9, maxWidth: 520, margin: '0 auto 36px' }}>
                  Únete, registra tu negocio o publica un empleo. Gratis para empezar.
                </p>
                <div style={{ display: 'flex', gap: 13, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    href="/auth/signup"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 13, background: '#fff', color: 'var(--lh-accent)', fontSize: 16, fontWeight: 600, transition: '.24s', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = '' }}
                  >
                    Unirme a la comunidad <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/empleos"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '15px 28px', borderRadius: 13, background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', fontSize: 16, fontWeight: 600, transition: '.24s', textDecoration: 'none' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,.2)'; el.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,.12)'; el.style.transform = '' }}
                  >
                    Publicar empleo
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Espacio final antes del footer global */}
        <div style={{ paddingBottom: 64 }} />

      </div>
    </>
  )
}
