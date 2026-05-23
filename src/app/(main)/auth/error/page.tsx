import { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { LtPageShell, LtPanel, LtButton } from '@/components/lt'

export const metadata: Metadata = {
  title: 'Error de Autenticación | Latin Territory',
  description: 'Error al iniciar sesión',
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  const error = params.error || 'Default'
  const isAccountNotLinked = error === 'OAuthAccountNotLinked'

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked:
      'Este correo ya está registrado con usuario y contraseña. Por favor, inicia sesión con tus credenciales.',
    Configuration: 'Error de configuración del servidor',
    AccessDenied: 'Acceso denegado',
    Verification: 'El enlace de verificación ha expirado o ya fue usado',
    Default: 'Ha ocurrido un error al iniciar sesión',
  }

  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <LtPageShell maxWidth="md" className="flex items-center">
      <LtPanel className="p-8 text-center">
        <div
          className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center border-2 border-red-500"
          style={{ background: 'var(--lt-bg)' }}
        >
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          {isAccountNotLinked ? 'Cuenta ya registrada' : 'Error de Autenticación'}
        </h1>
        
        <p className="mb-6" style={{ color: 'var(--lt-ink-soft)' }}>
          {errorMessage}
        </p>

        <div className="space-y-3">
          <Link href="/auth/signin" className="block">
            <LtButton variant="sticker" tone="terracota" size="md" className="w-full">
              {isAccountNotLinked ? 'Iniciar sesión con credenciales' : 'Intentar nuevamente'}
            </LtButton>
          </Link>
          
          <Link href="/" className="block">
            <LtButton variant="outline" tone="paper" size="md" className="w-full">
              Volver al inicio
            </LtButton>
          </Link>
        </div>
      </LtPanel>
    </LtPageShell>
  )
}
