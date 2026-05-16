import { prisma } from '@/lib/prisma'
import EventFilters from '@/components/eventos/EventFilters'
import EventList from '@/components/eventos/EventList'
import { Sparkles } from 'lucide-react'
import { SunMotif } from '@/components/lt/SunMotif'
import { LeafSprig } from '@/components/lt/LeafSprig'
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline'

export const dynamic = 'force-dynamic'

export default async function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  const category = resolvedParams.category || ''

  const eventos = await prisma.event.findMany({
    where: {
      eventDate: { gte: new Date() },
      isHidden: false,
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      }),
      ...(category && { category }),
    },
    orderBy: { eventDate: 'asc' },
  })

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh', paddingBottom: '4rem' }}>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden border-b-[2px] border-[var(--lt-ink)] py-16 px-4"
        style={{ background: 'var(--lt-paper)' }}
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
          <SunMotif size={300} className="absolute opacity-[0.07]" style={{ top: '-50px', right: '-30px' }} />
          <LeafSprig size={100} className="absolute opacity-20" style={{ bottom: '10px', left: '16px', transform: 'rotate(-18deg)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center space-y-4">
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Descubre{' '}
            <em style={{ color: 'var(--lt-terracota)', fontStyle: 'italic' }}>Eventos</em>
          </h1>
          <div className="flex justify-center" aria-hidden="true">
            <HandDrawnUnderline width={220} color="var(--lt-sun-core)" thickness={3} />
          </div>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            Conciertos, teatro, comedia y mucho más, organizado por y para nuestra gente.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

        {/* ── Banner informativo ── */}
        <div
          className="mb-8 flex items-start sm:items-center gap-4 p-5 rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)]"
          style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
          role="note"
          aria-label="Aviso sobre eventos de la comunidad"
        >
          <div
            className="p-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0"
            style={{ background: 'var(--lt-sun)', color: 'var(--lt-ink)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
            aria-hidden="true"
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3
              className="font-bold text-sm md:text-base mb-1"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              ¡Vive la cultura de tu ciudad!
            </h3>
            <p className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
              Aquí encontrarás los próximos eventos publicados por nuestra comunidad. Los eventos pasados se archivan automáticamente para mantenerte siempre al día.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <EventFilters />

        {/* Resultados */}
        <div className="mt-10">
          <EventList events={eventos} />
        </div>
      </main>
    </div>
  )
}
