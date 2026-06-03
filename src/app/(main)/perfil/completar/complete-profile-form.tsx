'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { AccessibleInput } from '@/components/ui/accessible-input'
import LegalContractModal from '@/components/ui/legal-contract-modal'
import { LEGAL_VERSIONS, validateDateOfBirth } from '@/lib/legal'
import { LtPageShell, LtPanel, LtButton } from '@/components/lt'

/**
 * Profile completion form for Google OAuth users.
 * Collects date of birth (age verification) and legal contract acceptance.
 * After submission, refreshes the JWT token via `update()` so the middleware
 * sees `hasCompletedProfile: true` and stops redirecting.
 */
export default function CompleteProfileForm() {
  const { data: session, status, update } = useSession()
  const searchParams = useSearchParams()

  const callbackUrl = searchParams.get('callbackUrl') || '/perfil'

  const [name, setName] = useState(session?.user?.name || '')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showContractModal, setShowContractModal] = useState(false)
  const [contractAccepted, setContractAccepted] = useState(false)

  useEffect(() => {
    if (session?.user?.hasCompletedProfile) {
      // Navegación dura: garantiza que el middleware lea la cookie JWT actualizada
      window.location.href = callbackUrl || '/'
    }
  }, [session?.user?.hasCompletedProfile, callbackUrl])

  if (status === 'loading') {
    return (
      <LtPageShell maxWidth="md" className="flex items-center justify-center">
        <div className="animate-pulse" style={{ color: 'var(--lt-ink-soft)' }}>
          Cargando...
        </div>
      </LtPageShell>
    )
  }

  if (session?.user?.hasCompletedProfile) {
    return (
      <LtPageShell maxWidth="md" className="flex items-center justify-center">
        <div className="animate-pulse" style={{ color: 'var(--lt-ink-soft)' }}>
          Redirigiendo...
        </div>
      </LtPageShell>
    )
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldError(null)

    if (!name.trim()) {
      setFieldError('El nombre completo es requerido')
      return
    }

    const dobError = validateDateOfBirth(dateOfBirth)
    if (dobError) {
      setFieldError(dobError)
      return
    }

    setContractAccepted(false)
    setShowContractModal(true)
  }

  const handleConfirm = async () => {
    if (!contractAccepted) return
    setIsLoading(true)

    try {
      const response = await fetch('/api/users/me/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
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

      await update()

      setShowContractModal(false)
      // Navegación dura: garantiza que el middleware lea la cookie JWT actualizada
      window.location.href = callbackUrl || '/'
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
    <LtPageShell maxWidth="md" className="flex items-center">
      <LtPanel className="p-8 w-full">
        <div className="text-center mb-8">
          <div
            className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center border-2 border-[var(--lt-ink)]"
            style={{ background: 'var(--lt-bg)' }}
          >
            <Calendar className="h-8 w-8" style={{ color: 'var(--lt-terracota)' }} />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Un último paso
          </h1>
          <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
            {callbackUrl === '/registrar-negocio'
              ? 'Para registrar tu negocio, primero necesitamos verificar tu edad y que aceptes nuestros términos legales.'
              : 'Para cumplir con la legislación vigente, necesitamos verificar tu edad y que aceptes nuestros términos legales.'}
          </p>
          {callbackUrl === '/registrar-negocio' && (
            <p className="mt-2 text-xs font-medium" style={{ color: 'var(--lt-terracota)' }}>
              Al finalizar serás llevado directamente al formulario de registro de negocio.
            </p>
          )}
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-[var(--lt-radius-sm)] border-2 border-red-500"
            style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
            role="alert"
          >
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleInitialSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="lt-label">
              Nombre Completo *
            </label>
            <AccessibleInput
              id="name"
              name="name"
              type="text"
              label="Nombre Completo"
              showLabel={false}
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (fieldError) setFieldError(null)
              }}
              required
              autoComplete="name"
              disabled={isLoading}
              className="lt-input"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="lt-label">
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
                className="lt-input pr-12"
                error={fieldError ?? undefined}
                max={new Date().toISOString().split('T')[0]}
              />
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--lt-ink-soft)' }}
              >
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
              Debes tener al menos 16 años (legislación australiana)
            </p>
          </div>

          <LtButton
            type="submit"
            variant="sticker"
            tone="terracota"
            size="md"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
          >
            Continuar
          </LtButton>
        </form>
      </LtPanel>

      <LegalContractModal
        isOpen={showContractModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        accepted={contractAccepted}
        onAcceptedChange={setContractAccepted}
        submitLabel="Aceptar y Completar Perfil"
      />
    </LtPageShell>
  )
}
