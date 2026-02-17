import type { Event } from '@prisma/client'
import EventCard from './EventCard'
import { CalendarOff } from 'lucide-react'

export default function EventList({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white/50 dark:bg-gray-800/30">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-6">
          <CalendarOff className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          No se encontraron eventos
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
          No hay eventos próximos con estos filtros en este momento. Intenta con
          otros criterios de búsqueda o vuelve más tarde.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
