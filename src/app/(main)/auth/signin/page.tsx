import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginForm from '@/components/ui/login-form'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Latin Territory',
  description: 'Inicia sesión en tu cuenta de Latin Territory',
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams
  // Check if user is already logged in
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect(params.callbackUrl || '/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <LoginForm callbackUrl={params.callbackUrl} />
      </div>
    </main>
  )
}

