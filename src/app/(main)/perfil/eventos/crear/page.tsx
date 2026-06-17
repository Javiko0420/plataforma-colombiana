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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div className="lh-container" style={{ maxWidth: 760 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 className="lh-h1" style={{ fontSize: 'clamp(30px,4.5vw,42px)' }}>Publica un evento</h1>
          <p style={{ fontSize: 17, color: 'var(--lh-fg2)', margin: '14px auto 0', maxWidth: 520, lineHeight: 1.55 }}>
            Comparte eventos con la comunidad y haz que la gente viva experiencias increíbles.
          </p>
        </div>

        <div className="lh-card" style={{ padding: 'clamp(22px,4vw,32px)' }}>
          <EventForm />
        </div>
      </div>
    </div>
  )
}
