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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="lh-container" style={{ maxWidth: 760 }}>
        <Link href="/perfil/eventos" className="lh-btn lh-btn--sm lh-btn--secondary" style={{ marginBottom: 24 }}>
          <ArrowLeft size={16} aria-hidden="true" /> Volver a mis eventos
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="lh-h1" style={{ fontSize: 'clamp(30px,4.5vw,42px)' }}>Editar evento</h1>
          <p style={{ fontSize: 17, color: 'var(--lh-fg2)', margin: '14px auto 0', maxWidth: 520, lineHeight: 1.55 }}>
            Actualiza los datos de tu evento. Los cambios se reflejarán inmediatamente en el muro.
          </p>
        </div>

        <div className="lh-card" style={{ padding: 'clamp(22px,4vw,32px)' }}>
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
