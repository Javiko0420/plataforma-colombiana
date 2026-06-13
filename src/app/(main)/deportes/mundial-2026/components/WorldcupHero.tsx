import Link from 'next/link'
import { SunMotif } from '@/components/lt/SunMotif'
import { LeafSprig } from '@/components/lt/LeafSprig'
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline'
import { translate } from '@/lib/i18n'

export default function WorldcupHero({ locale }: { locale: 'es' | 'en' }) {
  const t = (k: string) => translate(k, { locale })
  return (
    <div
      className="relative overflow-hidden border-b-[2px] border-[var(--lt-ink)] py-14 px-4"
      style={{ background: 'var(--lt-paper)' }}
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
        <SunMotif
          size={280}
          className="absolute opacity-[0.07]"
          style={{ top: '-40px', right: '-20px' }}
        />
        <LeafSprig
          size={90}
          className="absolute opacity-20"
          style={{ bottom: '8px', left: '12px', transform: 'rotate(-18deg)' }}
        />
      </div>
      <div className="relative max-w-5xl mx-auto">
        <Link
          href="/deportes"
          className="text-sm mb-4 inline-block hover:underline"
          style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
        >
          {t('sports.worldcup.back')}
        </Link>
        <h1
          className="text-3xl md:text-4xl font-black mb-2"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          {t('sports.worldcup.title')}
        </h1>
        <HandDrawnUnderline
          width={200}
          color="var(--lt-sun-core)"
          thickness={2.5}
          className="mb-3"
          aria-hidden="true"
        />
        <p
          className="text-sm"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          {t('sports.worldcup.subtitle')}
        </p>
      </div>
    </div>
  )
}
