'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from '@/components/providers/language-provider'
import { Eye, EyeOff, UserPlus, CheckCircle, Calendar } from 'lucide-react'
import { GoogleSignInButton } from './google-sign-in-button'
import { AppleSignInButton } from './apple-sign-in-button'
import LegalContractModal from './legal-contract-modal'
import { LEGAL_VERSIONS, calculateAge } from '@/lib/legal'
import { Button } from '@/components/lh/Button'

interface RegisterFormProps {
  callbackUrl?: string
  className?: string
}

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  dateOfBirth: string
}

const errorText: React.CSSProperties = { marginTop: 6, fontSize: 12.5, color: 'var(--lh-terra)' }
const helpText: React.CSSProperties = { marginTop: 6, fontSize: 12.5, color: 'var(--lh-fg3)' }

export default function RegisterForm({ callbackUrl, className = '' }: RegisterFormProps) {
  const router = useRouter()
  const { t } = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [showContractModal, setShowContractModal] = useState(false)
  const [contractAccepted, setContractAccepted] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    const errors: Record<string, string> = {}

    if (!formData.name) {
      errors.name = t('auth.validation.nameRequired')
    } else if (formData.name.length < 2) {
      errors.name = t('auth.validation.nameMin')
    }

    if (!formData.email) {
      errors.email = t('auth.validation.emailRequired')
    }

    if (!formData.password) {
      errors.password = t('auth.validation.passwordRequired')
    } else if (formData.password.length < 8) {
      errors.password = t('auth.validation.passwordMin')
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('auth.validation.passwordMatch')
    }

    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'La fecha de nacimiento es requerida'
    } else {
      const birthDate = new Date(formData.dateOfBirth)
      if (isNaN(birthDate.getTime())) {
        errors.dateOfBirth = 'Fecha de nacimiento inválida'
      } else if (birthDate > new Date()) {
        errors.dateOfBirth = 'La fecha de nacimiento no puede ser en el futuro'
      } else {
        const age = calculateAge(birthDate)
        if (age < 16) {
          errors.dateOfBirth = 'Debes tener al menos 16 años para registrarte'
        } else if (age > 120) {
          errors.dateOfBirth = 'Fecha de nacimiento inválida'
        }
      }
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pendingData.name,
          email: pendingData.email,
          password: pendingData.password,
          dateOfBirth: pendingData.dateOfBirth,
          contractAcceptedAt: new Date().toISOString(),
          contractVersion: LEGAL_VERSIONS.contract,
          termsVersion: LEGAL_VERSIONS.terms,
          privacyVersion: LEGAL_VERSIONS.privacy,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError(t('auth.error.emailExists'))
        } else if (data.details) {
          const serverErrors: Record<string, string> = {}
          data.details.forEach((detail: { field: string; message: string }) => {
            serverErrors[detail.field] = detail.message
          })
          setFieldErrors(serverErrors)
        } else {
          setError(data.error || t('auth.signup.error'))
        }
        setShowContractModal(false)
        setIsLoading(false)
        return
      }

      setShowContractModal(false)
      setSuccess(true)
      setIsLoading(false)

      const signinUrl = callbackUrl
        ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : '/auth/signin'

      setTimeout(() => {
        router.push(signinUrl)
      }, 2000)
    } catch (err) {
      console.error('Registration error:', err)
      setError(t('auth.error.serverError'))
      setShowContractModal(false)
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowContractModal(false)
    setContractAccepted(false)
    setPendingData(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const inputClass = (field: string) => `lh-input${fieldErrors[field] ? ' lh-input--invalid' : ''}`

  if (success) {
    return (
      <div className={`w-full ${className}`}>
        <div className="lh-card" style={{ padding: 'clamp(24px,5vw,36px)', textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: 60, height: 60, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in oklch, var(--lh-green) 14%, transparent)' }}>
            <CheckCircle size={30} style={{ color: 'var(--lh-green)' }} />
          </div>
          <h2 className="lh-h2" style={{ fontSize: 24, margin: '0 0 8px' }}>{t('auth.signup.success')}</h2>
          <p style={{ color: 'var(--lh-fg2)' }}>Redirigiendo al inicio de sesión…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="lh-card" style={{ padding: 'clamp(24px,5vw,36px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 className="lh-h2" style={{ fontSize: 'clamp(26px,4vw,32px)', margin: '0 0 8px' }}>{t('auth.signup.title')}</h1>
          <p style={{ color: 'var(--lh-fg2)', fontSize: 15 }}>{t('auth.signup.subtitle')}</p>
        </div>

        <AppleSignInButton callbackUrl={callbackUrl} label="Registrarse con Apple" />
        <div style={{ height: 10 }} />
        <GoogleSignInButton callbackUrl={callbackUrl} label="Registrarse con Google" />

        <div style={{ position: 'relative', margin: '22px 0' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', borderTop: '1px solid var(--lh-border)' }} />
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <span style={{ padding: '0 14px', background: 'var(--lh-surface)', color: 'var(--lh-fg3)', fontSize: 13 }}>o con tu correo</span>
          </div>
        </div>

        {error && (
          <div role="alert" style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 13, background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)' }}>
            <p style={{ fontSize: 14, color: 'var(--lh-terra)', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleInitialSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="name" className="lh-label">{t('auth.signup.name')}</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required autoComplete="name" disabled={isLoading} className={inputClass('name')} />
            {fieldErrors.name && <p style={errorText}>{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="lh-label">{t('auth.signup.email')}</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required autoComplete="email" disabled={isLoading} className={inputClass('email')} />
            {fieldErrors.email && <p style={errorText}>{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="lh-label">Fecha de nacimiento</label>
            <div style={{ position: 'relative' }}>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                autoComplete="bday"
                disabled={isLoading}
                className={inputClass('dateOfBirth')}
                style={{ paddingRight: 44 }}
                max={new Date().toISOString().split('T')[0]}
              />
              <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--lh-fg3)' }}>
                <Calendar size={18} />
              </div>
            </div>
            {fieldErrors.dateOfBirth ? <p style={errorText}>{fieldErrors.dateOfBirth}</p> : <p style={helpText}>Debes tener al menos 16 años para registrarte</p>}
          </div>

          <div>
            <label htmlFor="password" className="lh-label">{t('auth.signup.password')}</label>
            <div style={{ position: 'relative' }}>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required autoComplete="new-password" disabled={isLoading} className={inputClass('password')} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--lh-fg3)', display: 'flex' }} aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password ? <p style={errorText}>{fieldErrors.password}</p> : <p style={helpText}>{t('auth.validation.passwordStrength')}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="lh-label">{t('auth.signup.confirmPassword')}</label>
            <div style={{ position: 'relative' }}>
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" disabled={isLoading} className={inputClass('confirmPassword')} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--lh-fg3)', display: 'flex' }} aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p style={errorText}>{fieldErrors.confirmPassword}</p>}
          </div>

          <div style={{ fontSize: 12.5, color: 'var(--lh-fg3)', lineHeight: 1.5 }}>
            {t('auth.signup.terms')}{' '}
            <Link href="/terminos" style={{ color: 'var(--lh-accent)' }}>{t('auth.signup.termsLink')}</Link>{' '}
            {t('auth.signup.and')}{' '}
            <Link href="/privacidad" style={{ color: 'var(--lh-accent)' }}>{t('auth.signup.privacyLink')}</Link>
          </div>

          <Button type="submit" variant="primary" size="md" disabled={isLoading} style={{ width: '100%' }}>
            {!isLoading && <UserPlus size={18} />}
            {isLoading ? t('auth.signup.loading') : t('auth.signup.submit')}
          </Button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--lh-fg2)' }}>
            {t('auth.signup.hasAccount')}{' '}
            <Link href={callbackUrl ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/signin'} style={{ fontWeight: 600, color: 'var(--lh-accent)' }}>
              {t('auth.signup.signIn')}
            </Link>
          </p>
        </div>
      </div>

      <LegalContractModal
        isOpen={showContractModal}
        onClose={handleCloseModal}
        onConfirm={handleFinalSubmit}
        isLoading={isLoading}
        accepted={contractAccepted}
        onAcceptedChange={setContractAccepted}
        submitLabel="Confirmar y Crear"
      />
    </div>
  )
}
