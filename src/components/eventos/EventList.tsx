import type { Event } from '@prisma/client'
import EventCard from './EventCard'
import { CalendarDays } from 'lucide-react'
import { Reveal } from '@/components/lh/Reveal'
import { EmptyState } from '@/components/lh/EmptyState'
import { Button } from '@/components/lh/Button'

export default function EventList({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays size={26} />}
        title="No se encontraron eventos"
        description="No hay eventos próximos con estos filtros en este momento. Intenta con otros criterios o vuelve más tarde."
        action={
          <Button href="/perfil/eventos/crear" variant="primary" size="md">
            Crear un evento
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-max">
      {events.map((event, i) => (
        <Reveal key={event.id} delay={Math.min(i * 40, 240)}>
          <EventCard event={event} />
        </Reveal>
      ))}
    </div>
  )
}
