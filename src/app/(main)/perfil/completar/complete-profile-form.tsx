'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Calendar } from 'lucide-react'
import LegalContractModal from '@/components/ui/legal-contract-modal'
import { LEGAL_VERSIONS, validateDateOfBirth } from '@/lib/legal'
import { Button } from '@/components/lh/Button'

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
      window.location.href = callbackUrl || '/'
    }
  }, [session?.user?.hasCompletedProfile, callbackUrl])

  if (status === 'loading') {
    return <div className="animate-pulse" style={{ textAlign: 'center', color: 'var(--lh-fg3)' }}>Cargando…</div>
  }

  if (session?.user?.hasCompletedProfile) {
    return <div className="animate-pulse" style={{ textAlign: 'center', color: 'var(--lh-fg3)' }}>Redirigiendo…</div>
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
    <>
      <div className="lh-card" style={{ padding: 'clamp(24px,5vw,36px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ margin: '0 auto 16px', width: 60, height: 60, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in oklch, var(--lh-accent) 14%, transparent)' }}>
            <Calendar size={28} style={{ color: 'var(--lh-accent)' }} />
          </div>
          <h1 className="lh-h2" style={{ fontSize: 24, margin: '0 0 8px' }}>Un último paso</h1>
          <p style={{ fontSize: 14, color: 'var(--lh-fg2)' }}>
            {callbackUrl === '/registrar-negocio'
              ? 'Para registrar tu negocio, primero necesitamos verificar tu edad y que aceptes nuestros términos legales.'
              : 'Para cumplir con la legislación vigente, necesitamos verificar tu edad y que aceptes nuestros términos legales.'}
          </p>
          {callbackUrl === '/registrar-negocio' && (
            <p style={{ marginTop: 8, fontSize: 12.5, fontWeight: 500, color: 'var(--lh-accent)' }}>
              Al finalizar serás llevado directamente al formulario de registro de negocio.
            </p>
          )}
        </div>

        {error && (
          <div role="alert" style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 13, background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)' }}>
            <p style={{ fontSize: 14, color: 'var(--lh-terra)', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label htmlFor="name" className="lh-label">Nombre completo *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (fieldError) setFieldError(null) }}
              required
              autoComplete="name"
              disabled={isLoading}
              className="lh-input"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="lh-label">Fecha de nacimiento</label>
            <div style={{ position: 'relative' }}>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => { setDateOfBirth(e.target.value); if (fieldError) setFieldError(null); if (error) setError(null) }}
                required
                autoComplete="bday"
                disabled={isLoading}
                className={`lh-input${fieldError ? ' lh-input--invalid' : ''}`}
                style={{ paddingRight: 44 }}
                max={new Date().toISOString().split('T')[0]}
              />
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--lh-fg3)' }}>
                <Calendar size={18} />
              </div>
            </div>
            {fieldError ? (
              <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--lh-terra)' }}>{fieldError}</p>
            ) : (
              <p style={{ marginTop: 6, fontSize: 12.5, color: 'var(--lh-fg3)' }}>Debes tener al menos 16 años (legislación australiana)</p>
            )}
          </div>

          <Button type="submit" variant="primary" size="md" disabled={isLoading} style={{ width: '100%' }}>
            {isLoading ? 'Procesando…' : 'Continuar'}
          </Button>
        </form>
      </div>

      <LegalContractModal
        isOpen={showContractModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        isLoading={isLoading}
        accepted={contractAccepted}
        onAcceptedChange={setContractAccepted}
        submitLabel="Aceptar y Completar Perfil"
      />
    </>
  )
}
