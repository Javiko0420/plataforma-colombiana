import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import LoginForm from '@/components/ui/login-form'
import { LtPageShell } from '@/components/lt'

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
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect(params.callbackUrl || '/')
  }

  return (
    <LtPageShell maxWidth="md" className="flex items-center">
      <LoginForm callbackUrl={params.callbackUrl} />
    </LtPageShell>
  )
}
