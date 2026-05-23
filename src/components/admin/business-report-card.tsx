'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  dismissBusinessReport,
  deactivateReportedBusiness,
} from '@/app/(main)/admin/negocios/actions'
import { LtPanel, LtBadge, LtButton } from '@/components/lt'

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
    <LtPanel className="overflow-hidden border-[var(--lt-terracota)] hover:shadow-[var(--lt-shadow-sticker-lg)] transition-shadow p-0" shadow="md">
      {/* Header */}
      <div className="p-4 border-b-[2.2px] border-[var(--lt-ink)] flex justify-between items-start bg-[var(--lt-bg)]">
        <div>
          <p className="text-sm font-semibold text-[var(--lt-ink)]">
            {business.name}
          </p>
          <p className="text-xs text-[var(--lt-ink-soft)] mt-0.5">
            {business.city || 'Sin ciudad'} &bull; Dueño: {business.owner.name || business.owner.email}
          </p>
        </div>
        <LtBadge tone="terracota" className="shrink-0">
          ⚠️ {business._count.reports} reporte{business._count.reports !== 1 ? 's' : ''}
        </LtBadge>
      </div>

      {/* Reports */}
      <div className="p-4">
        <p className="text-xs font-semibold text-[var(--lt-terracota)] uppercase tracking-wide mb-2">
          Motivos de denuncia:
        </p>
        <ul className="text-xs text-[var(--lt-ink-soft)] space-y-2 list-disc pl-4">
          {business.reports.slice(0, 5).map((report) => (
            <li key={report.id}>
              <span className="font-medium text-[var(--lt-ink)]">
                {REASON_LABELS[report.reason] || report.reason}
              </span>
              {report.details && (
                <span className="text-[var(--lt-ink-soft)]"> - &ldquo;{report.details}&rdquo;</span>
              )}
              <div className="text-[var(--lt-ink-soft)] opacity-80 mt-0.5">
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
      <div className="p-3 bg-[var(--lt-bg)] border-t-[2.2px] border-[var(--lt-ink)] flex justify-end gap-2">
        <LtButton
          variant="outline"
          tone="paper"
          size="sm"
          onClick={handleDeactivate}
          disabled={isPending}
          loading={isPending}
          loadingText="Procesando..."
        >
          🚫 Desactivar Negocio
        </LtButton>
        <LtButton
          variant="sticker"
          tone="verde"
          size="sm"
          onClick={handleDismiss}
          disabled={isPending}
          loading={isPending}
          loadingText="Procesando..."
        >
          ✅ Descartar Reportes
        </LtButton>
      </div>
    </LtPanel>
  )
}
