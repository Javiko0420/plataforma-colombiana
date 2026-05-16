import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, MapPin } from 'lucide-react'
import type { Event } from '@prisma/client'
import { LtBadge } from '@/components/lt/Badge'

const CARD_ROTATIONS = [-1.5, 1.2, -0.8, 1.5, -1.2, 0.9, -1.4, 1.1]

interface EventCardProps {
  event: Event
  index?: number
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  const rotation = CARD_ROTATIONS[index % CARD_ROTATIONS.length]

  const dateTone = ['Concierto', 'Festival', 'Fiesta'].includes(event.category)
    ? 'terracota'
    : event.category === 'Deportes'
    ? 'verde'
    : 'sun'

  return (
    <article
      className="group flex flex-col h-full rounded-[var(--lt-radius-md)] border-[2.2px] border-[var(--lt-ink)] overflow-hidden transition-all duration-200 hover:-translate-y-1"
      style={{
        background: 'var(--lt-paper)',
        boxShadow: 'var(--lt-shadow-sticker-lg)',
        transform: `rotate(${rotation}deg)`,
      }}
      data-lt-rotate="true"
    >
      {event.imageUrl && (
        <div className="relative w-full h-48 overflow-hidden border-b-[2px] border-[var(--lt-ink)]">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <LtBadge tone={dateTone as 'terracota' | 'verde' | 'sun'} rotate={-1}>
            <CalendarDays className="w-3 h-3" aria-hidden="true" />
            {format(new Date(event.eventDate), "d MMM · HH:mm", { locale: es })}
          </LtBadge>
          <LtBadge tone="neutral" rotate={1}>{event.category}</LtBadge>
          {event.ticketPrice && event.ticketPrice > 0 ? (
            <LtBadge tone="sun" rotate={-0.5}>${event.ticketPrice.toFixed(2)} AUD</LtBadge>
          ) : (
            <LtBadge tone="verde" rotate={0.8}>Gratis</LtBadge>
          )}
        </div>

        <h3
          className="text-lg font-bold line-clamp-2 group-hover:text-[var(--lt-terracota)] transition-colors"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          {event.title}
        </h3>

        <p
          className="text-sm leading-relaxed line-clamp-3 flex-grow"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          {event.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t-[1.6px] border-[var(--lt-ink)]/20">
          <span
            className="inline-flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--lt-ink-soft)' }}
          >
            <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--lt-terracota)' }} aria-hidden="true" />
            <span className="line-clamp-1">{event.location}</span>
          </span>
          <Link
            href={`/eventos/${event.id}`}
            className="text-xs font-bold px-3 py-1.5 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] transition-all group-hover:-translate-y-0.5"
            style={{
              background: 'var(--lt-terracota)',
              color: 'var(--lt-paper)',
              boxShadow: 'var(--lt-shadow-sticker)',
            }}
            aria-label={`Ver detalles de ${event.title}`}
          >
            Ver detalles →
          </Link>
        </div>
      </div>
    </article>
  )
}
