'use client'

import { useState } from 'react'
import {
  approveReportedEvent,
  rejectReportedEvent,
} from '@/app/admin/eventos/actions'
import {
  ShieldCheck,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Flag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type ReportedEvent = {
  id: string
  title: string
  category: string
  eventDate: Date
  location: string
  isHidden: boolean
  user: { name: string | null; email: string }
  reports: {
    id: string
    reason: string
    details: string | null
    createdAt: Date
    reporter: { name: string | null; email: string }
  }[]
  _count: { reports: number }
}

const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  HARASSMENT: 'Acoso',
  HATE_SPEECH: 'Discurso de odio',
  INAPPROPRIATE_CONTENT: 'Contenido inapropiado',
  MISINFORMATION: 'Información falsa',
  OTHER: 'Otro',
}

export default function ReportedEventsTable({
  events,
}: {
  events: ReportedEvent[]
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleApprove = async (eventId: string, title: string) => {
    if (
      !window.confirm(
        `¿Restaurar el evento "${title}"?\nEsto lo hará visible de nuevo en el muro público y descartará los reportes.`
      )
    )
      return

    setLoadingId(`approve-${eventId}`)
    const res = await approveReportedEvent(eventId)
    if (!res.success) alert(res.error)
    setLoadingId(null)
  }

  const handleReject = async (eventId: string, title: string) => {
    if (
      !window.confirm(
        `¿ELIMINAR permanentemente el evento "${title}"?\nEsta acción es irreversible.`
      )
    )
      return

    setLoadingId(`reject-${eventId}`)
    const res = await rejectReportedEvent(eventId)
    if (!res.success) alert(res.error)
    setLoadingId(null)
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <ShieldCheck className="h-12 w-12 text-green-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          No hay eventos reportados pendientes de revisión.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((evt) => {
        const isExpanded = expandedId === evt.id

        return (
          <div
            key={evt.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {evt.title}
                    </h3>
                    <Link
                      href={`/eventos/${evt.id}`}
                      target="_blank"
                      className="text-blue-500 hover:text-blue-700 shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{evt.category}</span>
                    <span>·</span>
                    <span>{evt.location}</span>
                    <span>·</span>
                    <span>
                      Organizador: {evt.user.name ?? evt.user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                    <Flag className="w-3.5 h-3.5" />
                    {evt._count.reports}{' '}
                    {evt._count.reports === 1 ? 'reporte' : 'reportes'}
                  </span>
                  {evt.isHidden && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Oculto
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : evt.id)
                  }
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {isExpanded ? 'Ocultar reportes' : 'Ver reportes'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(evt.id, evt.title)}
                    disabled={loadingId !== null}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800/50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {loadingId === `approve-${evt.id}`
                      ? 'Aprobando...'
                      : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => handleReject(evt.id, evt.title)}
                    disabled={loadingId !== null}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {loadingId === `reject-${evt.id}`
                      ? 'Eliminando...'
                      : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>

            {isExpanded && evt.reports.length > 0 && (
              <div className="border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-5 py-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Reportes pendientes
                </h4>
                <div className="space-y-3">
                  {evt.reports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white dark:bg-slate-800 rounded-lg p-3.5 border border-gray-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                          {REASON_LABELS[report.reason] ?? report.reason}
                        </span>
                        <span className="text-xs text-gray-400">
                          {format(new Date(report.createdAt), "d MMM, yyyy · HH:mm", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      {report.details && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {report.details}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        Reportado por:{' '}
                        <span className="font-medium text-gray-600 dark:text-gray-300">
                          {report.reporter.name ?? report.reporter.email}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
