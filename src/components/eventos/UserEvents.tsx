'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { EVENT_CATEGORIES, categoryLabel } from '@/lib/constants/categories'
import { CalendarDays, Trash2, PlusCircle, Edit, MapPin } from 'lucide-react'
import { deleteEvent } from '@/app/(main)/eventos/actions'
import type { Event } from '@prisma/client'
import { EmptyState } from '@/components/lh/EmptyState'
import { Button } from '@/components/lh/Button'

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

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
      <EmptyState
        icon={<CalendarDays size={26} />}
        title="Aún no tienes eventos publicados"
        description="¿Tienes un evento próximo en tu ciudad? Publícalo y conecta con la comunidad."
        action={
          onCreateClick ? (
            <Button variant="primary" size="md" onClick={onCreateClick}>
              <PlusCircle size={18} /> Publicar mi primer evento
            </Button>
          ) : (
            <Button href="/perfil/eventos/crear" variant="primary" size="md">
              <PlusCircle size={18} /> Publicar mi primer evento
            </Button>
          )
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
          <div key={evt.id} className="lh-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', opacity: isPast ? 0.65 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <h4 className="line-clamp-2" style={{ fontFamily: 'var(--lh-font)', fontSize: 16, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--lh-fg)', margin: 0 }}>
                {evt.title}
              </h4>
              {isPast ? (
                <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: '5px 10px', borderRadius: 99, background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)', color: 'var(--lh-fg3)', fontSize: 12, fontWeight: 600 }}>
                  Finalizado
                </span>
              ) : (
                <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: tint('var(--lh-warm)'), color: 'var(--lh-warm)', fontSize: 12, fontWeight: 600 }}>
                  <CalendarDays size={12} aria-hidden="true" />
                  {format(new Date(evt.eventDate), "d MMM, yyyy · HH:mm", { locale: es })}
                </span>
              )}
            </div>

            <p className="line-clamp-2" style={{ fontSize: 13.5, color: 'var(--lh-fg2)', margin: '0 0 16px', flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={14} style={{ flexShrink: 0 }} aria-hidden="true" />
              {evt.location} · {categoryLabel(EVENT_CATEGORIES, evt.category)}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 14, borderTop: '1px solid var(--lh-border2)' }}>
              <Button href={`/perfil/eventos/editar/${evt.id}`} variant="secondary" size="sm">
                <Edit size={15} /> Editar
              </Button>
              <button
                type="button"
                className="lh-btn lh-btn--sm lh-btn--secondary"
                onClick={() => handleDelete(evt.id, evt.title)}
                disabled={isDeleting === evt.id}
                style={{ color: 'var(--lh-terra)', borderColor: 'color-mix(in oklch, var(--lh-terra) 35%, transparent)' }}
              >
                <Trash2 size={15} /> {isDeleting === evt.id ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
