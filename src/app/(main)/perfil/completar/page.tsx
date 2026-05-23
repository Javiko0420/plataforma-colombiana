import { Metadata } from 'next'
import { Suspense } from 'react'
import CompleteProfileForm from './complete-profile-form'

export const metadata: Metadata = {
  title: 'Completar Perfil | Latin Territory',
  description: 'Completa tu perfil para acceder a todas las funcionalidades de la plataforma',
}

export default function CompleteProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">Cargando...</div>
        </main>
      }
    >
      <CompleteProfileForm />
    </Suspense>
  )
}
