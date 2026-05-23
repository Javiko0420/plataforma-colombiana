'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from '@/components/providers/language-provider'
import { AccessibleInput } from './accessible-input'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { GoogleSignInButton } from './google-sign-in-button'
import { LtPanel, LtButton } from '@/components/lt'

interface LoginFormProps {
  callbackUrl?: string
  className?: string
}

export default function LoginForm({ callbackUrl = '/', className = '' }: LoginFormProps) {
  const router = useRouter()
  const { t } = useTranslations()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('auth.error.invalidCredentials'))
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(t('auth.error.serverError'))
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    if (error) setError(null)
  }

  return (
    <div className={`w-full ${className}`}>
      <LtPanel className="p-8">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            {t('auth.login.title')}
          </h1>
          <p style={{ color: 'var(--lt-ink-soft)' }}>
            {t('auth.login.subtitle')}
          </p>
        </div>

        <GoogleSignInButton callbackUrl={callbackUrl} />

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="lt-label">
              {t('auth.login.email')}
            </label>
            <AccessibleInput
              id="email"
              name="email"
              type="email"
              label={t('auth.login.email')}
              showLabel={false}
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={isLoading}
              className="lt-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="lt-label">
              {t('auth.login.password')}
            </label>
            <div className="relative">
              <AccessibleInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label={t('auth.login.password')}
                showLabel={false}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                disabled={isLoading}
                className="lt-input pr-12"
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
          </div>

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium hover:underline transition-colors"
              style={{ color: 'var(--lt-terracota)' }}
            >
              {t('auth.login.forgotPassword')}
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
            loadingText={t('auth.login.loading')}
            iconLeft={!isLoading ? <LogIn className="h-5 w-5" /> : undefined}
          >
            {t('auth.login.submit')}
          </LtButton>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
            {t('auth.login.noAccount')}{' '}
            <Link
              href={callbackUrl && callbackUrl !== '/' ? `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/signup'}
              className="font-medium hover:underline transition-colors"
              style={{ color: 'var(--lt-terracota)' }}
            >
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>
      </LtPanel>
    </div>
  )
}
