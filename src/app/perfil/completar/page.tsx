import { Metadata } from 'next'
import CompleteProfileForm from './complete-profile-form'

export const metadata: Metadata = {
  title: 'Completar Perfil | Latin Territory',
  description: 'Completa tu perfil para acceder a todas las funcionalidades de la plataforma',
}

export default function CompleteProfilePage() {
  return <CompleteProfileForm />
}
