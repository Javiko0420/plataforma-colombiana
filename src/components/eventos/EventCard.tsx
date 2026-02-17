import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, MapPin } from 'lucide-react'
import type { Event } from '@prisma/client'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col h-full overflow-hidden group">
      {event.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full px-3 py-1 text-xs font-semibold">
            <CalendarDays className="w-3 h-3" />
            {format(new Date(event.eventDate), "d MMM, yyyy · HH:mm", { locale: es })}
          </span>
          <span className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full px-3 py-1 text-xs font-semibold">
            {event.category}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
          {event.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
          {event.description}
        </p>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <MapPin className="w-4 h-4" />
            {event.location}
          </span>
          <Link
            href={`/eventos/${event.id}`}
            className="inline-flex items-center px-5 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  )
}
