'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { AccessibleInput } from '@/components/ui/accessible-input'
import { AccessibleButton } from '@/components/ui/accessible-button'
import LegalContractModal from '@/components/ui/legal-contract-modal'
import { LEGAL_VERSIONS, validateDateOfBirth } from '@/lib/legal'

/**
 * Profile completion form for Google OAuth users.
 * Collects date of birth (age verification) and legal contract acceptance.
 * After submission, refreshes the JWT token via `update()` so the middleware
 * sees `hasCompletedProfile: true` and stops redirecting.
 */
export default function CompleteProfileForm() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Destination after profile completion — defaults to /perfil
  const callbackUrl = searchParams.get('callbackUrl') || '/perfil'

  const [dateOfBirth, setDateOfBirth] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [contractAccepted, setContractAccepted] = useState(false)

  // If profile is already complete, redirect to the intended destination.
  // Using useEffect avoids calling router.push during the render phase.
  useEffect(() => {
    if (session?.user?.hasCompletedProfile) {
      router.push(callbackUrl)
    }
  }, [session?.user?.hasCompletedProfile, router, callbackUrl])

  // While session is loading, show a brief loading state
  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Cargando...</div>
      </main>
    )
  }

  // Don't render the form while a redirect is in progress
  if (session?.user?.hasCompletedProfile) {
    return null
  }

  // Step 1: Validate DOB and open the contract modal
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldError(null)

    const dobError = validateDateOfBirth(dateOfBirth)
    if (dobError) {
      setFieldError(dobError)
      return
    }

    // DOB is valid — show the contract modal
    setContractAccepted(false)
    setShowContractModal(true)
  }

  // Step 2: Submit profile completion after contract acceptance
  const handleConfirm = async () => {
    if (!contractAccepted) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/users/me/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateOfBirth,
          contractAcceptedAt: new Date().toISOString(),
          contractVersion: LEGAL_VERSIONS.contract,
          termsVersion: LEGAL_VERSIONS.terms,
          privacyVersion: LEGAL_VERSIONS.privacy,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al completar el perfil')
        setShowContractModal(false)
        setIsLoading(false)
        return
      }

      // Refresh the JWT token so hasCompletedProfile becomes true
      await update()

      setShowContractModal(false)
      // Redirect to the original destination (e.g. /registrar-negocio) or /perfil
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      console.error('Profile completion error:', err)
      setError('Error del servidor. Intenta de nuevo.')
      setShowContractModal(false)
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowContractModal(false)
    setContractAccepted(false)
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">

          {/* Welcome header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Un último paso
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {callbackUrl === '/registrar-negocio'
                ? 'Para registrar tu negocio, primero necesitamos verificar tu edad y que aceptes nuestros términos legales.'
                : 'Para cumplir con la legislación vigente, necesitamos verificar tu edad y que aceptes nuestros términos legales.'}
            </p>
            {callbackUrl === '/registrar-negocio' && (
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                Al finalizar serás llevado directamente al formulario de registro de negocio.
              </p>
            )}
          </div>

          {/* Error alert */}
          {error && (
            <div
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              role="alert"
            >
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Date of birth form */}
          <form onSubmit={handleInitialSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Fecha de Nacimiento
              </label>
              <div className="relative">
                <AccessibleInput
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  label="Fecha de Nacimiento"
                  showLabel={false}
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value)
                    if (fieldError) setFieldError(null)
                    if (error) setError(null)
                  }}
                  required
                  autoComplete="bday"
                  disabled={isLoading}
                  className="w-full pr-12"
                  error={fieldError ?? undefined}
                  max={new Date().toISOString().split('T')[0]}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Debes tener al menos 16 años (legislación australiana)
              </p>
            </div>

            <AccessibleButton
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Continuar al contrato legal"
            >
              Continuar
            </AccessibleButton>
          </form>
        </div>
      </div>

      {/* Shared Legal Contract Modal (same as registration flow) */}
      <LegalContractModal
        isOpen={showContractModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        accepted={contractAccepted}
        onAcceptedChange={setContractAccepted}
        submitLabel="Aceptar y Completar Perfil"
      />
    </main>
  )
}
