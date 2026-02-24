'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { approveReview, hideReview } from '@/app/(main)/admin/resenas/actions'

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    comment: string
    createdAt: Date
    reportCount: number
    user: { name: string | null; email: string; image: string | null }
    business: { name: string; slug: string }
    reports: { reason: string; details: string | null }[]
  }
}

export function ReviewModerationCard({ review }: ReviewCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isResolved, setIsResolved] = useState(false)

  const handleApprove = () => {
    startTransition(async () => {
      await approveReview(review.id)
      setIsResolved(true)
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      await hideReview(review.id, 'Contenido inapropiado confirmado por moderador')
      setIsResolved(true)
    })
  }

  if (isResolved) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header: Usuario y Negocio */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start bg-gray-50 dark:bg-slate-800/50">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
            {review.user.name?.[0] || 'U'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {review.user.name || 'Usuario Anónimo'}
              <span className="text-xs font-normal text-gray-500 ml-2">
                ({review.user.email})
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Reseñó a{' '}
              <span className="font-medium text-blue-600">
                {review.business.name}
              </span>{' '}
              •{' '}
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">
          ⚠️ {review.reportCount} Reportes
        </div>
      </div>

      {/* Contenido de la Reseña */}
      <div className="p-4">
        <div className="flex items-center mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-slate-900/50 p-3 rounded border border-dashed border-gray-200 dark:border-slate-700">
          &ldquo;{review.comment}&rdquo;
        </p>

        {/* Razones de los reportes */}
        {review.reports.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">
              Motivos de denuncia:
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc pl-4">
              {review.reports.slice(0, 3).map((rep, idx) => (
                <li key={idx}>
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    {rep.reason}
                  </span>
                  {rep.details && (
                    <span className="text-gray-500">
                      {' '}
                      - &ldquo;{rep.details}&rdquo;
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-2">
        <button
          onClick={handleReject}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Procesando...' : '🗑️ Eliminar'}
        </button>
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isPending ? 'Procesando...' : '✅ Aprobar y Publicar'}
        </button>
      </div>
    </div>
  )
}
