import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import RegisterForm from '@/components/ui/register-form'

export const metadata: Metadata = {
  title: 'Crear Cuenta | Plataforma Colombiana',
  description: 'Crea tu cuenta en Plataforma Colombiana',
}

export default async function SignUpPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <RegisterForm />
      </div>
    </main>
  )
}

