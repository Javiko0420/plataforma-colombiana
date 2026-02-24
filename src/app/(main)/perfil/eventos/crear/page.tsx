import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EventForm from '@/components/eventos/EventForm'

export default async function CrearEventoPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/perfil/eventos/crear')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Cabecera */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Publica un{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">
              Evento
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comparte eventos con la comunidad y haz que la gente viva
            experiencias increíbles.
          </p>
        </div>

        {/* Contenedor del formulario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <EventForm />
        </div>
      </div>
    </div>
  )
}
