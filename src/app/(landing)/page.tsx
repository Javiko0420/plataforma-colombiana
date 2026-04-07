'use client'

import { CSSProperties } from 'react'
import { Trophy, Award, Globe } from 'lucide-react'
import { FounderRegisterForm } from '@/components/ui/founder-register-form'
import { FoundersProgressBar } from '@/components/ui/founders-progress-bar'

const KEYFRAMES = `
@keyframes latamShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes latamShiftRight {
  0%   { background-position: 100% 50%; }
  50%  { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
`

const font = 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif'

const s = {
  root: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    backgroundColor: '#0c1a2e', fontFamily: font, color: '#fff',
    WebkitFontSmoothing: 'antialiased', margin: 0, padding: 0,
  } satisfies CSSProperties,

  header: {
    position: 'relative', zIndex: 20, width: '100%',
    padding: '16px 24px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 12,
    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  } satisfies CSSProperties,

  logoWrap: { display: 'flex', alignItems: 'center', gap: 8 } satisfies CSSProperties,
  logoText: { fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', fontFamily: font } satisfies CSSProperties,
  tagline: { fontSize: 12, color: '#d1d5db', marginLeft: 4, fontFamily: font } satisfies CSSProperties,

  main: { flex: 1, display: 'flex', flexDirection: 'column' as const } satisfies CSSProperties,

  heroCol: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    justifyContent: 'flex-end', overflow: 'hidden', minHeight: 520,
  } satisfies CSSProperties,

  abs: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } satisfies CSSProperties,

  heroContent: {
    position: 'relative', zIndex: 10, padding: 24,
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%',
  } satisfies CSSProperties,

  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'rgba(220,38,38,0.9)', backdropFilter: 'blur(4px)',
    borderRadius: 9999, padding: '6px 16px', marginBottom: 24, width: 'fit-content',
  } satisfies CSSProperties,

  badgeDot: {
    width: 10, height: 10, background: '#fff', borderRadius: '50%',
    animation: 'pulseDot 2s ease-in-out infinite',
  } satisfies CSSProperties,

  badgeText: {
    color: '#fff', fontWeight: 700, fontSize: 14,
    letterSpacing: '0.05em', textTransform: 'uppercase' as const, fontFamily: font,
  } satisfies CSSProperties,

  h1: {
    fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.15,
    marginBottom: 12, textShadow: '0 2px 8px rgba(0,0,0,0.3)', fontFamily: font,
  } satisfies CSSProperties,

  h1Accent: { color: '#f5d060' },

  desc: {
    fontSize: 16, color: '#f3f4f6', maxWidth: 560, marginBottom: 32,
    lineHeight: 1.7, textShadow: '0 1px 4px rgba(0,0,0,0.2)', fontFamily: font,
  } satisfies CSSProperties,

  descStrong: { color: '#f5d060', fontWeight: 700 },

  benefits: {
    listStyle: 'none', padding: 0, margin: '0 0 16px',
    display: 'flex', flexDirection: 'column', gap: 16,
  } satisfies CSSProperties,

  benefitRow: { display: 'flex', alignItems: 'flex-start', gap: 12 } satisfies CSSProperties,

  benefitIcon: {
    flexShrink: 0, width: 40, height: 40, borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  } satisfies CSSProperties,

  benefitText: {
    color: '#fff', fontWeight: 600, fontSize: 14,
    textShadow: '0 1px 2px rgba(0,0,0,0.15)', lineHeight: 1.5, paddingTop: 8, fontFamily: font,
  } satisfies CSSProperties,

  formCol: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    justifyContent: 'center', overflow: 'hidden',
  } satisfies CSSProperties,

  formWrapper: {
    position: 'relative', zIndex: 10, maxWidth: 448, width: '100%',
    margin: '0 auto', padding: '40px 24px',
  } satisfies CSSProperties,

  card: {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
    borderRadius: 16, padding: 24,
    border: '1px solid rgba(255,255,255,0.15)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
  } satisfies CSSProperties,

  cardTitle: { textAlign: 'center' as const, marginBottom: 24 },

  cardH2: {
    fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.25,
    textShadow: '0 2px 6px rgba(0,0,0,0.2)', fontFamily: font,
  } satisfies CSSProperties,

  cardSub: { fontSize: 14, color: '#f5d060', fontWeight: 600, marginTop: 4, fontFamily: font } satisfies CSSProperties,

  divider: { marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)' } satisfies CSSProperties,

  footer: {
    marginTop: 20, textAlign: 'center' as const, fontSize: 11,
    color: 'rgba(209,213,219,0.8)', lineHeight: 1.6, fontFamily: font,
  } satisfies CSSProperties,

  overlay: (bg: string): CSSProperties => ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: bg }),
}

export default function FoundersLandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      <div style={s.root}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.logoWrap}>
            <span style={s.logoText}>Latin</span>
            <img
              src="/latin-territory-logo.png"
              alt="Latin Territory"
              width={28}
              height={28}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <span style={s.logoText}>Territory</span>
          </div>
          <span style={s.tagline}>Conectando a la comunidad latina en Australia.</span>
        </header>

        {/* Main — switches to row at >=1024px via JS-detected media query */}
        <ResponsiveMain>
          {(isLg) => (
            <>
              {/* LEFT — Hero */}
              <div style={{ ...s.heroCol, ...(isLg ? { width: '58%' } : {}) }}>
                <div style={{ ...s.abs, background: 'linear-gradient(135deg,#1a3a6b,#6b1a1a,#1a5c2e,#7a5c0b,#1a3a6b,#4a1a4a,#6b1a1a,#1a5c2e)', backgroundSize: '400% 400%', animation: 'latamShift 30s ease infinite' }} />
                <div style={s.overlay('linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.15) 100%)')} />

                <div style={{ ...s.heroContent, ...(isLg ? { padding: 48 } : {}) }}>
                  <div style={s.badge}>
                    <span style={s.badgeDot} />
                    <span style={s.badgeText}>CONVOCATORIA VIP CERRADA</span>
                  </div>

                  <h1 style={{ ...s.h1, ...(isLg ? { fontSize: 48 } : {}) }}>
                    Únete como <span style={s.h1Accent}>Negocio Fundador.</span>
                  </h1>

                  <p style={s.desc}>
                    Sé parte de los 100 primeros negocios en la plataforma más grande
                    para latinos en Australia.{' '}
                    <strong style={s.descStrong}>
                      Obtén posicionamiento exclusivo y beneficios vitalicios
                    </strong>{' '}
                    antes del lanzamiento público.
                  </p>

                  <ul style={s.benefits}>
                    {[
                      { Icon: Trophy, text: 'Posicionamiento Top 1 en búsquedas por 6 meses' },
                      { Icon: Award, text: 'Insignia Permanente de "Negocio Fundador"' },
                      { Icon: Globe, text: 'Exposición a nivel nacional e internacional' },
                    ].map(({ Icon, text }) => (
                      <li key={text} style={s.benefitRow}>
                        <div style={s.benefitIcon}>
                          <Icon width={20} height={20} color="#fcd34d" />
                        </div>
                        <span style={s.benefitText}>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* RIGHT — Form */}
              <div style={{ ...s.formCol, ...(isLg ? { width: '42%' } : {}) }}>
                <div style={{ ...s.abs, background: 'linear-gradient(315deg,#7a5c0b,#1a3a6b,#4a1a4a,#1a5c2e,#6b1a1a,#7a5c0b,#1a3a6b,#1a5c2e)', backgroundSize: '400% 400%', animation: 'latamShiftRight 34s ease infinite' }} />
                <div style={s.overlay('rgba(0,0,0,0.55)')} />

                <div style={{ ...s.formWrapper, ...(isLg ? { padding: 40 } : {}) }}>
                  <div style={s.card}>
                    <div style={s.cardTitle}>
                      <h2 style={s.cardH2}>Reclama tu Espacio VIP Gratis</h2>
                      <p style={s.cardSub}>Solo 100 cupos</p>
                    </div>

                    <FounderRegisterForm variant="dark" />

                    <div style={s.divider}>
                      <FoundersProgressBar variant="dark" />
                    </div>
                    <p style={s.footer}>
                      Respaldado por JaviWarrior Studio. Sin tarjeta de crédito.<br />
                      Proceso de 1 minuto.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </ResponsiveMain>
      </div>
    </>
  )
}

function ResponsiveMain({ children }: { children: (isLg: boolean) => React.ReactNode }) {
  const [isLg, setIsLg] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsLg(e.matches)
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return (
    <div style={{ ...s.main, ...(isLg ? { flexDirection: 'row' } : {}) }}>
      {children(isLg)}
    </div>
  )
}

import { useState, useEffect } from 'react'
