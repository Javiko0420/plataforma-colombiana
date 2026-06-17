'use client'

import { useState } from 'react'
import { AccessibleModal } from '@/components/ui/accessible-modal'
import { Button } from '@/components/lh/Button'

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
      title="Reportar contenido"
      description="Ayúdanos a mantener la comunidad segura. Este reporte es anónimo."
      size="sm"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label className="lh-label">¿Cuál es el problema?</label>
          <div style={{ display: 'grid', gap: 8 }}>
            {REPORT_REASONS.map((r) => {
              const active = reason === r.value
              return (
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
                  aria-checked={active}
                  tabIndex={0}
                  style={{
                    padding: '11px 14px', borderRadius: 12, cursor: 'pointer', fontSize: 14,
                    border: '1px solid', transition: 'background .18s, border-color .18s, color .18s',
                    borderColor: active ? 'var(--lh-accent)' : 'var(--lh-border)',
                    background: active ? 'color-mix(in oklch, var(--lh-accent) 10%, transparent)' : 'var(--lh-surface)',
                    color: active ? 'var(--lh-accent)' : 'var(--lh-fg2)',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {r.label}
                </div>
              )
            })}
          </div>
        </div>

        {reason === 'OTHER' && (
          <div>
            <label htmlFor="report-details" className="lh-label">Describe el problema</label>
            <textarea
              id="report-details"
              className="lh-input"
              style={{ resize: 'none' }}
              placeholder="Proporciona detalles adicionales…"
              rows={3}
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <p style={{ fontSize: 12.5, marginTop: 6, color: 'var(--lh-fg3)' }}>{500 - details.length} caracteres restantes</p>
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 14px', borderRadius: 12, fontSize: 14, background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)', color: 'var(--lh-terra)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid var(--lh-border2)' }}>
          <Button type="button" onClick={handleClose} disabled={isSubmitting} variant="secondary" size="sm">
            Cancelar
          </Button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="lh-btn lh-btn--sm"
            style={{ background: 'var(--lh-terra)', color: '#fff', opacity: (!reason || isSubmitting) ? 0.5 : 1 }}
          >
            {isSubmitting ? 'Enviando…' : 'Enviar reporte'}
          </button>
        </div>
      </div>
    </AccessibleModal>
  )
}
