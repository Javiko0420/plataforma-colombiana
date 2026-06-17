import { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/lh/Button'

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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'var(--lh-font)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="lh-card" style={{ padding: 'clamp(24px,5vw,36px)', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: 60, height: 60, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)' }}>
            <AlertTriangle size={28} style={{ color: 'var(--lh-terra)' }} />
          </div>

          <h1 className="lh-h2" style={{ fontSize: 24, margin: '0 0 8px' }}>
            {isAccountNotLinked ? 'Cuenta ya registrada' : 'Error de autenticación'}
          </h1>

          <p style={{ color: 'var(--lh-fg2)', margin: '0 0 24px' }}>{errorMessage}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button href="/auth/signin" variant="primary" size="md" style={{ width: '100%' }}>
              {isAccountNotLinked ? 'Iniciar sesión con credenciales' : 'Intentar nuevamente'}
            </Button>
            <Button href="/" variant="secondary" size="md" style={{ width: '100%' }}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
