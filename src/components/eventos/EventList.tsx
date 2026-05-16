import type { Event } from '@prisma/client'
import EventCard from './EventCard'
import Link from 'next/link'
import { SunMotif } from '@/components/lt/SunMotif'
import { LtButton } from '@/components/lt/Button'

export default function EventList({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-[var(--lt-radius-lg)] border-[2px] border-dashed border-[var(--lt-ink)]"
        style={{ background: 'var(--lt-paper)' }}
      >
        <div aria-hidden="true" className="mb-5 opacity-30">
          <SunMotif size={72} />
        </div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          No se encontraron eventos
        </h3>
        <p
          className="text-sm max-w-md mx-auto mb-6"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          No hay eventos próximos con estos filtros en este momento. Intenta con otros criterios o vuelve más tarde.
        </p>
        <Link href="/perfil/eventos/crear">
          <LtButton variant="sticker" tone="terracota" size="md" rotate={-1}>
            Crear un evento
          </LtButton>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-max">
      {events.map((event, i) => (
        <EventCard key={event.id} event={event} index={i} />
      ))}
    </div>
  )
}
