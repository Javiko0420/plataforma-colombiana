import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EventForm from '@/components/eventos/EventForm'

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/perfil/eventos')
  }

  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
  })

  // Verificar que existe y que el usuario es el dueño (o admin/moderador)
  if (!event) {
    redirect('/perfil/eventos')
  }

  const userRole = session.user.role ?? 'USER'
  const isOwner = event.userId === session.user.id
  const isPrivileged = userRole === 'ADMIN' || userRole === 'MODERATOR'

  if (!isOwner && !isPrivileged) {
    redirect('/perfil/eventos')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Botón volver */}
        <Link
          href="/perfil/eventos"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a mis eventos
        </Link>

        {/* Cabecera */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Editar{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">
              evento
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Actualiza los datos de tu evento. Los cambios se reflejarán
            inmediatamente en el muro.
          </p>
        </div>

        {/* Formulario en modo edición */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <EventForm
            mode="edit"
            eventId={event.id}
            initialData={{
              title: event.title,
              description: event.description,
              category: event.category,
              eventDate: event.eventDate.toISOString(),
              location: event.location,
              imageUrl: event.imageUrl,
              ticketLink: event.ticketLink,
              ticketPrice: event.ticketPrice,
            }}
          />
        </div>
      </div>
    </div>
  )
}
