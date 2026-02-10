'use client'

import { useState } from 'react'
import { AccessibleModal } from '@/components/ui/accessible-modal'

// Mapeo de razones del Enum de Prisma a texto legible
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
      // Endpoint dinámico basado en el tipo de contenido
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

      if (!res.ok) throw new Error('Error al enviar reporte')

      // Reset y cierre
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ¿Cuál es el problema?
          </label>
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
                className={`p-3 rounded-md border cursor-pointer text-sm transition-all ${
                  reason === r.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {r.label}
              </div>
            ))}
          </div>
        </div>

        {reason === 'OTHER' && (
          <div>
            <label
              htmlFor="report-details"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Describe el problema
            </label>
            <textarea
              id="report-details"
              className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-transparent focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Proporciona detalles adicionales..."
              rows={3}
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              {500 - details.length} caracteres restantes
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
          </button>
        </div>
      </div>
    </AccessibleModal>
  )
}
