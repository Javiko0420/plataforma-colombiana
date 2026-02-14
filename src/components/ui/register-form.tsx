'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from '@/components/providers/language-provider'
import { AccessibleButton } from './accessible-button'
import { AccessibleInput } from './accessible-input'
import { Eye, EyeOff, UserPlus, Loader2, CheckCircle, Calendar } from 'lucide-react'
import { GoogleSignInButton } from './google-sign-in-button'
import LegalContractModal from './legal-contract-modal'
import { LEGAL_VERSIONS, calculateAge } from '@/lib/legal'

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

// LEGAL_VERSIONS and calculateAge are imported from @/lib/legal

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

  // Estados para el modal de contrato legal
  const [showContractModal, setShowContractModal] = useState(false)
  const [contractAccepted, setContractAccepted] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)

  // Primer paso: Validar formulario y mostrar modal de contrato
  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validación del lado del cliente
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

    // Validación de fecha de nacimiento
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

    // Guardar datos y mostrar modal de contrato
    setPendingData(formData)
    setContractAccepted(false)
    setShowContractModal(true)
  }

  // Segundo paso: Enviar datos después de aceptar el contrato
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

      // Éxito — redirigir al login preservando el destino original
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
    // Clear errors when user starts typing
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
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('auth.signup.success')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Redirigiendo al inicio de sesión...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.signup.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.signup.subtitle')}
          </p>
        </div>

        {/* Google Sign-In Button */}
        <GoogleSignInButton
          callbackUrl={callbackUrl}
          label="Registrarse con Google"
        />

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              o con tu correo
            </span>
          </div>
        </div>

        {error && (
          <div 
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            role="alert"
          >
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleInitialSubmit} className="space-y-5">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
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
              className="w-full"
              error={fieldErrors.name}
            />
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
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
              className="w-full"
              error={fieldErrors.email}
            />
          </div>

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
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                autoComplete="bday"
                disabled={isLoading}
                className="w-full pr-12"
                error={fieldErrors.dateOfBirth}
                max={new Date().toISOString().split('T')[0]}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Debes tener al menos 16 años para registrarte
            </p>
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
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
                className="w-full pr-12"
                error={fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t('auth.validation.passwordStrength')}
            </p>
          </div>

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
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
                className="w-full pr-12"
                error={fieldErrors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

          <div className="text-xs text-gray-600 dark:text-gray-400">
            {t('auth.signup.terms')}{' '}
            <Link href="/terminos" className="text-blue-600 dark:text-blue-400 hover:underline">
              {t('auth.signup.termsLink')}
            </Link>{' '}
            {t('auth.signup.and')}{' '}
            <Link href="/privacidad" className="text-blue-600 dark:text-blue-400 hover:underline">
              {t('auth.signup.privacyLink')}
            </Link>
          </div>

          <AccessibleButton
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label={isLoading ? t('auth.signup.loading') : t('auth.signup.submit')}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t('auth.signup.loading')}</span>
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                <span>{t('auth.signup.submit')}</span>
              </>
            )}
          </AccessibleButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('auth.signup.hasAccount')}{' '}
            <Link
              href={callbackUrl ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/signin'}
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t('auth.signup.signIn')}
            </Link>
          </p>
        </div>
      </div>

      {/* Shared Legal Contract Modal */}
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

