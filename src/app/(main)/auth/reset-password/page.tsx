'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LtPageShell, LtPanel, LtButton } from '@/components/lt';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <div
        className="p-4 rounded-[var(--lt-radius-sm)] border-2 border-red-500 text-sm text-center"
        style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
        role="alert"
      >
        Token no encontrado. Por favor, solicita un nuevo enlace de recuperación.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al cambiar la contraseña');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="p-4 rounded-[var(--lt-radius-sm)] border-2 border-[var(--lt-verde)] text-sm text-center"
        style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
      >
        ¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...
      </div>
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div
          className="p-4 rounded-[var(--lt-radius-sm)] border-2 border-red-500 text-sm"
          style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
          role="alert"
        >
          {error}
        </div>
      )}
      <div>
        <label className="lt-label">Nueva Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="lt-input"
        />
      </div>
      <div>
        <label className="lt-label">Confirmar Contraseña</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="lt-input"
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
        loadingText="Actualizando..."
      >
        Actualizar contraseña
      </LtButton>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <LtPageShell maxWidth="md" className="flex items-center">
      <LtPanel className="p-8">
        <div className="text-center">
          <h2
            className="text-3xl font-bold"
            style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
          >
            Establece tu nueva contraseña
          </h2>
        </div>
        <Suspense
          fallback={
            <div className="text-center mt-8" style={{ color: 'var(--lt-ink-soft)' }}>
              Cargando...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </LtPanel>
    </LtPageShell>
  );
}
