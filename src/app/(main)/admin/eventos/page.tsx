import { getAdminEvents, getReportedEvents } from './actions'
import EventsAdminTable from '@/components/admin/events-admin-table'
import ReportedEventsTable from '@/components/admin/reported-events-table'
import { CalendarDays, Flag } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminEventosPage() {
  const [eventsResponse, reportedResponse] = await Promise.all([
    getAdminEvents(),
    getReportedEvents(),
  ])

  if (!eventsResponse.success) {
    redirect('/admin')
  }

  const events = eventsResponse.data || []
  const reportedEvents = reportedResponse.success
    ? reportedResponse.data || []
    : []

  const totalEvents = events.length
  const now = new Date()
  const activeEvents = events.filter(
    (evt) => new Date(evt.eventDate) >= now
  ).length
  const pastEvents = totalEvents - activeEvents
  const reportedCount = reportedEvents.length

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="lh-h2" style={{ fontSize: 'clamp(22px,3.4vw,28px)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={24} style={{ color: 'var(--lh-warm)' }} />
            Moderación de eventos
          </h1>
          <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '4px 0 0' }}>
            Revisa los eventos publicados por la comunidad y elimina contenido inapropiado.
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--lh-fg3)', whiteSpace: 'nowrap' }}>
          Total: <span style={{ fontWeight: 700, color: 'var(--lh-fg)' }}>{totalEvents}</span> eventos
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatPanel label="Total de eventos" value={totalEvents} />
        <StatPanel label="Eventos activos" value={activeEvents} accent="var(--lh-green)" />
        <StatPanel label="Eventos finalizados" value={pastEvents} />
        <StatPanel label="Reportados" value={reportedCount} accent="var(--lh-terra)" />
      </div>

      {/* Cola de Moderación de Reportes */}
      {reportedCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flag size={18} style={{ color: 'var(--lh-terra)' }} />
            <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>Cola de moderación</h2>
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)', color: 'var(--lh-terra)', fontSize: 12, fontWeight: 600 }}>
              {reportedCount} pendiente{reportedCount !== 1 ? 's' : ''}
            </span>
          </div>
          <ReportedEventsTable events={reportedEvents} />
        </div>
      )}

      {/* Tabla de todos los Eventos */}
      <div className="space-y-4">
        <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>Todos los eventos</h2>
        <EventsAdminTable events={events} />
      </div>
    </div>
  )
}

function StatPanel({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="lh-card" style={{ padding: 22, borderColor: accent ? `color-mix(in oklch, ${accent} 40%, var(--lh-border))` : undefined }}>
      <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--lh-fg2)', margin: 0 }}>{label}</p>
      <p style={{ fontFamily: 'var(--lh-font)', fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', color: accent ?? 'var(--lh-fg)', margin: '8px 0 0' }}>{value}</p>
    </div>
  )
}
