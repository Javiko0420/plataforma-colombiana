import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, MapPin, Tag, UserCircle, Ticket } from 'lucide-react'
import ShareButton from '@/components/ui/share-button'

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
      description:
        'Este evento ya no se encuentra disponible en nuestra plataforma.',
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
  const event = await prisma.event.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  })

  if (!event) notFound()

  const formattedDate = format(
    new Date(event.eventDate),
    "EEEE d 'de' MMMM, yyyy",
    { locale: es }
  )
  const formattedTime = format(new Date(event.eventDate), 'HH:mm', {
    locale: es,
  })
  const postedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(event.createdAt))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Detalles Principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Imagen del evento */}
            {event.imageUrl && (
              <div className="relative w-full h-64 sm:h-96 rounded-2xl overflow-hidden shadow-sm">
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

            {/* Cabecera del Evento */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-r from-yellow-500 to-red-500 text-white shadow-md shrink-0">
                  <CalendarDays className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                    {event.title}
                  </h1>
                </div>
              </div>

              {/* Tags de metadatos del evento */}
              <div className="flex flex-wrap gap-3 text-sm font-medium text-gray-600 dark:text-gray-300 mb-8 border-b border-gray-100 dark:border-gray-700 pb-8">
                <span className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800/50">
                  <CalendarDays className="w-4 h-4" /> {formattedDate} ·{' '}
                  {formattedTime}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                  <MapPin className="w-4 h-4" /> {event.location}
                </span>
                <span className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-lg border border-yellow-100 dark:border-yellow-800/50">
                  <Tag className="w-4 h-4" /> {event.category}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                  <UserCircle className="w-4 h-4" /> Publicado por{' '}
                  {event.user.name ?? 'Anónimo'}
                </span>
              </div>

              {/* Cuerpo de la Descripción */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Acerca de este evento
                </h2>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </div>
              </div>
            </div>

            {/* Mensaje comunitario */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-6 text-center">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Este evento fue publicado por un miembro de la comunidad{' '}
                <span className="font-bold">Latin Territory</span>. Recuerda
                verificar siempre los detalles directamente con el organizador.
              </p>
            </div>
          </div>

          {/* Columna Derecha: Sidebar de Acción */}
          <div className="lg:col-span-1 relative">
            <div className="lg:sticky lg:top-8 space-y-4">
              {/* Tarjeta de acción principal */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
                <div className="text-center space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fecha del evento
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                    {formattedDate}
                  </p>
                  <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">
                    {formattedTime} hrs
                  </p>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-5 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Tag className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>{event.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <CalendarDays className="w-5 h-5 text-gray-400 shrink-0" />
                    <span>Publicado el {postedDate}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-5 space-y-3">
                  {event.ticketLink && (
                    <a
                      href={event.ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-yellow-500 to-red-500 text-white px-6 py-3 font-bold text-base hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                      <Ticket className="w-5 h-5" />
                      Comprar Entradas
                    </a>
                  )}

                  <div className="flex items-center justify-center">
                    <ShareButton
                      title={event.title}
                      text={`¡No te pierdas ${event.title} el ${formattedDate}!`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
