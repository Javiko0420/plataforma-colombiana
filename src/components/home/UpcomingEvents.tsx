'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { MapPin, CalendarDays } from 'lucide-react'
import { EVENT_CATEGORIES, categoryLabel } from '@/lib/constants/categories'

/* Solo los campos que la vitrina necesita; evitamos arrastrar @prisma/client
   al bundle cliente (mismo criterio que FeaturedBusinesses / RecentJobs). */
interface UpcomingEvent {
  id: string
  title: string
  category: string
  eventDate: string // ISO string desde el JSON de la API
  location: string
  imageUrl: string | null
}

/* Gradientes del mock: preservan el look "poster" cuando el evento no tiene foto. */
const EVENT_GRADIENTS = [
  'linear-gradient(160deg,#2E5E8C,#1a3a57)',
  'linear-gradient(160deg,#D8775F,#b8543c)',
  'linear-gradient(160deg,#5C8A6B,#3f6b4d)',
]

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))',
  gap: 18,
}

/* ─── Sección completa: hace fetch y resuelve estados ─── */
export function UpcomingEvents() {
  const [events, setEvents] = useState<UpcomingEvent[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/events/upcoming?limit=3')
      .then(res => res.json())
      .then(json => {
        if (!active) return
        if (json?.success && Array.isArray(json.data)) setEvents(json.data)
        else setError(true)
      })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  // Carga
  if (events === null && !error) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  // Error de red / API
  if (error) {
    return (
      <p style={{ fontSize: 14.5, color: 'var(--lh-fg2)', padding: '8px 2px' }}>
        No pudimos cargar los eventos en este momento. Intenta recargar la página.
      </p>
    )
  }

  // Vacío (aún no hay eventos próximos)
  if (!events || events.length === 0) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center', borderRadius: 20, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)' }}>
        <CalendarDays size={30} style={{ color: 'var(--lh-fg3)', opacity: 0.5 }} aria-hidden="true" />
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--lh-fg)', margin: '12px 0 4px' }}>
          Todavía no hay eventos próximos
        </p>
        <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '0 0 18px' }}>
          Publica tu evento y reúne a la comunidad latina.
        </p>
        <Link
          href="/perfil/eventos/crear"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12, background: 'var(--lh-accent)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}
        >
          Crea un evento
        </Link>
      </div>
    )
  }

  return (
    <div style={gridStyle}>
      {events.map((event, i) => <EventPosterCard key={event.id} event={event} index={i} />)}
    </div>
  )
}

/* ─── Tarjeta "poster" de evento próximo ─── */
function EventPosterCard({ event, index }: { event: UpcomingEvent; index: number }) {
  const date = new Date(event.eventDate)
  const day = format(date, 'dd', { locale: es })
  const month = format(date, 'MMM', { locale: es }).toUpperCase()
  const hasImage = Boolean(event.imageUrl)
  const fallback = EVENT_GRADIENTS[index % EVENT_GRADIENTS.length]

  return (
    <Link href={`/eventos/${event.id}`} style={{ textDecoration: 'none' }}>
      <article
        style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: hasImage ? 'var(--lh-surface2)' : fallback, minHeight: 280, display: 'flex', boxShadow: 'var(--lh-shadow)', transition: '.26s cubic-bezier(.22,.61,.36,1)', cursor: 'pointer' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
      >
        {hasImage && (
          <>
            <Image
              src={event.imageUrl as string}
              alt={event.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 1024px) 100vw, 33vw"
            />
            {/* Overlay para legibilidad del texto blanco sobre la foto */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.62) 0%, rgba(0,0,0,.12) 45%, rgba(0,0,0,.34) 100%)' }} />
          </>
        )}

        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 20 }}>
          {/* Fecha + categoría */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 56, padding: '9px 0', borderRadius: 13, background: 'rgba(255,255,255,.92)', color: '#181B21', boxShadow: '0 8px 20px -8px rgba(0,0,0,.4)' }}>
              <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing: '-.02em' }}>{day}</span>
              <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#5C616D', marginTop: 2 }}>{month}</span>
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: '#fff', background: 'rgba(0,0,0,.32)', backdropFilter: 'blur(6px)', padding: '5px 11px', borderRadius: 99 }}>
              {categoryLabel(EVENT_CATEGORIES, event.category)}
            </span>
          </div>

          {/* Título + ubicación */}
          <div style={{ color: '#fff', textShadow: '0 1px 14px rgba(0,0,0,.4)' }}>
            <h3 className="line-clamp-2" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.015em', margin: '0 0 7px', lineHeight: 1.15, fontFamily: 'var(--lh-font)' }}>
              {event.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, opacity: .95 }}>
              <MapPin size={14} style={{ flexShrink: 0 }} aria-hidden="true" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

/* ─── Skeleton de carga (misma forma de tarjeta) ─── */
function SkeletonCard() {
  return (
    <div aria-hidden="true" style={{ borderRadius: 20, minHeight: 280, background: 'var(--lh-surface2)', border: '1px solid var(--lh-border)' }} />
  )
}
