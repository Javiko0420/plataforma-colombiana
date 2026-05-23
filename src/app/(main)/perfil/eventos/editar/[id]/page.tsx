import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EventForm from '@/components/eventos/EventForm'
import { LtPageShell, LtPanel } from '@/components/lt'

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
    <LtPageShell maxWidth="2xl">
      <Link
        href="/perfil/eventos"
        className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:underline"
        style={{ color: 'var(--lt-ink-soft)' }}
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a mis eventos
      </Link>

      <div className="text-center mb-8 space-y-2">
        <h1
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          Editar evento
        </h1>
        <p className="text-lg" style={{ color: 'var(--lt-ink-soft)' }}>
          Actualiza los datos de tu evento. Los cambios se reflejarán
          inmediatamente en el muro.
        </p>
      </div>

      <LtPanel className="p-6 md:p-8">
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
      </LtPanel>
    </LtPageShell>
  )
}
