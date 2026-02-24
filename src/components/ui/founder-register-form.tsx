'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Loader2, CheckCircle } from 'lucide-react'
import { GoogleSignInButton } from './google-sign-in-button'
import LegalContractModal from './legal-contract-modal'
import { LEGAL_VERSIONS } from '@/lib/legal'

interface FounderFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  businessName: string
  socialLink: string
}

interface FounderRegisterFormProps {
  variant?: 'light' | 'dark'
}

export function FounderRegisterForm({ variant = 'light' }: FounderRegisterFormProps) {
  const dark = variant === 'dark'
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<FounderFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    socialLink: '',
  })

  const [showContractModal, setShowContractModal] = useState(false)
  const [contractAccepted, setContractAccepted] = useState(false)
  const [pendingData, setPendingData] = useState<FounderFormData | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const errors: Record<string, string> = {}

    if (!formData.name || formData.name.length < 2) {
      errors.name = 'El nombre es requerido (mín. 2 caracteres)'
    }
    if (!formData.email) {
      errors.email = 'El email es requerido'
    }
    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres'
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      errors.password = 'Debe contener: 1 mayúscula, 1 minúscula, 1 número y 1 especial (@$!%*?&)'
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }
    if (!formData.businessName || formData.businessName.length < 2) {
      errors.businessName = 'El nombre del negocio es requerido'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setPendingData(formData)
    setContractAccepted(false)
    setShowContractModal(true)
  }

  const handleFinalSubmit = async () => {
    if (!contractAccepted || !pendingData) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pendingData.name,
          email: pendingData.email,
          password: pendingData.password,
          contractAcceptedAt: new Date().toISOString(),
          contractVersion: LEGAL_VERSIONS.contract,
          termsVersion: LEGAL_VERSIONS.terms,
          privacyVersion: LEGAL_VERSIONS.privacy,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setError('Este correo electrónico ya está registrado')
        } else if (data.details) {
          const serverErrors: Record<string, string> = {}
          data.details.forEach((d: { field: string; message: string }) => {
            serverErrors[d.field] = d.message
          })
          setFieldErrors(serverErrors)
        } else {
          setError(data.error || 'Error al registrar. Intenta de nuevo.')
        }
        setShowContractModal(false)
        setIsLoading(false)
        return
      }

      setShowContractModal(false)
      setSuccess(true)
      setIsLoading(false)
      setTimeout(() => router.push('/auth/signin'), 2500)
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
      setShowContractModal(false)
      setIsLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = dark
    ? {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        color: '#fff',
        fontSize: 14,
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box' as const,
      }
    : {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #d1d5db',
        borderRadius: 8,
        color: '#111827',
        fontSize: 14,
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box' as const,
      }

  const errorStyle: React.CSSProperties = dark
    ? { marginTop: 4, fontSize: 12, color: '#fca5a5' }
    : { marginTop: 4, fontSize: 12, color: '#dc2626' }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{
          margin: '0 auto 12px',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: dark ? 'rgba(34,197,94,0.2)' : '#dcfce7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CheckCircle style={{ width: 32, height: 32, color: dark ? '#4ade80' : '#16a34a' }} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: dark ? '#fff' : '#111827', marginBottom: 4 }}>
          ¡Cupo Reservado!
        </h3>
        <p style={{ fontSize: 14, color: dark ? '#d1d5db' : '#4b5563' }}>
          Redirigiendo al inicio de sesión...
        </p>
      </div>
    )
  }

  const handleGoogleClick = async () => {
    setGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl: '/registrar-negocio' })
    } catch {
      setGoogleLoading(false)
    }
  }

  return (
    <>
      {dark ? (
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={googleLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '12px 16px',
            color: '#fff',
            fontWeight: 500,
            fontSize: 14,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            opacity: googleLoading ? 0.5 : 1,
            fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
          onMouseLeave={(e) => { if (!googleLoading) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
        >
          {googleLoading ? (
            <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: 'none' }} aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" style={{ fill: '#4285F4' }} />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" style={{ fill: '#34A853' }} />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" style={{ fill: '#FBBC05' }} />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" style={{ fill: '#EA4335' }} />
            </svg>
          )}
          <span>{googleLoading ? 'Conectando...' : 'Registrarse con Google'}</span>
        </button>
      ) : (
        <GoogleSignInButton
          callbackUrl="/registrar-negocio"
          label="Registrarse con Google"
        />
      )}

      {/* Divider */}
      <div style={{ position: 'relative', margin: '16px 0' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.2)' : '#d1d5db'}` }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          <span style={{
            padding: '0 12px',
            fontSize: 12,
            color: dark ? '#d1d5db' : '#9ca3af',
            background: 'transparent',
          }}>
            o con tu correo
          </span>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            background: dark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
            border: `1px solid ${dark ? 'rgba(252,165,165,0.3)' : '#fecaca'}`,
          }}
          role="alert"
        >
          <p style={{ fontSize: 14, color: dark ? '#fecaca' : '#b91c1c', margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <input name="name" type="text" placeholder="Tu Nombre Completo" value={formData.name} onChange={handleChange} required disabled={isLoading} style={inputStyle} />
          {fieldErrors.name && <p style={errorStyle}>{fieldErrors.name}</p>}
        </div>

        <div>
          <input name="businessName" type="text" placeholder="Nombre del Negocio" value={formData.businessName} onChange={handleChange} required disabled={isLoading} style={inputStyle} />
          {fieldErrors.businessName && <p style={errorStyle}>{fieldErrors.businessName}</p>}
        </div>

        <div>
          <input name="email" type="email" placeholder="Tu Email" value={formData.email} onChange={handleChange} required disabled={isLoading} style={inputStyle} />
          {fieldErrors.email && <p style={errorStyle}>{fieldErrors.email}</p>}
        </div>

        <div>
          <input name="password" type="password" placeholder="Contraseña (8+ chars, mayús, minús, número, especial)" value={formData.password} onChange={handleChange} required disabled={isLoading} autoComplete="new-password" style={inputStyle} />
          {fieldErrors.password && <p style={errorStyle}>{fieldErrors.password}</p>}
        </div>

        <div>
          <input name="confirmPassword" type="password" placeholder="Confirmar Contraseña" value={formData.confirmPassword} onChange={handleChange} required disabled={isLoading} autoComplete="new-password" style={inputStyle} />
          {fieldErrors.confirmPassword && <p style={errorStyle}>{fieldErrors.confirmPassword}</p>}
        </div>

        <div>
          <input name="socialLink" type="url" placeholder="Link de Instagram/Web (opcional)" value={formData.socialLink} onChange={handleChange} disabled={isLoading} style={inputStyle} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            background: '#ea580c',
            color: '#fff',
            fontWeight: 700,
            padding: '14px 16px',
            borderRadius: 8,
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 16,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em',
            fontFamily: 'inherit',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#c2410c' }}
          onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#ea580c' }}
        >
          {isLoading ? (
            <>
              <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
              <span>Procesando...</span>
            </>
          ) : (
            <span>¡QUIERO SER FUNDADOR!</span>
          )}
        </button>
      </form>

      <LegalContractModal
        isOpen={showContractModal}
        onClose={() => {
          setShowContractModal(false)
          setContractAccepted(false)
          setPendingData(null)
        }}
        onConfirm={handleFinalSubmit}
        isLoading={isLoading}
        accepted={contractAccepted}
        onAcceptedChange={setContractAccepted}
        submitLabel="Confirmar y Reservar Cupo"
      />
    </>
  )
}
