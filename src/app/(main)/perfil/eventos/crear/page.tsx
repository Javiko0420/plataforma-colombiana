import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EventForm from '@/components/eventos/EventForm'
import { LtPageShell, LtPanel } from '@/components/lt'

export default async function CrearEventoPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/perfil/eventos/crear')
  }

  return (
    <LtPageShell maxWidth="2xl">
      <div className="text-center mb-8 space-y-2">
        <h1
          className="text-3xl md:text-4xl font-extrabold tracking-tight"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          Publica un Evento
        </h1>
        <p className="text-lg" style={{ color: 'var(--lt-ink-soft)' }}>
          Comparte eventos con la comunidad y haz que la gente viva
          experiencias increíbles.
        </p>
      </div>

      <LtPanel className="p-6 md:p-8">
        <EventForm />
      </LtPanel>
    </LtPageShell>
  )
}
