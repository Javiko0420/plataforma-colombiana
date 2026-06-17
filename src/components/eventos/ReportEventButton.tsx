'use client'

import { useState } from 'react'
import { Flag, AlertTriangle, X } from 'lucide-react'
import { reportEvent } from '@/app/(main)/eventos/actions'
import { Button } from '@/components/lh/Button'

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13.5, color: 'var(--lh-fg3)', padding: '8px 0' }}>
        <Flag size={15} aria-hidden="true" />
        <span>Ya reportaste este evento</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', fontSize: 13.5, padding: '8px 0', color: 'var(--lh-fg3)', background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'var(--lh-font)' }}
      >
        <Flag size={15} aria-hidden="true" />
        Reportar evento
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Reportar evento">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowModal(false)} aria-hidden="true" />

          <div className="relative w-full max-w-md" style={{ background: 'var(--lh-surface)', border: '1px solid var(--lh-border)', borderRadius: 20, boxShadow: 'var(--lh-shadow-lg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)', color: 'var(--lh-terra)' }} aria-hidden="true">
                  <AlertTriangle size={20} />
                </span>
                <div>
                  <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 17, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>Reportar evento</h3>
                  <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: '2px 0 0' }}>Tu reporte será revisado por moderación</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} aria-label="Cerrar" style={{ color: 'var(--lh-fg3)', background: 'transparent', border: 0, cursor: 'pointer', display: 'inline-flex', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label htmlFor="report-reason" className="lh-label">Motivo del reporte</label>
                <select id="report-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="lh-input">
                  <option value="">Selecciona un motivo…</option>
                  {REPORT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="report-details" className="lh-label">
                  Detalles adicionales <span style={{ color: 'var(--lh-fg3)', fontWeight: 400 }}>(opcional)</span>
                </label>
                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="lh-input"
                  style={{ resize: 'none' }}
                  placeholder="Explica brevemente por qué reportas este evento…"
                />
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, fontSize: 14, background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)', color: 'var(--lh-terra)' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, paddingTop: 2 }}>
              <Button type="button" variant="secondary" size="sm" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="primary" size="sm" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading || !reason}>
                {loading ? 'Enviando…' : 'Enviar reporte'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
