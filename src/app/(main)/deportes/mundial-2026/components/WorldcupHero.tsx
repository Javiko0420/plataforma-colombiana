import Link from 'next/link'
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline'
import { translate } from '@/lib/i18n'

function HexPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="wc-hex" x="0" y="0" width="54" height="94" patternUnits="userSpaceOnUse">
          <polygon
            points="27,1 53,15 53,43 27,57 1,43 1,15"
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1.5"
          />
          <polygon
            points="0,50 26,64 26,92 0,106 -26,92 -26,64"
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1.5"
          />
          <polygon
            points="54,50 80,64 80,92 54,106 28,92 28,64"
            fill="none"
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#wc-hex)" />
    </svg>
  )
}

export default function WorldcupHero({ locale }: { locale: 'es' | 'en' }) {
  const t = (k: string) => translate(k, { locale })
  return (
    <div
      className="relative overflow-hidden border-b-[2px] border-[var(--lt-ink)]"
      style={{
        background:
          'radial-gradient(ellipse 110% 90% at 50% -10%, #1e5c35 0%, #0d2a1a 50%, #071410 100%)',
        paddingTop: '3rem',
        paddingBottom: '4.5rem',
      }}
    >
      <HexPattern />

      {/* "2026" watermark */}
      <span
        aria-hidden="true"
        className="absolute font-black select-none pointer-events-none leading-none"
        style={{
          fontFamily: 'var(--lt-font-serif)',
          fontSize: 'clamp(90px, 19vw, 260px)',
          color: 'rgba(255,255,255,0.036)',
          top: '-16px',
          right: '-8px',
          letterSpacing: '-0.04em',
        }}
      >
        2026
      </span>

      {/* Stadium spotlight glow — top center */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '220px',
          background:
            'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(120,200,120,0.12) 0%, transparent 100%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4">
        <Link
          href="/deportes"
          className="mb-5 inline-flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--lt-font-sans)' }}
        >
          {t('sports.worldcup.back')}
        </Link>

        {/* Host countries strip */}
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium mb-5"
          style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--lt-font-sans)', letterSpacing: '0.04em' }}
        >
          <span>🇺🇸 Estados Unidos</span>
          <span aria-hidden="true">·</span>
          <span>🇨🇦 Canadá</span>
          <span aria-hidden="true">·</span>
          <span>🇲🇽 México</span>
        </div>

        <h1
          className="font-black mb-3 leading-none"
          style={{
            fontFamily: 'var(--lt-font-serif)',
            fontSize: 'clamp(2rem, 6vw, 3.75rem)',
            color: '#fff8ee',
            letterSpacing: '-0.02em',
          }}
        >
          {t('sports.worldcup.title')}
        </h1>

        <HandDrawnUnderline
          width={220}
          color="var(--lt-sun)"
          thickness={2.5}
          className="mb-4"
          aria-hidden="true"
        />

        <p
          className="text-sm max-w-md"
          style={{
            fontFamily: 'var(--lt-font-sans)',
            color: 'rgba(255,255,255,0.5)',
            lineHeight: 1.65,
          }}
        >
          {t('sports.worldcup.subtitle')}
        </p>
      </div>
    </div>
  )
}
