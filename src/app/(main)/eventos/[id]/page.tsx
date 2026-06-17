import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EVENT_CATEGORIES, categoryLabel } from '@/lib/constants/categories'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CalendarDays, MapPin, Tag, UserCircle,
  Ticket, Info, ArrowLeft, AlertTriangle,
} from 'lucide-react'
import ShareButton from '@/components/ui/share-button'
import ReportEventButton from '@/components/eventos/ReportEventButton'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasUserReportedEvent } from '@/app/(main)/eventos/actions'
import Link from 'next/link'

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

const neutralChip: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontSize: 12.5, fontWeight: 600, color: 'var(--lh-fg2)',
  background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)',
  padding: '6px 11px', borderRadius: 99,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })

  if (!event) {
    return {
      title: 'Evento no encontrado | Latin Territory',
      description: 'Este evento ya no se encuentra disponible en nuestra plataforma.',
    }
  }

  const shortDescription =
    event.description.length > 150
      ? `${event.description.substring(0, 150)}...`
      : event.description

  const pageTitle = `${event.title} | Eventos · Latin Territory`

  return {
    title: pageTitle,
    description: shortDescription,
    openGraph: {
      title: pageTitle,
      description: shortDescription,
      ...(event.imageUrl && { images: [event.imageUrl] }),
      siteName: 'Latin Territory',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: event.imageUrl ? 'summary_large_image' : 'summary',
      title: pageTitle,
      description: shortDescription,
    },
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [event, session] = await Promise.all([
    prisma.event.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    }),
    getServerSession(authOptions),
  ])

  if (!event) notFound()

  if (event.isHidden) {
    const userRole = session?.user?.role ?? 'USER'
    const isOwner = session?.user?.id === event.userId
    const isPrivileged = userRole === 'ADMIN' || userRole === 'MODERATOR'
    if (!isOwner && !isPrivileged) notFound()
  }

  const isOwner = session?.user?.id === event.userId
  const alreadyReported = session?.user
    ? await hasUserReportedEvent(event.id)
    : false

  const formattedDate = format(
    new Date(event.eventDate),
    "EEEE d 'de' MMMM, yyyy",
    { locale: es }
  )
  const formattedTime = format(new Date(event.eventDate), 'HH:mm', { locale: es })
  const postedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(event.createdAt))

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', paddingBottom: '5rem', paddingTop: '2rem', fontFamily: 'var(--lh-font)' }}>
      <div className="lh-container" style={{ maxWidth: 1100 }}>

        {/* Botón volver */}
        <Link href="/eventos" className="lh-btn lh-btn--sm lh-btn--secondary" style={{ marginBottom: 28 }}>
          <ArrowLeft size={16} aria-hidden="true" /> Eventos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Columna principal ── */}
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Banner evento oculto */}
            {event.isHidden && (
              <div
                role="alert"
                style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: '16px 18px', borderRadius: 16, background: 'color-mix(in oklch, var(--lh-terra) 12%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)' }}
              >
                <AlertTriangle size={18} style={{ color: 'var(--lh-terra)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <div>
                  <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 14.5, fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 3px' }}>
                    Evento oculto por reportes de la comunidad
                  </h3>
                  <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0 }}>
                    Este evento ha sido ocultado automáticamente y se encuentra en revisión por el equipo de moderación.
                  </p>
                </div>
              </div>
            )}

            {/* Imagen del evento */}
            {event.imageUrl && (
              <div style={{ position: 'relative', width: '100%', height: 'clamp(220px,40vw,384px)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--lh-border)' }}>
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
            )}

            {/* Card principal */}
            <div className="lh-card" style={{ padding: 'clamp(22px,4vw,32px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span
                  aria-hidden="true"
                  style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tint('var(--lh-warm)'), color: 'var(--lh-warm)' }}
                >
                  <CalendarDays size={26} />
                </span>
                <h1 className="lh-h2" style={{ fontSize: 'clamp(24px,3.4vw,34px)', margin: 0 }}>{event.title}</h1>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                <span style={{ ...neutralChip, color: 'var(--lh-warm)', background: tint('var(--lh-warm)'), border: 'none' }}>
                  <CalendarDays size={12} aria-hidden="true" /> {formattedDate} · {formattedTime}
                </span>
                <span style={neutralChip}><MapPin size={12} aria-hidden="true" /> {event.location}</span>
                <span style={neutralChip}><Tag size={12} aria-hidden="true" /> {categoryLabel(EVENT_CATEGORIES, event.category)}</span>
                <span style={neutralChip}><UserCircle size={12} aria-hidden="true" /> {event.user.name ?? 'Anónimo'}</span>
              </div>

              {/* Descripción */}
              <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.015em', color: 'var(--lh-fg)', margin: '0 0 14px' }}>
                Acerca de este evento
              </h2>
              <div style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--lh-fg2)', whiteSpace: 'pre-wrap' }}>
                {event.description}
              </div>
            </div>

            {/* Nota comunitaria */}
            <div role="note" style={{ borderRadius: 16, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', padding: '18px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)', margin: 0 }}>
                Este evento fue publicado por un miembro de la comunidad{' '}
                <strong style={{ color: 'var(--lh-fg)', fontWeight: 600 }}>Latin Territory</strong>. Verifica siempre los detalles directamente con el organizador.
              </p>
            </div>

            {/* Disclaimer tickets */}
            <div role="note" style={{ display: 'flex', alignItems: 'flex-start', gap: 11, borderRadius: 16, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)', padding: '18px 20px' }}>
              <Info size={18} style={{ color: 'var(--lh-warm)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--lh-fg2)' }}>
                <p style={{ fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 3px' }}>Latin Territory no vende entradas.</p>
                <p style={{ margin: 0 }}>Los tickets, reembolsos y consultas son responsabilidad exclusiva del organizador. Cualquier enlace de compra dirige a un sitio externo ajeno a esta plataforma.</p>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="lh-card" style={{ padding: 24, position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Fecha y hora destacadas */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--lh-fg3)', margin: '0 0 4px' }}>Fecha del evento</p>
                <p style={{ fontFamily: 'var(--lh-font)', fontSize: 15.5, fontWeight: 600, color: 'var(--lh-fg)', textTransform: 'capitalize', margin: '0 0 4px' }}>{formattedDate}</p>
                <p style={{ fontFamily: 'var(--lh-font)', fontSize: 30, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--lh-warm)', margin: 0 }}>{formattedTime} hrs</p>
              </div>

              <div style={{ height: 1, background: 'var(--lh-border2)' }} />

              {/* Meta info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: MapPin,       label: event.location,                 color: 'var(--lh-terra)' },
                  { icon: Tag,          label: categoryLabel(EVENT_CATEGORIES, event.category), color: 'var(--lh-warm)' },
                  { icon: CalendarDays, label: `Publicado el ${postedDate}`,   color: 'var(--lh-fg3)' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 14, color: 'var(--lh-fg2)' }}>
                    <Icon size={18} style={{ color, flexShrink: 0 }} aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: 'var(--lh-border2)' }} />

              {/* Precio + CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ textAlign: 'center' }}>
                  {event.ticketPrice && event.ticketPrice > 0 ? (
                    <span style={{ fontFamily: 'var(--lh-font)', fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--lh-fg)' }}>
                      ${event.ticketPrice.toFixed(2)} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-fg3)' }}>AUD</span>
                    </span>
                  ) : (
                    <span style={{ fontFamily: 'var(--lh-font)', fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--lh-green)' }}>
                      Gratis
                    </span>
                  )}
                </div>

                {event.ticketLink && (
                  <a href={event.ticketLink} target="_blank" rel="noopener noreferrer" className="lh-btn lh-btn--md lh-btn--primary" style={{ width: '100%' }}>
                    <Ticket size={18} aria-hidden="true" /> Comprar entradas
                  </a>
                )}

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ShareButton
                    title={event.title}
                    text={`¡No te pierdas ${event.title} el ${formattedDate}!`}
                  />
                </div>

                {session?.user && (
                  <div style={{ borderTop: '1px solid var(--lh-border2)', paddingTop: 12 }}>
                    <ReportEventButton
                      eventId={event.id}
                      alreadyReported={alreadyReported}
                      isOwner={isOwner}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
