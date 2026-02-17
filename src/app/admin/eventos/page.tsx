import { getAdminEvents } from './actions'
import EventsAdminTable from '@/components/admin/events-admin-table'
import { CalendarDays } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminEventosPage() {
  const response = await getAdminEvents()

  if (!response.success) {
    redirect('/admin')
  }

  const events = response.data || []

  const totalEvents = events.length
  const now = new Date()
  const activeEvents = events.filter(
    (evt) => new Date(evt.eventDate) >= now
  ).length
  const pastEvents = totalEvents - activeEvents

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Tabla de Moderación */}
      <EventsAdminTable events={events} />
    </div>
  )
}
