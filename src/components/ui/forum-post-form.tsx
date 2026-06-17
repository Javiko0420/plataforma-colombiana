'use client';

/**
 * Forum Post Form Component
 * Form for creating new posts with character counter
 */

import React from 'react';
import { Send, X } from 'lucide-react';
import { Button } from '@/components/lh/Button';

interface ForumPostFormProps {
  t: (key: string) => string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

export function ForumPostForm({
  t,
  onSubmit,
  onCancel,
  placeholder,
  maxLength = 500,
  disabled = false,
}: ForumPostFormProps) {
  const [content, setContent] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.trim().length === 0) {
      setError('El contenido no puede estar vacío');
      return;
    }

    if (content.length > maxLength) {
      setError(`El contenido no puede exceder ${maxLength} caracteres`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingChars = maxLength - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative' }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || t('postWrite')}
          disabled={disabled || isSubmitting}
          maxLength={maxLength + 50}
          className={`lh-input${isOverLimit ? ' lh-input--invalid' : ''}`}
          style={{ minHeight: 120, resize: 'none', paddingBottom: 28 }}
        />
        <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 12, color: isOverLimit ? 'var(--lh-terra)' : 'var(--lh-fg3)' }}>
          {remainingChars} / {maxLength}
        </div>
      </div>

      {error && (
        <div style={{ padding: '8px 12px', borderRadius: 10, fontSize: 13.5, background: 'color-mix(in oklch, var(--lh-terra) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--lh-terra) 25%, transparent)', color: 'var(--lh-terra)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Button type="submit" variant="primary" size="sm" disabled={disabled || isSubmitting || content.trim().length === 0 || isOverLimit}>
          <Send size={15} />
          {isSubmitting ? t('loading') : t('postSubmit')}
        </Button>

        {onCancel && (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={isSubmitting}>
            <X size={15} />
            {t('postCancel')}
          </Button>
        )}
      </div>

      <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: 0 }}>{t('postMaxChars')}</p>
    </form>
  );
}
