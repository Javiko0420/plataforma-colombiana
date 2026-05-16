import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  CalendarDays, MapPin, Tag, UserCircle,
  Ticket, DollarSign, Info, ArrowLeft, AlertTriangle,
} from 'lucide-react'
import ShareButton from '@/components/ui/share-button'
import ReportEventButton from '@/components/eventos/ReportEventButton'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasUserReportedEvent } from '@/app/(main)/eventos/actions'
import { LtBadge } from '@/components/lt/Badge'
import { LtButton } from '@/components/lt/Button'
import { SunMotif } from '@/components/lt/SunMotif'
import { Squiggle } from '@/components/lt/Squiggle'
import { HandDrawnUnderline } from '@/components/lt/HandDrawnUnderline'
import Link from 'next/link'

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
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh', paddingBottom: '5rem', paddingTop: '2rem' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Botón volver */}
        <Link
          href="/eventos"
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-[var(--lt-radius-pill)] border-[1.6px] border-[var(--lt-ink)] text-sm font-semibold transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
          style={{ background: 'var(--lt-paper)', color: 'var(--lt-ink)', boxShadow: 'var(--lt-shadow-sticker)' }}
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Eventos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Columna principal ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Banner evento oculto */}
            {event.isHidden && (
              <div
                className="flex items-start gap-3 p-5 rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)]"
                style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                role="alert"
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-sm mb-1" style={{ fontFamily: 'var(--lt-font-serif)' }}>
                    Evento oculto por reportes de la comunidad
                  </h3>
                  <p className="text-sm opacity-90" style={{ fontFamily: 'var(--lt-font-sans)' }}>
                    Este evento ha sido ocultado automáticamente y se encuentra en revisión por el equipo de moderación.
                  </p>
                </div>
              </div>
            )}

            {/* Imagen del evento */}
            {event.imageUrl && (
              <div
                className="relative w-full h-64 sm:h-96 rounded-[var(--lt-radius-lg)] overflow-hidden border-[2.2px] border-[var(--lt-ink)]"
                style={{ boxShadow: 'var(--lt-shadow-sticker-lg)' }}
              >
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              </div>
            )}

            {/* Card principal */}
            <div
              className="rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)] p-6 md:p-8"
              style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
            >
              {/* Encabezado */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-[var(--lt-radius-sm)] flex items-center justify-center border-[2px] border-[var(--lt-ink)] shrink-0"
                  style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
                  aria-hidden="true"
                >
                  <CalendarDays className="w-7 h-7" />
                </div>
                <h1
                  className="text-2xl md:text-3xl font-black leading-tight flex-1"
                  style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                >
                  {event.title}
                </h1>
              </div>

              <HandDrawnUnderline width={200} color="var(--lt-sun-core)" thickness={2.5} className="mb-6" aria-hidden="true" />

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                <LtBadge tone="terracota" rotate={-1}>
                  <CalendarDays className="w-3 h-3" aria-hidden="true" />
                  {formattedDate} · {formattedTime}
                </LtBadge>
                <LtBadge tone="neutral" rotate={0.8}>
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {event.location}
                </LtBadge>
                <LtBadge tone="sun" rotate={-0.5}>
                  <Tag className="w-3 h-3" aria-hidden="true" />
                  {event.category}
                </LtBadge>
                <LtBadge tone="neutral" rotate={1}>
                  <UserCircle className="w-3 h-3" aria-hidden="true" />
                  {event.user.name ?? 'Anónimo'}
                </LtBadge>
              </div>

              <Squiggle width={160} height={10} color="var(--lt-terracota)" amplitude={3} className="mb-6" aria-hidden="true" />

              {/* Descripción */}
              <div>
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                >
                  Acerca de este evento
                </h2>
                <div
                  className="leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
                >
                  {event.description}
                </div>
              </div>
            </div>

            {/* Nota comunitaria */}
            <div
              className="rounded-[var(--lt-radius-md)] border-[1.6px] border-[var(--lt-ink)] p-5 text-center relative overflow-hidden"
              style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
              role="note"
            >
              <div aria-hidden="true" className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.07]">
                <SunMotif size={80} />
              </div>
              <p className="text-sm relative" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
                Este evento fue publicado por un miembro de la comunidad{' '}
                <strong style={{ color: 'var(--lt-ink)' }}>Latin Territory</strong>. Recuerda verificar siempre los detalles directamente con el organizador.
              </p>
            </div>

            {/* Disclaimer tickets */}
            <div
              className="flex items-start gap-3 p-5 rounded-[var(--lt-radius-md)] border-[1.6px] border-[var(--lt-ink)]"
              style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
              role="note"
            >
              <Info
                className="w-5 h-5 shrink-0 mt-0.5"
                aria-hidden="true"
                style={{ color: 'var(--lt-sun-core)' }}
              />
              <div className="text-sm" style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}>
                <p className="font-bold mb-1" style={{ color: 'var(--lt-ink)' }}>Latin Territory no vende entradas.</p>
                <p>Los tickets, reembolsos y consultas son responsabilidad exclusiva del organizador. Cualquier enlace de compra dirige a un sitio externo ajeno a esta plataforma.</p>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 relative">
            <div className="lg:sticky lg:top-8 space-y-4">
              <div
                className="rounded-[var(--lt-radius-lg)] border-[2.2px] border-[var(--lt-ink)] p-6 space-y-5"
                style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
              >
                {/* Fecha y hora destacadas */}
                <div className="text-center space-y-1">
                  <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
                    Fecha del evento
                  </p>
                  <p
                    className="text-base font-bold capitalize"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    {formattedDate}
                  </p>
                  <p
                    className="text-3xl font-black"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-terracota)' }}
                  >
                    {formattedTime} hrs
                  </p>
                </div>

                <Squiggle width={120} height={8} color="var(--lt-sun)" amplitude={3} className="mx-auto" aria-hidden="true" />

                {/* Meta info */}
                <div className="space-y-3">
                  {[
                    { icon: MapPin,       label: event.location,           color: 'var(--lt-terracota)' },
                    { icon: Tag,          label: event.category,           color: 'var(--lt-sun-core)'  },
                    { icon: CalendarDays, label: `Publicado el ${postedDate}`, color: 'var(--lt-ink-soft)' },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} className="flex items-center gap-3 text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
                      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" style={{ color }} />
                      <span style={{ fontFamily: 'var(--lt-font-sans)' }}>{label}</span>
                    </div>
                  ))}
                </div>

                <Squiggle width={120} height={8} color="var(--lt-sun)" amplitude={3} className="mx-auto" aria-hidden="true" />

                {/* Precio + CTA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-5 h-5" aria-hidden="true" style={{ color: 'var(--lt-ink-soft)' }} />
                    {event.ticketPrice && event.ticketPrice > 0 ? (
                      <span
                        className="text-2xl font-black"
                        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                      >
                        ${event.ticketPrice.toFixed(2)}{' '}
                        <span className="text-sm font-medium" style={{ color: 'var(--lt-ink-soft)' }}>AUD</span>
                      </span>
                    ) : (
                      <span
                        className="text-2xl font-black"
                        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-verde)' }}
                      >
                        Gratis
                      </span>
                    )}
                  </div>

                  {event.ticketLink && (
                    <a
                      href={event.ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] font-bold text-sm transition-all hover:-translate-y-0.5"
                      style={{
                        background: 'var(--lt-terracota)',
                        color: 'var(--lt-paper)',
                        boxShadow: 'var(--lt-shadow-sticker)',
                      }}
                    >
                      <Ticket className="w-5 h-5" aria-hidden="true" />
                      Comprar Entradas
                    </a>
                  )}

                  <div className="flex justify-center">
                    <ShareButton
                      title={event.title}
                      text={`¡No te pierdas ${event.title} el ${formattedDate}!`}
                    />
                  </div>

                  {session?.user && (
                    <div className="border-t-[1.6px] border-[var(--lt-ink)]/20 pt-3">
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
    </div>
  )
}
