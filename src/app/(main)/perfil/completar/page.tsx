import { Metadata } from 'next'
import { Suspense } from 'react'
import CompleteProfileForm from './complete-profile-form'
import { LtPageShell } from '@/components/lt'

export const metadata: Metadata = {
  title: 'Completar Perfil | Latin Territory',
  description: 'Completa tu perfil para acceder a todas las funcionalidades de la plataforma',
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <LtPageShell maxWidth="md" className="flex items-center justify-center">
          <div className="animate-pulse" style={{ color: 'var(--lt-ink-soft)' }}>
            Cargando...
          </div>
        </LtPageShell>
      }
    >
      <CompleteProfileForm />
    </Suspense>
  )
}
