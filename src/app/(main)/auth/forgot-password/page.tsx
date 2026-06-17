'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/lh/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al procesar la solicitud');
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'var(--lh-font)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="lh-card" style={{ padding: 'clamp(24px,5vw,36px)' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 className="lh-h2" style={{ fontSize: 'clamp(24px,4vw,30px)', margin: '0 0 8px' }}>Recuperar contraseña</h2>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)' }}>
              Ingresa tu correo y te enviaremos un enlace para restablecerla.
            </p>
          </div>

          {error && (
            <div role="alert" style={{ marginTop: 22, padding: '12px 16px', borderRadius: 13, fontSize: 14, background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)', color: 'var(--lh-terra)' }}>
              {error}
            </div>
          )}

          {success ? (
            <div style={{ marginTop: 22, padding: '14px 16px', borderRadius: 13, fontSize: 14, textAlign: 'center', background: 'color-mix(in oklch, var(--lh-green) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-green) 30%, transparent)', color: 'var(--lh-fg)' }}>
              Si el correo está registrado, recibirás un enlace de recuperación en breve.
            </div>
          ) : (
            <form style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="lh-label">Correo electrónico</label>
                <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="lh-input" placeholder="tu@correo.com" />
              </div>

              <Button type="submit" variant="primary" size="md" disabled={isLoading} style={{ width: '100%' }}>
                {isLoading ? 'Enviando…' : 'Enviar enlace'}
              </Button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <Link href="/auth/signin" style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-accent)' }}>
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
