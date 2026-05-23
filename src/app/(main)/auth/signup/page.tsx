import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import RegisterForm from '@/components/ui/register-form'
import { LtPageShell } from '@/components/lt'

export const metadata: Metadata = {
  title: 'Crear Cuenta | Plataforma Colombiana',
  description: 'Crea tu cuenta en Plataforma Colombiana',
}

export default async function SignUpPage({
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
      <RegisterForm callbackUrl={params.callbackUrl} />
    </LtPageShell>
  )
}
