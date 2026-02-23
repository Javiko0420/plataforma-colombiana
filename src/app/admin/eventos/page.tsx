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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-red-500" />
            Moderación de Eventos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Revisa los eventos publicados por la comunidad y elimina contenido
            inapropiado.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Total:{' '}
          <span className="font-bold text-gray-900 dark:text-white">
            {totalEvents}
          </span>{' '}
          eventos registrados
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total de Eventos
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {totalEvents}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-green-200 dark:border-green-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-green-500" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Eventos Activos
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {activeEvents}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-gray-400" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Eventos Finalizados
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {pastEvents}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-red-500" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Reportados
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {reportedCount}
          </p>
        </div>
      </div>

      {/* Cola de Moderación de Reportes */}
      {reportedCount > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Cola de Moderación
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {reportedCount} pendiente{reportedCount !== 1 ? 's' : ''}
            </span>
          </div>
          <ReportedEventsTable events={reportedEvents} />
        </div>
      )}

      {/* Tabla de todos los Eventos */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Todos los Eventos
        </h2>
        <EventsAdminTable events={events} />
      </div>
    </div>
  )
}
