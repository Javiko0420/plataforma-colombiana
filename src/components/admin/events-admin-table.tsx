'use client'

import { useState } from 'react'
import { adminDeleteEvent } from '@/app/(main)/admin/eventos/actions'
import { Trash2, ExternalLink, CalendarDays, Edit, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { LtPanel, LtBadge, LtButton } from '@/components/lt'
import { EVENT_CATEGORIES, categoryLabel } from '@/lib/constants/categories'

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
      <LtPanel className="text-center py-12" shadow="sm">
        <p className="text-[var(--lt-ink-soft)]">
          No hay eventos registrados en el sistema.
        </p>
      </LtPanel>
    )
  }

  const now = new Date()

  return (
    <LtPanel className="overflow-hidden p-0" shadow="md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--lt-bg)] text-[var(--lt-ink-soft)] font-medium border-b-[2.2px] border-[var(--lt-ink)]">
            <tr>
              <th className="px-6 py-3">Evento</th>
              <th className="px-6 py-3">Organizador</th>
              <th className="px-6 py-3">Fecha del Evento</th>
              <th className="px-6 py-3 text-center">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y-[2px] divide-[var(--lt-ink)]/15">
            {events.map((evt) => {
              const isPast = new Date(evt.eventDate) < now

              return (
                <tr
                  key={evt.id}
                  className="hover:bg-[var(--lt-bg)] transition-colors"
                >
                  {/* Evento */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--lt-ink)] line-clamp-1 max-w-[220px]">
                        {evt.title}
                      </span>
                      <Link
                        href={`/eventos/${evt.id}`}
                        target="_blank"
                        className="text-[var(--lt-accent)] hover:text-[var(--lt-terracota)]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--lt-ink-soft)]">
                        {categoryLabel(EVENT_CATEGORIES, evt.category)}
                      </span>
                      <span className="text-xs text-[var(--lt-ink-soft)] opacity-50">·</span>
                      <span className="text-xs text-[var(--lt-ink-soft)]">
                        {evt.location}
                      </span>
                      <span className="text-xs text-[var(--lt-ink-soft)] opacity-50">·</span>
                      {evt.ticketPrice && evt.ticketPrice > 0 ? (
                        <span className="text-xs font-medium text-[var(--lt-accent)]">
                          ${evt.ticketPrice.toFixed(2)} AUD
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-[var(--lt-verde)]">
                          Gratis
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Organizador */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[var(--lt-ink)]">
                      {evt.user.name || 'Sin nombre'}
                    </div>
                    <div className="text-xs text-[var(--lt-ink-soft)]">
                      {evt.user.email}
                    </div>
                  </td>

                  {/* Fecha */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[var(--lt-ink)]">
                      <CalendarDays className="w-4 h-4 text-[var(--lt-ink-soft)]" />
                      {format(new Date(evt.eventDate), "d MMM, yyyy · HH:mm", {
                        locale: es,
                      })}
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 text-center">
                    {evt.isHidden ? (
                      <LtBadge tone="sun" className="inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Reportado
                      </LtBadge>
                    ) : isPast ? (
                      <LtBadge tone="neutral">Finalizado</LtBadge>
                    ) : (
                      <LtBadge tone="verde">Activo</LtBadge>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/perfil/eventos/editar/${evt.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-[var(--lt-ink)] text-[var(--lt-ink)] bg-[var(--lt-paper)] hover:bg-[var(--lt-bg)] rounded-[var(--lt-radius-sm)] transition-colors text-sm font-medium"
                      title="Editar evento"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>
                    <LtButton
                      variant="sticker"
                      tone="terracota"
                      size="sm"
                      onClick={() => handleDelete(evt.id, evt.title)}
                      disabled={loadingActionId !== null}
                      loading={loadingActionId === `delete-${evt.id}`}
                      loadingText="Borrando..."
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </LtButton>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </LtPanel>
  )
}
