import { Metadata } from 'next'
import { Suspense } from 'react'
import CompleteProfileForm from './complete-profile-form'

export const metadata: Metadata = {
  title: 'Completar Perfil | Latin Territory',
  description: 'Completa tu perfil para acceder a todas las funcionalidades de la plataforma',
}

export default function CompleteProfilePage() {
  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'var(--lh-font)' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Suspense fallback={<div className="animate-pulse" style={{ textAlign: 'center', color: 'var(--lh-fg3)' }}>Cargando…</div>}>
          <CompleteProfileForm />
        </Suspense>
      </div>
    </div>
  )
}
