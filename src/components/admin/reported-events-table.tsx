'use client'

import { useState } from 'react'
import {
  approveReportedEvent,
  rejectReportedEvent,
} from '@/app/(main)/admin/eventos/actions'
import { EVENT_CATEGORIES, categoryLabel } from '@/lib/constants/categories'
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
import { LtPanel, LtBadge, LtButton } from '@/components/lt'

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
      <LtPanel className="text-center py-12" shadow="sm">
        <ShieldCheck className="h-12 w-12 text-[var(--lt-verde)] mx-auto mb-3" />
        <p className="text-[var(--lt-ink-soft)] font-medium">
          No hay eventos reportados pendientes de revisión.
        </p>
      </LtPanel>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((evt) => {
        const isExpanded = expandedId === evt.id

        return (
          <LtPanel
            key={evt.id}
            className="overflow-hidden p-0 border-[var(--lt-terracota)]"
            shadow="md"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-bold text-[var(--lt-ink)] truncate"
                      style={{ fontFamily: 'var(--lt-font-serif)' }}
                    >
                      {evt.title}
                    </h3>
                    <Link
                      href={`/eventos/${evt.id}`}
                      target="_blank"
                      className="text-[var(--lt-accent)] hover:text-[var(--lt-terracota)] shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--lt-ink-soft)]">
                    <span>{categoryLabel(EVENT_CATEGORIES, evt.category)}</span>
                    <span>·</span>
                    <span>{evt.location}</span>
                    <span>·</span>
                    <span>
                      Organizador: {evt.user.name ?? evt.user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <LtBadge tone="terracota" className="inline-flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5" />
                    {evt._count.reports}{' '}
                    {evt._count.reports === 1 ? 'reporte' : 'reportes'}
                  </LtBadge>
                  {evt.isHidden && (
                    <LtBadge tone="sun" className="inline-flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Oculto
                    </LtBadge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t-[2px] border-[var(--lt-ink)]/15">
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : evt.id)
                  }
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--lt-ink-soft)] hover:text-[var(--lt-ink)] transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {isExpanded ? 'Ocultar reportes' : 'Ver reportes'}
                </button>

                <div className="flex items-center gap-2">
                  <LtButton
                    variant="sticker"
                    tone="verde"
                    size="sm"
                    onClick={() => handleApprove(evt.id, evt.title)}
                    disabled={loadingId !== null}
                    loading={loadingId === `approve-${evt.id}`}
                    loadingText="Aprobando..."
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Aprobar
                  </LtButton>
                  <LtButton
                    variant="sticker"
                    tone="terracota"
                    size="sm"
                    onClick={() => handleReject(evt.id, evt.title)}
                    disabled={loadingId !== null}
                    loading={loadingId === `reject-${evt.id}`}
                    loadingText="Eliminando..."
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </LtButton>
                </div>
              </div>
            </div>

            {isExpanded && evt.reports.length > 0 && (
              <div className="border-t-[2.2px] border-[var(--lt-ink)] bg-[var(--lt-bg)] px-5 py-4">
                <h4 className="text-xs font-semibold text-[var(--lt-ink-soft)] uppercase tracking-wider mb-3">
                  Reportes pendientes
                </h4>
                <div className="space-y-3">
                  {evt.reports.map((report) => (
                    <LtPanel key={report.id} className="p-3.5" shadow="sm" tone="paper">
                      <div className="flex items-center justify-between mb-1.5">
                        <LtBadge tone="terracota">
                          {REASON_LABELS[report.reason] ?? report.reason}
                        </LtBadge>
                        <span className="text-xs text-[var(--lt-ink-soft)]">
                          {format(new Date(report.createdAt), "d MMM, yyyy · HH:mm", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      {report.details && (
                        <p className="text-sm text-[var(--lt-ink)] mb-2">
                          {report.details}
                        </p>
                      )}
                      <p className="text-xs text-[var(--lt-ink-soft)]">
                        Reportado por:{' '}
                        <span className="font-medium text-[var(--lt-ink)]">
                          {report.reporter.name ?? report.reporter.email}
                        </span>
                      </p>
                    </LtPanel>
                  ))}
                </div>
              </div>
            )}
          </LtPanel>
        )
      })}
    </div>
  )
}
