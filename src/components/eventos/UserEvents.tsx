'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CalendarDays,
  Trash2,
  PlusCircle,
  Edit,
  MapPin,
} from 'lucide-react'
import { deleteEvent } from '@/app/eventos/actions'
import type { Event } from '@prisma/client'

export default function UserEvents({
  initialEvents,
}: {
  initialEvents: Event[]
}) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (eventId: string, eventTitle: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el evento "${eventTitle}"?\n\nEsta acción lo quitará inmediatamente del muro público.`
    )

    if (!confirmed) return

    setIsDeleting(eventId)

    const response = await deleteEvent(eventId)

    if (!response.success) {
      alert(`Error: ${response.error}`)
    } else {
      setEvents((prev) => prev.filter((evt) => evt.id !== eventId))
    }

    setIsDeleting(null)
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
        <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Aún no tienes eventos publicados
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto text-sm">
          ¿Tienes un evento próximo en tu ciudad? Publícalo y conecta con la
          comunidad.
        </p>
        <Link
          href="/perfil/eventos/crear"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold px-6 py-2.5 hover:from-yellow-600 hover:to-red-600 transition-all shadow-md"
        >
          <PlusCircle className="w-5 h-5" />
          Publicar mi primer evento
        </Link>
      </div>
    )
  }

  const now = new Date()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map((evt) => {
        const isPast = new Date(evt.eventDate) < now

        return (
          <div
            key={evt.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-md transition-shadow ${
              isPast ? 'opacity-60' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-3 gap-3">
              <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2">
                {evt.title}
              </h4>
              {isPast ? (
                <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                  Finalizado
                </span>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                  <CalendarDays className="w-3 h-3" />
                  {format(new Date(evt.eventDate), "d MMM, yyyy · HH:mm", {
                    locale: es,
                  })}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-grow">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />
              {evt.location} · {evt.category}
            </p>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto flex justify-end gap-2">
              <Link
                href={`/perfil/eventos/editar/${evt.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200 dark:border-blue-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
              >
                <Edit className="w-4 h-4" /> Editar
              </Link>
              <button
                onClick={() => handleDelete(evt.id, evt.title)}
                disabled={isDeleting === evt.id}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50"
              >
                {isDeleting === evt.id ? (
                  'Eliminando...'
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
