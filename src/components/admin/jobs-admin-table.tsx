'use client'

import { useState } from 'react'
import {
  adminDeleteJobOffer,
  clearJobReports,
} from '@/app/(main)/admin/empleos/actions'
import {
  Trash2,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Edit,
} from 'lucide-react'
import Link from 'next/link'
import { LtPanel, LtBadge, LtButton } from '@/components/lt'

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
      <LtPanel className="text-center py-12" shadow="sm">
        <p className="text-[var(--lt-ink-soft)]">
          No hay ofertas de empleo activas en el sistema.
        </p>
      </LtPanel>
    )
  }

  return (
    <LtPanel className="overflow-hidden p-0" shadow="md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--lt-bg)] text-[var(--lt-ink-soft)] font-medium border-b-[2.2px] border-[var(--lt-ink)]">
            <tr>
              <th className="px-6 py-3">Oferta</th>
              <th className="px-6 py-3">Anunciante</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3 text-center">Reportes</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y-[2px] divide-[var(--lt-ink)]/15">
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-[var(--lt-bg)] transition-colors"
              >
                {/* Oferta */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--lt-ink)] line-clamp-1 max-w-[200px]">
                      {job.title}
                    </span>
                    <Link
                      href={`/empleos/${job.id}`}
                      target="_blank"
                      className="text-[var(--lt-accent)] hover:text-[var(--lt-terracota)]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="text-xs text-[var(--lt-ink-soft)]">
                    {job.category}
                  </div>
                </td>

                {/* Anunciante */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-[var(--lt-ink)]">
                    {job.user.name || 'Sin nombre'}
                  </div>
                  <div className="text-xs text-[var(--lt-ink-soft)]">
                    {job.user.email}
                  </div>
                </td>

                {/* Fecha */}
                <td className="px-6 py-4 text-[var(--lt-ink-soft)]">
                  {new Date(job.createdAt).toLocaleDateString('es-ES')}
                </td>

                {/* Reportes */}
                <td className="px-6 py-4 text-center">
                  {job.reportCount > 0 ? (
                    <LtBadge tone="terracota" className="inline-flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {job.reportCount}
                    </LtBadge>
                  ) : (
                    <span className="text-[var(--lt-ink-soft)] text-sm">
                      0
                    </span>
                  )}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 text-right space-x-2">
                  <Link
                    href={`/empleos/editar/${job.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-[var(--lt-ink)] text-[var(--lt-ink)] bg-[var(--lt-paper)] hover:bg-[var(--lt-bg)] rounded-[var(--lt-radius-sm)] transition-colors text-sm font-medium"
                    title="Editar oferta"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </Link>

                  {job.reportCount > 0 && (
                    <LtButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleClearReports(job.id)}
                      disabled={loadingActionId !== null}
                      loading={loadingActionId === `clear-${job.id}`}
                      loadingText="Limpiando..."
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Limpiar
                    </LtButton>
                  )}

                  <LtButton
                    variant="sticker"
                    tone="terracota"
                    size="sm"
                    onClick={() => handleDelete(job.id, job.title)}
                    disabled={loadingActionId !== null}
                    loading={loadingActionId === `delete-${job.id}`}
                    loadingText="Borrando..."
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </LtButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </LtPanel>
  )
}
