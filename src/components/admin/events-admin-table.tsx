'use client'

import { useState } from 'react'
import { adminDeleteEvent } from '@/app/admin/eventos/actions'
import { Trash2, ExternalLink, CalendarDays, Edit, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type AdminEvent = {
  id: string
  title: string
  category: string
  eventDate: Date
  location: string
  ticketPrice: number | null
  isHidden: boolean
  createdAt: Date
  user: {
    name: string | null
    email: string
  }
}

export default function EventsAdminTable({
  events,
}: {
  events: AdminEvent[]
}) {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)

  const handleDelete = async (eventId: string, title: string) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas ELIMINAR el evento: "${title}"?\nEsta acción lo retirará inmediatamente del muro público.`
      )
    )
      return

    setLoadingActionId(`delete-${eventId}`)
    const res = await adminDeleteEvent(eventId)
    if (!res.success) alert(res.error)
    setLoadingActionId(null)
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400">
          No hay eventos registrados en el sistema.
        </p>
      </div>
    )
  }

  const now = new Date()

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3">Evento</th>
              <th className="px-6 py-3">Organizador</th>
              <th className="px-6 py-3">Fecha del Evento</th>
              <th className="px-6 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {events.map((evt) => {
              const isPast = new Date(evt.eventDate) < now

              return (
                <tr
                  key={evt.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  {/* Evento */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white line-clamp-1 max-w-[220px]">
                        {evt.title}
                      </span>
                      <Link
                        href={`/eventos/${evt.id}`}
                        target="_blank"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {evt.category}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {evt.location}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      {evt.ticketPrice && evt.ticketPrice > 0 ? (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          ${evt.ticketPrice.toFixed(2)} AUD
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Gratis
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Organizador */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {evt.user.name || 'Sin nombre'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {evt.user.email}
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      {format(new Date(evt.eventDate), "d MMM, yyyy · HH:mm", {
                        locale: es,
                      })}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 text-center">
                    {evt.isHidden ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                        <AlertTriangle className="w-3 h-3" />
                        Reportado
                      </span>
                    ) : isPast ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        Finalizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                        Activo
                      </span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/perfil/eventos/editar/${evt.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors"
                      title="Editar evento"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(evt.id, evt.title)}
                      disabled={loadingActionId !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-md transition-colors disabled:opacity-50"
                      title="Eliminar evento"
                    >
                      <Trash2 className="w-4 h-4" />
                      {loadingActionId === `delete-${evt.id}`
                        ? 'Borrando...'
                        : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
