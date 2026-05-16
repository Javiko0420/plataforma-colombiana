import Link from 'next/link'
import { SunMotif } from '@/components/lt/SunMotif'
import { LtButton } from '@/components/lt/Button'
import { SouthernCross } from '@/components/lt/SouthernCross'
import { Squiggle } from '@/components/lt/Squiggle'

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen px-4 text-center"
      style={{ background: 'var(--lt-bg)' }}
    >
      {/* Decoración */}
      <div className="relative mb-6" aria-hidden="true">
        <SunMotif size={96} className="mx-auto" />
        <div className="absolute -top-2 -right-2">
          <SouthernCross size={32} color="var(--lt-terracota)" />
        </div>
      </div>

      {/* 404 display */}
      <div className="mb-2">
        <span
          className="text-8xl font-black leading-none"
          style={{
            fontFamily: 'var(--lt-font-serif)',
            color: 'var(--lt-terracota)',
            textShadow: '4px 4px 0 var(--lt-ink)',
          }}
          aria-hidden="true"
        >
          404
        </span>
      </div>

      <Squiggle width={160} height={12} color="var(--lt-sun-core)" amplitude={4} className="mx-auto mb-6" aria-hidden="true" />

      <h1
        className="text-2xl font-bold mb-2"
        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
      >
        ¡Ey, esta página no existe!
      </h1>
      <p
        className="text-base mb-8 max-w-sm"
        style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
      >
        Puede que el enlace esté roto o que la página haya sido movida. ¡Pero no te preocupes, hay mucho más por explorar!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link href="/">
          <LtButton variant="sticker" tone="terracota" size="md" rotate={-1}>
            Volver al inicio
          </LtButton>
        </Link>
        <Link href="/directorio">
          <LtButton variant="outline" tone="ink" size="md" rotate={1}>
            Ver el Directorio
          </LtButton>
        </Link>
      </div>
    </div>
  )
}
