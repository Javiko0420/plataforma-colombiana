// src/app/directorio/page.tsx
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import DirectoryClient from './directory-client'
import { SunMotif } from '@/components/lt/SunMotif'
import { LeafSprig } from '@/components/lt/LeafSprig'
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline'

export const metadata: Metadata = {
  title: 'Directorio Latino | Latin Territory',
  description: 'Encuentra servicios, restaurantes y profesionales latinos en Australia.',
}

export const revalidate = 3600

export default async function DirectorioPage() {
  const businesses = await prisma.business.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      website: true,
      whatsapp: true,
      instagram: true,
      images: true,
      isVerified: true,
    }
  })

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh' }}>
      {/* ── Header Hero ── */}
      <div
        className="relative overflow-hidden border-b-[2px] border-[var(--lt-ink)] py-20"
        style={{ background: 'var(--lt-paper)' }}
      >
        {/* Decoraciones */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <SunMotif size={320} className="absolute opacity-[0.07]" style={{ top: '-60px', right: '-40px' }} />
          <LeafSprig size={120} className="absolute opacity-20" style={{ bottom: '10px', left: '24px', transform: 'rotate(-20deg)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className="text-4xl md:text-5xl font-black mb-3"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Directorio <em style={{ color: 'var(--lt-terracota)', fontStyle: 'italic' }}>Latino</em>
          </h1>
          <div className="flex justify-center mb-5" aria-hidden="true">
            <HandDrawnUnderline width={240} color="var(--lt-sun-core)" thickness={3} />
          </div>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            Conecta con el talento de nuestra comunidad. Desde gastronomía hasta servicios profesionales en todo Australia.
          </p>
        </div>
      </div>

      <DirectoryClient initialBusinesses={businesses} />
    </div>
  )
}
