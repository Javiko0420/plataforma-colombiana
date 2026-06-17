'use client'

import { useState } from 'react'
import {
  adminDeleteJobOffer,
  clearJobReports,
} from '@/app/(main)/admin/empleos/actions'
import { JOB_CATEGORIES, categoryLabel } from '@/lib/constants/categories'
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
    if (!window.confirm(`¿Estás seguro de que deseas ELIMINAR la oferta: "${title}"?\nEsta acción retirará el anuncio inmediatamente.`)) return
    setLoadingActionId(`delete-${jobId}`)
    const res = await adminDeleteJobOffer(jobId)
    if (res?.error) alert(res.error)
    setLoadingActionId(null)
  }

  const handleClearReports = async (jobId: string) => {
    if (!window.confirm('¿Confirmas que esta oferta es segura y deseas limpiar sus reportes?')) return
    setLoadingActionId(`clear-${jobId}`)
    const res = await clearJobReports(jobId)
    if (res?.error) alert(res.error)
    setLoadingActionId(null)
  }

  if (jobs.length === 0) {
    return (
      <div className="lh-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ color: 'var(--lh-fg2)', margin: 0 }}>No hay ofertas de empleo activas en el sistema.</p>
      </div>
    )
  }

  return (
    <div className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="lh-table">
          <thead>
            <tr>
              <th>Oferta</th>
              <th>Anunciante</th>
              <th>Fecha</th>
              <th style={{ textAlign: 'center' }}>Reportes</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="line-clamp-1" style={{ fontWeight: 600, color: 'var(--lh-fg)', maxWidth: 200 }}>{job.title}</span>
                    <Link href={`/empleos/${job.id}`} target="_blank" style={{ color: 'var(--lh-accent)', display: 'inline-flex' }}>
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>{categoryLabel(JOB_CATEGORIES, job.category)}</div>
                </td>
                <td>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-fg)' }}>{job.user.name || 'Sin nombre'}</div>
                  <div style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>{job.user.email}</div>
                </td>
                <td style={{ color: 'var(--lh-fg3)' }}>{new Date(job.createdAt).toLocaleDateString('es-ES')}</td>
                <td style={{ textAlign: 'center' }}>
                  {job.reportCount > 0 ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)', color: 'var(--lh-terra)', fontSize: 12, fontWeight: 600 }}>
                      <AlertTriangle size={13} /> {job.reportCount}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--lh-fg3)', fontSize: 14 }}>0</span>
                  )}
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Link href={`/empleos/editar/${job.id}`} className="lh-btn lh-btn--sm lh-btn--secondary" title="Editar oferta">
                      <Edit size={15} /> Editar
                    </Link>
                    {job.reportCount > 0 && (
                      <button type="button" onClick={() => handleClearReports(job.id)} disabled={loadingActionId !== null} className="lh-btn lh-btn--sm lh-btn--secondary" style={{ opacity: loadingActionId !== null ? 0.6 : 1 }}>
                        <ShieldCheck size={15} /> {loadingActionId === `clear-${job.id}` ? 'Limpiando…' : 'Limpiar'}
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(job.id, job.title)} disabled={loadingActionId !== null} className="lh-btn lh-btn--sm" style={{ background: 'var(--lh-terra)', color: '#fff', opacity: loadingActionId !== null ? 0.6 : 1 }}>
                      <Trash2 size={15} /> {loadingActionId === `delete-${job.id}` ? 'Borrando…' : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
