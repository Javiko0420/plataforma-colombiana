'use client';

/**
 * Forum Report Modal Component
 * Modal for reporting inappropriate content
 */

import React from 'react';
import { X } from 'lucide-react';
import { AccessibleModal } from './accessible-modal';
import { ReportReason } from '@prisma/client';

interface ForumReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details?: string) => Promise<void>;
  t: (key: string) => string;
  contentType: 'post' | 'comment';
}

export function ForumReportModal({
  isOpen,
  onClose,
  onSubmit,
  t,
  contentType,
}: ForumReportModalProps) {
  const [reason, setReason] = React.useState<ReportReason>('SPAM');
  const [details, setDetails] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(reason, details.trim() || undefined);
      setReason('SPAM');
      setDetails('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportReasons: { value: ReportReason; label: string }[] = [
    { value: 'SPAM', label: t('forums.report.spam') },
    { value: 'HARASSMENT', label: t('forums.report.harassment') },
    { value: 'HATE_SPEECH', label: t('forums.report.hateSpeech') },
    { value: 'INAPPROPRIATE_CONTENT', label: t('forums.report.inappropriate') },
    { value: 'MISINFORMATION', label: t('forums.report.misinformation') },
    { value: 'OTHER', label: t('forums.report.other') },
  ];

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('forums.report.title')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="report-reason"
            className="block text-sm font-medium text-foreground mb-2"
          >
            {t('forums.report.reason')}
          </label>
          <select
            id="report-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
            disabled={isSubmitting}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reportReasons.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="report-details"
            className="block text-sm font-medium text-foreground mb-2"
          >
            {t('forums.report.details')}
          </label>
          <textarea
            id="report-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            disabled={isSubmitting}
            maxLength={500}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            placeholder="Proporciona detalles adicionales..."
          />
          <p className="text-xs text-foreground/50 mt-1">
            {500 - details.length} caracteres restantes
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? t('forums.loading') : t('forums.report.submit')}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-border hover:bg-background/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('forums.post.cancel')}
          </button>
        </div>
      </form>
    </AccessibleModal>
  );
}

