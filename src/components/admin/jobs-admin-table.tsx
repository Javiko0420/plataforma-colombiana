'use client'

import { useState } from 'react'
import {
  adminDeleteJobOffer,
  clearJobReports,
} from '@/app/admin/empleos/actions'
import {
  Trash2,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Edit,
} from 'lucide-react'
import Link from 'next/link'

type AdminJobOffer = {
  id: string
  title: string
  category: string
  createdAt: Date
  reportCount: number
  user: {
    name: string | null
    email: string | null
  }
}

export default function JobsAdminTable({ jobs }: { jobs: AdminJobOffer[] }) {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)

  const handleDelete = async (jobId: string, title: string) => {
    if (
      !window.confirm(
        `¿Estás seguro de que deseas ELIMINAR la oferta: "${title}"?\nEsta acción retirará el anuncio inmediatamente.`,
      )
    )
      return

    setLoadingActionId(`delete-${jobId}`)
    const res = await adminDeleteJobOffer(jobId)
    if (res?.error) alert(res.error)
    setLoadingActionId(null)
  }

  const handleClearReports = async (jobId: string) => {
    if (
      !window.confirm(
        '¿Confirmas que esta oferta es segura y deseas limpiar sus reportes?',
      )
    )
      return

    setLoadingActionId(`clear-${jobId}`)
    const res = await clearJobReports(jobId)
    if (res?.error) alert(res.error)
    setLoadingActionId(null)
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <p className="text-gray-500 dark:text-gray-400">
          No hay ofertas de empleo activas en el sistema.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3">Oferta</th>
              <th className="px-6 py-3">Anunciante</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3 text-center">Reportes</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                {/* Oferta */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">
                      {job.title}
                    </span>
                    <Link
                      href={`/empleos/${job.id}`}
                      target="_blank"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {job.category}
                  </div>
                </td>

                {/* Anunciante */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {job.user.name || 'Sin nombre'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {job.user.email}
                  </div>
                </td>

                {/* Fecha */}
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {new Date(job.createdAt).toLocaleDateString('es-ES')}
                </td>

                {/* Reportes */}
                <td className="px-6 py-4 text-center">
                  {job.reportCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {job.reportCount}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      0
                    </span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 text-right space-x-2">
                  <Link
                    href={`/empleos/editar/${job.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors"
                    title="Editar oferta"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>

                  {job.reportCount > 0 && (
                    <button
                      onClick={() => handleClearReports(job.id)}
                      disabled={loadingActionId !== null}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
                      title="Ignorar reportes y marcar como seguro"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {loadingActionId === `clear-${job.id}`
                        ? 'Limpiando...'
                        : 'Limpiar'}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(job.id, job.title)}
                    disabled={loadingActionId !== null}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-transparent bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-md transition-colors disabled:opacity-50"
                    title="Eliminar oferta"
                  >
                    <Trash2 className="w-4 h-4" />
                    {loadingActionId === `delete-${job.id}`
                      ? 'Borrando...'
                      : 'Eliminar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
