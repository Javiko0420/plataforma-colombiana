'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  dismissBusinessReport,
  deactivateReportedBusiness,
} from '@/app/admin/negocios/actions'

/** Maps Prisma ReportReason enum to readable Spanish labels */
const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam o publicidad',
  HARASSMENT: 'Acoso',
  HATE_SPEECH: 'Discurso de odio',
  INAPPROPRIATE_CONTENT: 'Contenido inapropiado',
  MISINFORMATION: 'Información falsa',
  OTHER: 'Otro motivo',
}

interface BusinessReportCardProps {
  business: {
    id: string
    name: string
    slug: string
    city: string | null
    isActive: boolean
    owner: { name: string | null; email: string }
    reports: {
      id: string
      reason: string
      details: string | null
      createdAt: Date
      reporter: { name: string | null; email: string }
    }[]
    _count: { reports: number }
  }
}

export function BusinessReportCard({ business }: BusinessReportCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isDismissed, setIsDismissed] = useState(false)

  const handleDismiss = () => {
    startTransition(async () => {
      const reportIds = business.reports.map((r) => r.id)
      await dismissBusinessReport(business.id, reportIds)
      setIsDismissed(true)
    })
  }

  const handleDeactivate = () => {
    startTransition(async () => {
      await deactivateReportedBusiness(business.id)
      setIsDismissed(true)
    })
  }

  if (isDismissed) return null

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-900/30 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-start bg-red-50/50 dark:bg-red-900/10">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {business.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {business.city || 'Sin ciudad'} &bull; Dueño: {business.owner.name || business.owner.email}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded text-xs font-bold shrink-0">
          ⚠️ {business._count.reports} reporte{business._count.reports !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Reports */}
      <div className="p-4">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
          Motivos de denuncia:
        </p>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 list-disc pl-4">
          {business.reports.slice(0, 5).map((report) => (
            <li key={report.id}>
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {REASON_LABELS[report.reason] || report.reason}
              </span>
              {report.details && (
                <span className="text-gray-500"> - &ldquo;{report.details}&rdquo;</span>
              )}
              <div className="text-gray-400 mt-0.5">
                Por: {report.reporter.name || report.reporter.email} &bull;{' '}
                {formatDistanceToNow(new Date(report.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-2">
        <button
          onClick={handleDeactivate}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Procesando...' : '🚫 Desactivar Negocio'}
        </button>
        <button
          onClick={handleDismiss}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {isPending ? 'Procesando...' : '✅ Descartar Reportes'}
        </button>
      </div>
    </div>
  )
}
