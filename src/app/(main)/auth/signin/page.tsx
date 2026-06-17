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
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect(params.callbackUrl || '/')
  }

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'var(--lh-font)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <LoginForm callbackUrl={params.callbackUrl} />
      </div>
    </div>
  )
}
