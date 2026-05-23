'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LtPageShell, LtPanel, LtButton } from '@/components/lt';

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
    <LtPageShell maxWidth="md" className="flex items-center">
      <LtPanel className="p-8">
        <div className="text-center">
          <h2
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Recuperar contraseña
          </h2>
          <p className="text-sm" style={{ color: 'var(--lt-ink-soft)' }}>
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        {error && (
          <div
            className="mt-6 p-4 rounded-[var(--lt-radius-sm)] border-2 border-red-500 text-sm"
            style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
            role="alert"
          >
            {error}
          </div>
        )}

        {success ? (
          <div
            className="mt-6 p-4 rounded-[var(--lt-radius-sm)] border-2 border-[var(--lt-verde)] text-sm text-center"
            style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
          >
            Si el correo está registrado, recibirás un enlace de recuperación en breve.
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="lt-label">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lt-input"
                placeholder="tu@correo.com"
              />
            </div>

            <LtButton
              type="submit"
              variant="sticker"
              tone="terracota"
              size="md"
              className="w-full"
              disabled={isLoading}
              loading={isLoading}
              loadingText="Enviando..."
            >
              Enviar enlace
            </LtButton>
          </form>
        )}

        <div className="text-center mt-6">
          <Link
            href="/auth/signin"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--lt-terracota)' }}
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </LtPanel>
    </LtPageShell>
  );
}
