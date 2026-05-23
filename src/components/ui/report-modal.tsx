'use client'

import { useState } from 'react'
import { AccessibleModal } from '@/components/ui/accessible-modal'
import { LtButton } from '@/components/lt'

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Es spam o publicidad no deseada' },
  { value: 'HARASSMENT', label: 'Acoso o comportamiento ofensivo' },
  { value: 'HATE_SPEECH', label: 'Discurso de odio' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Contenido sexual o violento' },
  { value: 'MISINFORMATION', label: 'Información falsa o engañosa' },
  { value: 'OTHER', label: 'Otro motivo' },
]

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  targetId: string
  targetType: 'business' | 'review' | 'post' | 'comment'
}

export function ReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!reason) return

    setIsSubmitting(true)
    setError(null)

    try {
      const endpointMap: Record<string, string> = {
        business: `/api/businesses/${targetId}/report`,
        review: `/api/reviews/${targetId}/report`,
        post: `/api/posts/${targetId}/report`,
        comment: `/api/comments/${targetId}/report`,
      }

      const res = await fetch(endpointMap[targetType], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details: details.trim() || undefined }),
      })

      if (!res.ok) {
        if (res.status === 409) {
          setError('Ya reportaste este contenido anteriormente. Nuestro equipo lo revisará pronto.')
          return
        }
        throw new Error('Error al enviar reporte')
      }

      setReason('')
      setDetails('')
      onClose()
    } catch {
      setError('No pudimos enviar tu reporte. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setDetails('')
    setError(null)
    onClose()
  }

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reportar Contenido"
      description="Ayúdanos a mantener la comunidad segura. Este reporte es anónimo."
      size="sm"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="lt-label">¿Cuál es el problema?</label>
          <div className="grid gap-2">
            {REPORT_REASONS.map((r) => (
              <div
                key={r.value}
                onClick={() => setReason(r.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setReason(r.value)
                  }
                }}
                role="radio"
                aria-checked={reason === r.value}
                tabIndex={0}
                className={`p-3 rounded-[var(--lt-radius-sm)] border-[2px] cursor-pointer text-sm transition-all ${
                  reason === r.value
                    ? 'border-[var(--lt-terracota)] font-medium shadow-[var(--lt-shadow-sticker)]'
                    : 'border-[var(--lt-ink)] hover:opacity-90'
                }`}
                style={{
                  background: reason === r.value ? 'var(--lt-bg)' : 'var(--lt-paper)',
                  color: reason === r.value ? 'var(--lt-terracota)' : 'var(--lt-ink-soft)',
                  fontFamily: 'var(--lt-font-sans)',
                }}
              >
                {r.label}
              </div>
            ))}
          </div>
        </div>

        {reason === 'OTHER' && (
          <div>
            <label htmlFor="report-details" className="lt-label">
              Describe el problema
            </label>
            <textarea
              id="report-details"
              className="lt-input resize-none"
              placeholder="Proporciona detalles adicionales..."
              rows={3}
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--lt-ink-soft)' }}>
              {500 - details.length} caracteres restantes
            </p>
          </div>
        )}

        {error && (
          <div
            className="p-3 rounded-[var(--lt-radius-sm)] border-[2px] text-sm"
            style={{ background: 'var(--lt-bg)', borderColor: 'var(--lt-accent)', color: 'var(--lt-accent)' }}
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t-[2px] border-[var(--lt-ink)]">
          <LtButton
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            variant="outline"
            tone="paper"
            size="sm"
          >
            Cancelar
          </LtButton>
          <LtButton
            type="button"
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            variant="sticker"
            tone="accent"
            size="sm"
            rotate={-1}
            loading={isSubmitting}
            loadingText="Enviando..."
          >
            Enviar Reporte
          </LtButton>
        </div>
      </div>
    </AccessibleModal>
  )
}
