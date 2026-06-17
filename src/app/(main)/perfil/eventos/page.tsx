import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PlusCircle } from 'lucide-react'
import UserEvents from '@/components/eventos/UserEvents'
import { Button } from '@/components/lh/Button'

export const metadata: Metadata = {
  title: 'Mis Eventos | Latin Territory',
  description: 'Gestiona los eventos que has publicado en la plataforma.',
}

export default async function MisEventosPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/perfil/eventos')
  }

  const misEventos = await prisma.event.findMany({
    where: { userId: session.user.id },
    orderBy: { eventDate: 'desc' },
  })

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="lh-container" style={{ maxWidth: 1040 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ marginBottom: 32 }}>
          <div>
            <h1 className="lh-h1" style={{ fontSize: 'clamp(30px,4.5vw,44px)' }}>Mis eventos</h1>
            <p style={{ fontSize: 16, color: 'var(--lh-fg2)', margin: '10px 0 0' }}>
              Administra todos los eventos que has publicado.
            </p>
          </div>
          <Button href="/perfil/eventos/crear" variant="primary" size="md">
            <PlusCircle size={18} /> Crear evento
          </Button>
        </div>

        <UserEvents initialEvents={misEventos} />
      </div>
    </div>
  )
}
