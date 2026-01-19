'use client';

/**
 * Forum Post Form Component
 * Form for creating new posts with character counter
 */

import React from 'react';
import { Send, X } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || t('postWrite')}
          disabled={disabled || isSubmitting}
          maxLength={maxLength + 50} // Allow typing over limit to show error
          className={`w-full min-h-[120px] px-4 py-3 rounded-lg border ${
            isOverLimit ? 'border-red-500' : 'border-border'
          } bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none`}
        />
        <div className={`absolute bottom-2 right-2 text-xs ${
          isOverLimit ? 'text-red-500' : 'text-foreground/50'
        }`}>
          {remainingChars} / {maxLength}
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={disabled || isSubmitting || content.trim().length === 0 || isOverLimit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? t('loading') : t('postSubmit')}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <X className="w-4 h-4" />
            {t('postCancel')}
          </button>
        )}
      </div>

      <p className="text-xs text-foreground/50">{t('postMaxChars')}</p>
    </form>
  );
}

