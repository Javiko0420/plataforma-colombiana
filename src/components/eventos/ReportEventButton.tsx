'use client'

import { useState } from 'react'
import { Flag, AlertTriangle, X } from 'lucide-react'
import { reportEvent } from '@/app/(main)/eventos/actions'
import { LtButton, LtPanel } from '@/components/lt'

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam o publicidad engañosa' },
  { value: 'MISINFORMATION', label: 'Información falsa o engañosa' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Contenido inapropiado' },
  { value: 'HATE_SPEECH', label: 'Discurso de odio' },
  { value: 'HARASSMENT', label: 'Acoso o amenazas' },
  { value: 'OTHER', label: 'Otro motivo' },
] as const

interface ReportEventButtonProps {
  eventId: string
  alreadyReported: boolean
  isOwner: boolean
}

export default function ReportEventButton({
  eventId,
  alreadyReported,
  isOwner,
}: ReportEventButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(alreadyReported)
  const [error, setError] = useState<string | null>(null)

  if (isOwner) return null

  async function handleSubmit() {
    if (!reason) {
      setError('Selecciona un motivo para el reporte.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await reportEvent(eventId, {
      reason,
      details: details.trim() || undefined,
    })

    setLoading(false)

    if (result.success) {
      setSubmitted(true)
      setShowModal(false)
    } else {
      setError(result.error ?? 'Error al enviar el reporte.')
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm py-2" style={{ color: 'var(--lt-ink-soft)' }}>
        <Flag className="w-4 h-4" aria-hidden="true" />
        <span>Ya reportaste este evento</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center gap-2 w-full text-sm py-2 rounded-[var(--lt-radius-sm)] transition-colors hover:opacity-80"
        style={{ color: 'var(--lt-ink-soft)' }}
      >
        <Flag className="w-4 h-4" aria-hidden="true" />
        Reportar evento
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
            aria-hidden="true"
          />

          <LtPanel className="relative w-full max-w-md p-6 space-y-5" shadow="lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-[var(--lt-radius-sm)] border-[2px] border-[var(--lt-ink)] flex items-center justify-center"
                  style={{ background: 'var(--lt-bg)', color: 'var(--lt-terracota)' }}
                >
                  <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                  >
                    Reportar evento
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
                    Tu reporte será revisado por moderación
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="transition-colors hover:opacity-80"
                style={{ color: 'var(--lt-ink-soft)' }}
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="lt-label">Motivo del reporte</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="lt-input"
                >
                  <option value="">Selecciona un motivo...</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="lt-label">
                  Detalles adicionales{' '}
                  <span style={{ color: 'var(--lt-ink-soft)', fontWeight: 'normal' }}>(opcional)</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="lt-input resize-none"
                  placeholder="Explica brevemente por qué reportas este evento..."
                />
              </div>
            </div>

            {error && (
              <div
                className="border-2 border-[var(--lt-terracota)] px-4 py-2.5 rounded-[var(--lt-radius-sm)] text-sm flex items-center gap-2"
                style={{ background: 'var(--lt-bg)', color: 'var(--lt-terracota)' }}
              >
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <LtButton
                type="button"
                variant="outline"
                tone="paper"
                size="sm"
                className="flex-1"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </LtButton>
              <LtButton
                type="button"
                variant="sticker"
                tone="terracota"
                size="sm"
                className="flex-1"
                onClick={handleSubmit}
                disabled={loading || !reason}
                loading={loading}
                loadingText="Enviando..."
              >
                Enviar reporte
              </LtButton>
            </div>
          </LtPanel>
        </div>
      )}
    </>
  )
}
