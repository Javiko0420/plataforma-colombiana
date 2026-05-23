import { getAdminEvents, getReportedEvents } from './actions'
import EventsAdminTable from '@/components/admin/events-admin-table'
import ReportedEventsTable from '@/components/admin/reported-events-table'
import { CalendarDays, Flag } from 'lucide-react'
import { redirect } from 'next/navigation'
import { LtBadge, LtPanel } from '@/components/lt'

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
      <div className="flex justify-between items-end">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--lt-ink)] flex items-center gap-2"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            <CalendarDays className="h-6 w-6 text-[var(--lt-terracota)]" />
            Moderación de Eventos
          </h1>
          <p className="text-sm text-[var(--lt-ink-soft)] mt-1">
            Revisa los eventos publicados por la comunidad y elimina contenido
            inapropiado.
          </p>
        </div>
        <div className="text-right text-xs text-[var(--lt-ink-soft)]">
          Total:{' '}
          <span className="font-bold text-[var(--lt-ink)]">
            {totalEvents}
          </span>{' '}
          eventos registrados
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <LtPanel className="p-6" shadow="sm">
          <p className="text-sm font-medium text-[var(--lt-ink-soft)]">
            Total de Eventos
          </p>
          <p
            className="text-3xl font-bold text-[var(--lt-ink)] mt-2"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            {totalEvents}
          </p>
        </LtPanel>

        <LtPanel className="p-6 relative overflow-hidden border-[var(--lt-verde)]" shadow="sm">
          <div className="absolute right-0 top-0 h-full w-2 bg-[var(--lt-verde)]" />
          <p className="text-sm font-medium text-[var(--lt-ink-soft)]">
            Eventos Activos
          </p>
          <p
            className="text-3xl font-bold text-[var(--lt-ink)] mt-2"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            {activeEvents}
          </p>
        </LtPanel>

        <LtPanel className="p-6 relative overflow-hidden" shadow="sm">
          <div className="absolute right-0 top-0 h-full w-2 bg-[var(--lt-ink-soft)]" />
          <p className="text-sm font-medium text-[var(--lt-ink-soft)]">
            Eventos Finalizados
          </p>
          <p
            className="text-3xl font-bold text-[var(--lt-ink)] mt-2"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            {pastEvents}
          </p>
        </LtPanel>

        <LtPanel className="p-6 relative overflow-hidden border-[var(--lt-terracota)]" shadow="sm">
          <div className="absolute right-0 top-0 h-full w-2 bg-[var(--lt-terracota)]" />
          <p className="text-sm font-medium text-[var(--lt-ink-soft)]">
            Reportados
          </p>
          <p
            className="text-3xl font-bold text-[var(--lt-ink)] mt-2"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            {reportedCount}
          </p>
        </LtPanel>
      </div>

      {/* Cola de Moderación de Reportes */}
      {reportedCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-[var(--lt-terracota)]" />
            <h2
              className="text-lg font-bold text-[var(--lt-ink)]"
              style={{ fontFamily: 'var(--lt-font-serif)' }}
            >
              Cola de Moderación
            </h2>
            <LtBadge tone="terracota">
              {reportedCount} pendiente{reportedCount !== 1 ? 's' : ''}
            </LtBadge>
          </div>
          <ReportedEventsTable events={reportedEvents} />
        </div>
      )}

      {/* Tabla de todos los Eventos */}
      <div className="space-y-4">
        <h2
          className="text-lg font-bold text-[var(--lt-ink)]"
          style={{ fontFamily: 'var(--lt-font-serif)' }}
        >
          Todos los Eventos
        </h2>
        <EventsAdminTable events={events} />
      </div>
    </div>
  )
}
