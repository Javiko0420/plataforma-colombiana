'use client'

import { useState } from 'react'
import { Flag, AlertTriangle, X } from 'lucide-react'
import { reportEvent } from '@/app/eventos/actions'

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
      <div className="flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500 py-2">
        <Flag className="w-4 h-4" />
        <span>Ya reportaste este evento</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center gap-2 w-full text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 py-2 rounded-xl transition-colors"
      >
        <Flag className="w-4 h-4" />
        Reportar evento
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Reportar evento
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tu reporte será revisado por moderación
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Motivo del reporte
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Detalles adicionales{' '}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  placeholder="Explica brevemente por qué reportas este evento..."
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !reason}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
