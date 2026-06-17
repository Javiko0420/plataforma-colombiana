'use client'

import { useState } from 'react'
import { adminDeleteEvent } from '@/app/(main)/admin/eventos/actions'
import { Trash2, ExternalLink, CalendarDays, Edit, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
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

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`
const chip = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 99,
  background: tint(color), color, fontSize: 11.5, fontWeight: 600,
})

export default function EventsAdminTable({ events }: { events: AdminEvent[] }) {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)

  const handleDelete = async (eventId: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas ELIMINAR el evento: "${title}"?\nEsta acción lo retirará inmediatamente del muro público.`)) return
    setLoadingActionId(`delete-${eventId}`)
    const res = await adminDeleteEvent(eventId)
    if (!res.success) alert(res.error)
    setLoadingActionId(null)
  }

  if (events.length === 0) {
    return (
      <div className="lh-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ color: 'var(--lh-fg2)', margin: 0 }}>No hay eventos registrados en el sistema.</p>
      </div>
    )
  }

  const now = new Date()

  return (
    <div className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="lh-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Organizador</th>
              <th>Fecha del evento</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {events.map((evt) => {
              const isPast = new Date(evt.eventDate) < now
              return (
                <tr key={evt.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="line-clamp-1" style={{ fontWeight: 600, color: 'var(--lh-fg)', maxWidth: 220 }}>{evt.title}</span>
                      <Link href={`/eventos/${evt.id}`} target="_blank" style={{ color: 'var(--lh-accent)', display: 'inline-flex' }}>
                        <ExternalLink size={15} />
                      </Link>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12, color: 'var(--lh-fg3)' }}>
                      <span>{categoryLabel(EVENT_CATEGORIES, evt.category)}</span>
                      <span style={{ opacity: 0.5 }}>·</span>
                      <span>{evt.location}</span>
                      <span style={{ opacity: 0.5 }}>·</span>
                      {evt.ticketPrice && evt.ticketPrice > 0 ? (
                        <span style={{ fontWeight: 600, color: 'var(--lh-warm)' }}>${evt.ticketPrice.toFixed(2)} AUD</span>
                      ) : (
                        <span style={{ fontWeight: 600, color: 'var(--lh-green)' }}>Gratis</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-fg)' }}>{evt.user.name || 'Sin nombre'}</div>
                    <div style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>{evt.user.email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--lh-fg)' }}>
                      <CalendarDays size={15} style={{ color: 'var(--lh-fg3)' }} />
                      {format(new Date(evt.eventDate), "d MMM, yyyy · HH:mm", { locale: es })}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {evt.isHidden ? (
                      <span style={chip('var(--lh-warm)')}><AlertTriangle size={12} /> Reportado</span>
                    ) : isPast ? (
                      <span style={{ ...chip('var(--lh-fg3)'), gap: 0 }}>Finalizado</span>
                    ) : (
                      <span style={{ ...chip('var(--lh-green)'), gap: 0 }}>Activo</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                      <Link href={`/perfil/eventos/editar/${evt.id}`} className="lh-btn lh-btn--sm lh-btn--secondary" title="Editar evento">
                        <Edit size={15} /> Editar
                      </Link>
                      <button type="button" onClick={() => handleDelete(evt.id, evt.title)} disabled={loadingActionId !== null} className="lh-btn lh-btn--sm" style={{ background: 'var(--lh-terra)', color: '#fff', opacity: loadingActionId !== null ? 0.6 : 1 }}>
                        <Trash2 size={15} /> {loadingActionId === `delete-${evt.id}` ? 'Borrando…' : 'Eliminar'}
                      </button>
                    </div>
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
