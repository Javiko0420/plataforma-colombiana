import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import UserEvents from '@/components/eventos/UserEvents'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-16">
      {/* Cabecera con gradiente cálido */}
      <div className="bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-900/10 pt-12 pb-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Mis{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">
                Eventos
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Administra todos los eventos que has publicado.
            </p>
          </div>
          <Link
            href="/perfil/eventos/crear"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 text-white font-semibold px-6 py-3 hover:from-yellow-600 hover:to-red-600 transition-all shadow-md shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            Crear Evento
          </Link>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserEvents initialEvents={misEventos} />
      </main>
    </div>
  )
}
