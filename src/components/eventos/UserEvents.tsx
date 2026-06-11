'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { EVENT_CATEGORIES, categoryLabel } from '@/lib/constants/categories'
import {
  CalendarDays,
  Trash2,
  PlusCircle,
  Edit,
  MapPin,
} from 'lucide-react'
import { deleteEvent } from '@/app/(main)/eventos/actions'
import type { Event } from '@prisma/client'
import { LtEmptyState, LtPanel, LtButton, LtBadge } from '@/components/lt'

export default function UserEvents({
  initialEvents,
  onCreateClick,
}: {
  initialEvents: Event[]
  onCreateClick?: () => void
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
      <LtEmptyState
        title="Aún no tienes eventos publicados"
        description="¿Tienes un evento próximo en tu ciudad? Publícalo y conecta con la comunidad."
        icon={<CalendarDays className="w-12 h-12" style={{ color: 'var(--lt-ink-soft)' }} />}
        action={
          <LtButton
            variant="sticker"
            tone="sun"
            size="md"
            rotate={-1}
            iconLeft={<PlusCircle className="w-5 h-5" />}
            onClick={onCreateClick}
          >
            Publicar mi primer evento
          </LtButton>
        }
      />
    )
  }

  const now = new Date()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {events.map((evt) => {
        const isPast = new Date(evt.eventDate) < now

        return (
          <LtPanel
            key={evt.id}
            tone="bg"
            shadow="sm"
            className={`p-5 flex flex-col ${isPast ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between items-start mb-3 gap-3">
              <h4
                className="font-bold line-clamp-2"
                style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
              >
                {evt.title}
              </h4>
              {isPast ? (
                <LtBadge tone="paper" rotate={0}>Finalizado</LtBadge>
              ) : (
                <LtBadge tone="verde" rotate={1}>
                  <CalendarDays className="w-3 h-3" aria-hidden="true" />
                  {format(new Date(evt.eventDate), "d MMM, yyyy · HH:mm", { locale: es })}
                </LtBadge>
              )}
            </div>

            <p className="text-sm mb-4 line-clamp-2 flex-grow" style={{ color: 'var(--lt-ink-soft)' }}>
              <MapPin className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />
              {evt.location} · {categoryLabel(EVENT_CATEGORIES, evt.category)}
            </p>

            <div className="pt-4 border-t-[1.6px] border-[var(--lt-ink)]/20 mt-auto flex justify-end gap-2">
              <Link href={`/perfil/eventos/editar/${evt.id}`}>
                <LtButton variant="outline" tone="paper" size="sm" iconLeft={<Edit className="w-4 h-4" />}>
                  Editar
                </LtButton>
              </Link>
              <LtButton
                variant="outline"
                tone="paper"
                size="sm"
                iconLeft={<Trash2 className="w-4 h-4" />}
                onClick={() => handleDelete(evt.id, evt.title)}
                disabled={isDeleting === evt.id}
                className="!text-[var(--lt-terracota)] !border-[var(--lt-terracota)]"
              >
                {isDeleting === evt.id ? 'Eliminando...' : 'Eliminar'}
              </LtButton>
            </div>
          </LtPanel>
        )
      })}
    </div>
  )
}
