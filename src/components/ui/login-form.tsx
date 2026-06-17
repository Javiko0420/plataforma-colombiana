'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from '@/components/providers/language-provider'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { GoogleSignInButton } from './google-sign-in-button'
import { AppleSignInButton } from './apple-sign-in-button'
import { Button } from '@/components/lh/Button'

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
  const [formData, setFormData] = useState({ email: '', password: '' })

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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="lh-card" style={{ padding: 'clamp(24px,5vw,36px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 className="lh-h2" style={{ fontSize: 'clamp(26px,4vw,32px)', margin: '0 0 8px' }}>
            {t('auth.login.title')}
          </h1>
          <p style={{ color: 'var(--lh-fg2)', fontSize: 15 }}>{t('auth.login.subtitle')}</p>
        </div>

        <AppleSignInButton callbackUrl={callbackUrl} />
        <div style={{ height: 10 }} />
        <GoogleSignInButton callbackUrl={callbackUrl} />

        <div style={{ position: 'relative', margin: '22px 0' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', borderTop: '1px solid var(--lh-border)' }} />
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <span style={{ padding: '0 14px', background: 'var(--lh-surface)', color: 'var(--lh-fg3)', fontSize: 13 }}>
              o con tu correo
            </span>
          </div>
        </div>

        {error && (
          <div role="alert" style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 13, background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)' }}>
            <p style={{ fontSize: 14, color: 'var(--lh-terra)', margin: 0 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label htmlFor="email" className="lh-label">{t('auth.login.email')}</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={isLoading}
              className="lh-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="lh-label">{t('auth.login.password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                disabled={isLoading}
                className="lh-input"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--lh-fg3)', display: 'flex' }}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <Link href="/auth/forgot-password" style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--lh-accent)' }}>
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          <Button type="submit" variant="primary" size="md" disabled={isLoading} style={{ width: '100%' }}>
            {!isLoading && <LogIn size={18} />}
            {isLoading ? t('auth.login.loading') : t('auth.login.submit')}
          </Button>
        </form>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--lh-fg2)' }}>
            {t('auth.login.noAccount')}{' '}
            <Link
              href={callbackUrl && callbackUrl !== '/' ? `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/auth/signup'}
              style={{ fontWeight: 600, color: 'var(--lh-accent)' }}
            >
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
