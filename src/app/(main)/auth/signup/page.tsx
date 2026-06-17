import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import RegisterForm from '@/components/ui/register-form'

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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'var(--lh-font)' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <RegisterForm callbackUrl={params.callbackUrl} />
      </div>
    </div>
  )
}
