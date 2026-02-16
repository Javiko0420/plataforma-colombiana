import { getAdminJobOffers } from './actions'
import JobsAdminTable from '@/components/admin/jobs-admin-table'
import { AlertCircle, Briefcase } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminEmpleosPage() {
  const response = await getAdminJobOffers()

  if (response.error) {
    redirect('/admin')
  }

  const jobs = response.data || []

  const totalJobs = jobs.length
  const reportedJobs = jobs.filter((job) => job.reportCount > 0).length

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-blue-500" />
            Moderación de Ofertas de Empleo
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Revisa las publicaciones de la comunidad, gestiona reportes y
            elimina contenido inapropiado.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Total:{' '}
          <span className="font-bold text-gray-900 dark:text-white">
            {totalJobs}
          </span>{' '}
          ofertas activas
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total de Ofertas Activas
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {totalJobs}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2 bg-red-500" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Ofertas Reportadas
          </p>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {reportedJobs}
            </p>
            {reportedJobs > 0 && (
              <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                <AlertCircle className="w-4 h-4" /> Requiere atención
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de Moderación */}
      <JobsAdminTable jobs={jobs} />
    </div>
  )
}
