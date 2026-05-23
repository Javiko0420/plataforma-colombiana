import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import UserEvents from '@/components/eventos/UserEvents'
import { LtPageShell, LtButton } from '@/components/lt'

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
    <LtPageShell maxWidth="5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Mis Eventos
          </h1>
          <p className="text-lg mt-2" style={{ color: 'var(--lt-ink-soft)' }}>
            Administra todos los eventos que has publicado.
          </p>
        </div>
        <Link href="/perfil/eventos/crear">
          <LtButton
            variant="sticker"
            tone="sun"
            size="md"
            rotate={-1}
            iconLeft={<PlusCircle className="w-5 h-5" />}
          >
            Crear Evento
          </LtButton>
        </Link>
      </div>

      <UserEvents initialEvents={misEventos} />
    </LtPageShell>
  )
}
