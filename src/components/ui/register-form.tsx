'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from '@/components/providers/language-provider'
import { AccessibleInput } from './accessible-input'
import { Eye, EyeOff, UserPlus, CheckCircle, Calendar } from 'lucide-react'
import { GoogleSignInButton } from './google-sign-in-button'
import { AppleSignInButton } from './apple-sign-in-button'
import LegalContractModal from './legal-contract-modal'
import { LEGAL_VERSIONS, calculateAge } from '@/lib/legal'
import { LtPanel, LtButton } from '@/components/lt'

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
        headers: {
          'Content-Type': 'application/json',
        },
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError(null)
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  if (success) {
    return (
      <div className={`w-full ${className}`}>
        <LtPanel className="p-8">
          <div className="text-center">
            <div
              className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center border-2 border-[var(--lt-verde)]"
              style={{ background: 'var(--lt-bg)' }}
            >
              <CheckCircle className="h-10 w-10" style={{ color: 'var(--lt-verde)' }} />
            </div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
            >
              {t('auth.signup.success')}
            </h2>
            <p style={{ color: 'var(--lt-ink-soft)' }}>
              Redirigiendo al inicio de sesión...
            </p>
          </div>
        </LtPanel>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      <LtPanel className="p-8">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('auth.signup.title')}
          </h1>
          <p style={{ color: 'var(--lt-ink-soft)' }}>
            {t('auth.signup.subtitle')}
          </p>
        </div>

        <AppleSignInButton
          callbackUrl={callbackUrl}
          label="Registrarse con Apple"
        />
        <div className="mt-3" />
        <GoogleSignInButton
          callbackUrl={callbackUrl}
          label="Registrarse con Google"
        />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[var(--lt-ink)] opacity-20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span
              className="px-4"
              style={{ background: 'var(--lt-paper)', color: 'var(--lt-ink-soft)' }}
            >
              o con tu correo
            </span>
          </div>
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

        <form onSubmit={handleInitialSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="lt-label">
              {t('auth.signup.name')}
            </label>
            <AccessibleInput
              id="name"
              name="name"
              type="text"
              label={t('auth.signup.name')}
              showLabel={false}
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
              disabled={isLoading}
              className="lt-input"
              error={fieldErrors.name}
            />
          </div>

          <div>
            <label htmlFor="email" className="lt-label">
              {t('auth.signup.email')}
            </label>
            <AccessibleInput
              id="email"
              name="email"
              type="email"
              label={t('auth.signup.email')}
              showLabel={false}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={isLoading}
              className="lt-input"
              error={fieldErrors.email}
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
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                autoComplete="bday"
                disabled={isLoading}
                className="lt-input pr-12"
                error={fieldErrors.dateOfBirth}
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
              Debes tener al menos 16 años para registrarte
            </p>
          </div>

          <div>
            <label htmlFor="password" className="lt-label">
              {t('auth.signup.password')}
            </label>
            <div className="relative">
              <AccessibleInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label={t('auth.signup.password')}
                showLabel={false}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                disabled={isLoading}
                className="lt-input pr-12"
                error={fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--lt-ink-soft)' }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
              {t('auth.validation.passwordStrength')}
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="lt-label">
              {t('auth.signup.confirmPassword')}
            </label>
            <div className="relative">
              <AccessibleInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                label={t('auth.signup.confirmPassword')}
                showLabel={false}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                disabled={isLoading}
                className="lt-input pr-12"
                error={fieldErrors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--lt-ink-soft)' }}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
            {t('auth.signup.terms')}{' '}
            <Link href="/terminos" className="hover:underline" style={{ color: 'var(--lt-terracota)' }}>
              {t('auth.signup.termsLink')}
            </Link>{' '}
            {t('auth.signup.and')}{' '}
            <Link href="/privacidad" className="hover:underline" style={{ color: 'var(--lt-terracota)' }}>
              {t('auth.signup.privacyLink')}
            </Link>
          </div>

          <LtButton
            type="submit"
            variant="sticker"
            tone="terracota"
            size="md"
            className="w-full"
            disabled={isLoading}
            loading={isLoading}
            loadingText={t('auth.signup.loading')}
            iconLeft={!isLoading ? <UserPlus className="h-5 w-5" /> : undefined}
          >
            {t('auth.signup.submit')}
          </LtButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
            {t('auth.signup.hasAccount')}{' '}
            <Link
              href={callbackUrl ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/signin'}
              className="font-medium hover:underline transition-colors"
              style={{ color: 'var(--lt-terracota)' }}
            >
              {t('auth.signup.signIn')}
            </Link>
          </p>
        </div>
      </LtPanel>

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
