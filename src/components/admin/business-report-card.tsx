'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  dismissBusinessReport,
  deactivateReportedBusiness,
} from '@/app/(main)/admin/negocios/actions'

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
    <div className="lh-card" style={{ overflow: 'hidden', padding: 0, borderColor: 'color-mix(in oklch, var(--lh-terra) 35%, var(--lh-border))' }}>
      {/* Header */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--lh-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, background: 'var(--lh-surface2)' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>{business.name}</p>
          <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: '2px 0 0' }}>
            {business.city || 'Sin ciudad'} &bull; Dueño: {business.owner.name || business.owner.email}
          </p>
        </div>
        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 9px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)', color: 'var(--lh-terra)', fontSize: 11.5, fontWeight: 600 }}>
          ⚠️ {business._count.reports} reporte{business._count.reports !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Reports */}
      <div style={{ padding: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--lh-terra)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
          Motivos de denuncia:
        </p>
        <ul style={{ fontSize: 12, color: 'var(--lh-fg3)', listStyle: 'disc', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {business.reports.slice(0, 5).map((report) => (
            <li key={report.id}>
              <span style={{ fontWeight: 500, color: 'var(--lh-fg)' }}>{REASON_LABELS[report.reason] || report.reason}</span>
              {report.details && <span style={{ color: 'var(--lh-fg3)' }}> - &ldquo;{report.details}&rdquo;</span>}
              <div style={{ color: 'var(--lh-fg3)', opacity: 0.85, marginTop: 2 }}>
                Por: {report.reporter.name || report.reporter.email} &bull;{' '}
                {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true, locale: es })}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div style={{ padding: 12, background: 'var(--lh-surface2)', borderTop: '1px solid var(--lh-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={handleDeactivate} disabled={isPending} className="lh-btn lh-btn--sm lh-btn--secondary" style={{ color: 'var(--lh-terra)', borderColor: 'color-mix(in oklch, var(--lh-terra) 35%, transparent)', opacity: isPending ? 0.6 : 1 }}>
          🚫 Desactivar negocio
        </button>
        <button type="button" onClick={handleDismiss} disabled={isPending} className="lh-btn lh-btn--sm" style={{ background: 'var(--lh-green)', color: '#fff', opacity: isPending ? 0.6 : 1 }}>
          ✅ Descartar reportes
        </button>
      </div>
    </div>
  )
}
