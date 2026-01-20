import { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

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
  const errorMessages: Record<string, string> = {
    Configuration: 'Error de configuración del servidor',
    AccessDenied: 'Acceso denegado',
    Verification: 'El enlace de verificación ha expirado o ya fue usado',
    Default: 'Ha ocurrido un error al iniciar sesión',
  }

  const error = params.error || 'Default'
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error de Autenticación
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {errorMessage}
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Intentar nuevamente
            </Link>
            
            <Link
              href="/"
              className="block w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

