import { prisma } from '@/lib/prisma'
import EventFilters from '@/components/eventos/EventFilters'
import EventList from '@/components/eventos/EventList'
import { Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/lh/PageHeader'

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
    // Cap defensivo + solo los campos que renderiza EventCard.
    take: 60,
    select: {
      id: true,
      title: true,
      category: true,
      imageUrl: true,
      eventDate: true,
      ticketPrice: true,
      description: true,
      location: true,
    },
  })

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', paddingBottom: '4rem', fontFamily: 'var(--lh-font)' }}>

      <PageHeader
        eyebrow="Agenda cultural"
        title="Descubre eventos"
        subtitle="Conciertos, teatro, comedia y mucho más, organizado por y para nuestra gente."
        accent="var(--lh-warm)"
      />

      <main className="lh-container" style={{ paddingTop: 40 }}>

        {/* ── Banner informativo ── */}
        <div
          role="note"
          aria-label="Aviso sobre eventos de la comunidad"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            padding: '16px 18px', marginBottom: 28, borderRadius: 16,
            background: 'color-mix(in oklch, var(--lh-warm) 9%, var(--lh-surface))',
            border: '1px solid color-mix(in oklch, var(--lh-warm) 24%, transparent)',
          }}
        >
          <span
            aria-hidden="true"
            style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--lh-warm)', color: '#3a2c0a' }}
          >
            <Sparkles size={20} />
          </span>
          <div>
            <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 15, fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 3px' }}>
              Vive la cultura de tu ciudad
            </h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0 }}>
              Aquí encontrarás los próximos eventos publicados por nuestra comunidad. Los eventos pasados se archivan automáticamente para mantenerte al día.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <EventFilters />

        {/* Resultados */}
        <div style={{ marginTop: 32 }}>
          <EventList events={eventos} />
        </div>
      </main>
    </div>
  )
}
