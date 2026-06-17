'use client';

/**
 * Forum Report Modal Component
 * Modal for reporting inappropriate content
 */

import React from 'react';
import { AccessibleModal } from './accessible-modal';
import { ReportReason } from '@prisma/client';
import { Button } from '@/components/lh/Button';

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
    { value: 'SPAM', label: t('reportSpam') },
    { value: 'HARASSMENT', label: t('reportHarassment') },
    { value: 'HATE_SPEECH', label: t('reportHateSpeech') },
    { value: 'INAPPROPRIATE_CONTENT', label: t('reportInappropriate') },
    { value: 'MISINFORMATION', label: t('reportMisinformation') },
    { value: 'OTHER', label: t('reportOther') },
  ];

  return (
    <AccessibleModal isOpen={isOpen} onClose={onClose} title={t('reportTitle')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label htmlFor="report-reason" className="lh-label">{t('reportReason')}</label>
          <select
            id="report-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as ReportReason)}
            disabled={isSubmitting}
            className="lh-input"
          >
            {reportReasons.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="report-details" className="lh-label">{t('reportDetails')}</label>
          <textarea
            id="report-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            disabled={isSubmitting}
            maxLength={500}
            rows={4}
            className="lh-input"
            style={{ resize: 'none' }}
            placeholder="Proporciona detalles adicionales..."
          />
          <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: '7px 0 0' }}>
            {500 - details.length} caracteres restantes
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 12, fontSize: 13.5, background: 'color-mix(in oklch, var(--lh-terra) 10%, transparent)', border: '1px solid color-mix(in oklch, var(--lh-terra) 25%, transparent)', color: 'var(--lh-terra)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 2 }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="lh-btn lh-btn--md"
            style={{ flex: 1, background: 'var(--lh-terra)', color: '#fff', opacity: isSubmitting ? 0.5 : 1 }}
          >
            {isSubmitting ? t('loading') : t('reportSubmit')}
          </button>
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
            {t('postCancel')}
          </Button>
        </div>
      </form>
    </AccessibleModal>
  );
}
