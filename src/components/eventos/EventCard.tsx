import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react'
import type { Event } from '@prisma/client'
import { EVENT_CATEGORIES, categoryLabel } from '@/lib/constants/categories'

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

const neutralChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  fontSize: 12, fontWeight: 600, color: 'var(--lh-fg2)',
  background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)',
  padding: '5px 10px', borderRadius: 99,
}

interface EventCardProps {
  event: Event
  index?: number
}

function categoryGradient(category: string): string {
  if (['CONCIERTO', 'FESTIVAL', 'FIESTA'].includes(category)) return 'linear-gradient(160deg,var(--lh-terra),#b8543c)'
  if (category === 'DEPORTES') return 'linear-gradient(160deg,var(--lh-green),#3f6b4d)'
  return 'linear-gradient(160deg,var(--lh-accent),var(--lh-accent-ink))'
}

export default function EventCard({ event }: EventCardProps) {
  const isFree = !event.ticketPrice || event.ticketPrice <= 0

  return (
    <Link href={`/eventos/${event.id}`} className="block group" aria-label={`Ver detalles de ${event.title}`} style={{ height: '100%' }}>
      <article className="lh-card lh-card--interactive" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header: imagen o gradiente */}
        <div style={{ position: 'relative', height: 160, overflow: 'hidden', background: event.imageUrl ? 'var(--lh-surface2)' : categoryGradient(event.category), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="group-hover:scale-105"
              style={{ objectFit: 'cover', transition: 'transform .4s cubic-bezier(.22,.61,.36,1)' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <CalendarDays size={44} style={{ color: 'rgba(255,255,255,.85)' }} aria-hidden="true" />
          )}
        </div>

        {/* Cuerpo */}
        <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ ...neutralChip, color: 'var(--lh-warm)', background: tint('var(--lh-warm)'), border: 'none' }}>
              <CalendarDays size={12} aria-hidden="true" />
              {format(new Date(event.eventDate), "d MMM · HH:mm", { locale: es })}
            </span>
            <span style={neutralChip}>{categoryLabel(EVENT_CATEGORIES, event.category)}</span>
            {isFree ? (
              <span style={{ ...neutralChip, color: 'var(--lh-green)', background: tint('var(--lh-green)'), border: 'none' }}>Gratis</span>
            ) : (
              <span style={{ ...neutralChip, color: 'var(--lh-warm)', background: tint('var(--lh-warm)'), border: 'none' }}>${event.ticketPrice!.toFixed(2)} AUD</span>
            )}
          </div>

          <h3 className="line-clamp-2" style={{ fontFamily: 'var(--lh-font)', fontSize: 17.5, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: 0, lineHeight: 1.25 }}>
            {event.title}
          </h3>

          <p className="line-clamp-3" style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0, flex: 1 }}>
            {event.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingTop: 14, borderTop: '1px solid var(--lh-border2)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--lh-fg2)', minWidth: 0 }}>
              <MapPin size={14} style={{ flexShrink: 0 }} aria-hidden="true" />
              <span className="line-clamp-1">{event.location}</span>
            </span>
            <span className="lh-seemore" style={{ fontSize: 13.5, color: 'var(--lh-warm)', flexShrink: 0 }}>
              Ver detalles <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
