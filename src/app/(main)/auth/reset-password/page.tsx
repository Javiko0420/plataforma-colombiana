'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/lh/Button';

const noticeBox = (tone: 'terra' | 'green'): React.CSSProperties => ({
  padding: '14px 16px', borderRadius: 13, fontSize: 14, textAlign: 'center',
  background: `color-mix(in oklch, var(--lh-${tone}) 10%, var(--lh-surface))`,
  border: `1px solid color-mix(in oklch, var(--lh-${tone}) 30%, transparent)`,
  color: tone === 'terra' ? 'var(--lh-terra)' : 'var(--lh-fg)',
});

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
      <div role="alert" style={{ ...noticeBox('terra'), marginTop: 24 }}>
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
      <div style={{ ...noticeBox('green'), marginTop: 24 }}>
        ¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión…
      </div>
    );
  }

  return (
    <form style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={handleSubmit}>
      {error && <div role="alert" style={noticeBox('terra')}>{error}</div>}
      <div>
        <label htmlFor="new-password" className="lh-label">Nueva contraseña</label>
        <input id="new-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="lh-input" />
      </div>
      <div>
        <label htmlFor="confirm-password" className="lh-label">Confirmar contraseña</label>
        <input id="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="lh-input" />
      </div>
      <Button type="submit" variant="primary" size="md" disabled={isLoading} style={{ width: '100%' }}>
        {isLoading ? 'Actualizando…' : 'Actualizar contraseña'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', fontFamily: 'var(--lh-font)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div className="lh-card" style={{ padding: 'clamp(24px,5vw,36px)' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 className="lh-h2" style={{ fontSize: 'clamp(24px,4vw,30px)', margin: 0 }}>Establece tu nueva contraseña</h2>
          </div>
          <Suspense fallback={<div style={{ textAlign: 'center', marginTop: 28, color: 'var(--lh-fg3)' }}>Cargando…</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
