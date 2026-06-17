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

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`
const chip = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99,
  background: tint(color), color, fontSize: 11.5, fontWeight: 600,
})

export default function ReportedEventsTable({ events }: { events: ReportedEvent[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleApprove = async (eventId: string, title: string) => {
    if (!window.confirm(`¿Restaurar el evento "${title}"?\nEsto lo hará visible de nuevo en el muro público y descartará los reportes.`)) return
    setLoadingId(`approve-${eventId}`)
    const res = await approveReportedEvent(eventId)
    if (!res.success) alert(res.error)
    setLoadingId(null)
  }

  const handleReject = async (eventId: string, title: string) => {
    if (!window.confirm(`¿ELIMINAR permanentemente el evento "${title}"?\nEsta acción es irreversible.`)) return
    setLoadingId(`reject-${eventId}`)
    const res = await rejectReportedEvent(eventId)
    if (!res.success) alert(res.error)
    setLoadingId(null)
  }

  if (events.length === 0) {
    return (
      <div className="lh-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <ShieldCheck size={44} style={{ color: 'var(--lh-green)', margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--lh-fg2)', fontWeight: 500, margin: 0 }}>No hay eventos reportados pendientes de revisión.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((evt) => {
        const isExpanded = expandedId === evt.id
        return (
          <div key={evt.id} className="lh-card" style={{ overflow: 'hidden', padding: 0, borderColor: 'color-mix(in oklch, var(--lh-terra) 35%, var(--lh-border))' }}>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 className="truncate" style={{ fontFamily: 'var(--lh-font)', fontWeight: 600, fontSize: 16, color: 'var(--lh-fg)', margin: 0 }}>{evt.title}</h3>
                    <Link href={`/eventos/${evt.id}`} target="_blank" style={{ color: 'var(--lh-accent)', flexShrink: 0, display: 'inline-flex' }}>
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--lh-fg3)' }}>
                    <span>{categoryLabel(EVENT_CATEGORIES, evt.category)}</span>
                    <span>·</span>
                    <span>{evt.location}</span>
                    <span>·</span>
                    <span>Organizador: {evt.user.name ?? evt.user.email}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={chip('var(--lh-terra)')}><Flag size={13} /> {evt._count.reports} {evt._count.reports === 1 ? 'reporte' : 'reportes'}</span>
                  {evt.isHidden && <span style={chip('var(--lh-warm)')}><AlertTriangle size={13} /> Oculto</span>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--lh-border2)' }}>
                <button onClick={() => setExpandedId(isExpanded ? null : evt.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--lh-fg2)', background: 'transparent', border: 0, cursor: 'pointer' }}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {isExpanded ? 'Ocultar reportes' : 'Ver reportes'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button type="button" onClick={() => handleApprove(evt.id, evt.title)} disabled={loadingId !== null} className="lh-btn lh-btn--sm" style={{ background: 'var(--lh-green)', color: '#fff', opacity: loadingId !== null ? 0.6 : 1 }}>
                    <ShieldCheck size={15} /> {loadingId === `approve-${evt.id}` ? 'Aprobando…' : 'Aprobar'}
                  </button>
                  <button type="button" onClick={() => handleReject(evt.id, evt.title)} disabled={loadingId !== null} className="lh-btn lh-btn--sm" style={{ background: 'var(--lh-terra)', color: '#fff', opacity: loadingId !== null ? 0.6 : 1 }}>
                    <Trash2 size={15} /> {loadingId === `reject-${evt.id}` ? 'Eliminando…' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>

            {isExpanded && evt.reports.length > 0 && (
              <div style={{ borderTop: '1px solid var(--lh-border)', background: 'var(--lh-surface2)', padding: '16px 20px' }}>
                <h4 style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, fontWeight: 600, color: 'var(--lh-fg3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Reportes pendientes</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {evt.reports.map((report) => (
                    <div key={report.id} style={{ padding: 14, borderRadius: 12, background: 'var(--lh-surface)', border: '1px solid var(--lh-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
                        <span style={chip('var(--lh-terra)')}>{REASON_LABELS[report.reason] ?? report.reason}</span>
                        <span style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>{format(new Date(report.createdAt), "d MMM, yyyy · HH:mm", { locale: es })}</span>
                      </div>
                      {report.details && <p style={{ fontSize: 14, color: 'var(--lh-fg)', margin: '0 0 8px' }}>{report.details}</p>}
                      <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: 0 }}>
                        Reportado por: <span style={{ fontWeight: 500, color: 'var(--lh-fg)' }}>{report.reporter.name ?? report.reporter.email}</span>
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
