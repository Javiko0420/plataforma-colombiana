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
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="lh-h2" style={{ fontSize: 'clamp(22px,3.4vw,28px)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Briefcase size={24} style={{ color: 'var(--lh-accent)' }} />
            Moderación de empleos
          </h1>
          <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '4px 0 0' }}>
            Revisa las publicaciones de la comunidad, gestiona reportes y elimina contenido inapropiado.
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--lh-fg3)', whiteSpace: 'nowrap' }}>
          Total: <span style={{ fontWeight: 700, color: 'var(--lh-fg)' }}>{totalJobs}</span> ofertas activas
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="lh-card" style={{ padding: 22 }}>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--lh-fg2)', margin: 0 }}>Total de ofertas activas</p>
          <p style={{ fontFamily: 'var(--lh-font)', fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: '8px 0 0' }}>{totalJobs}</p>
        </div>

        <div className="lh-card" style={{ padding: 22, borderColor: 'color-mix(in oklch, var(--lh-terra) 40%, var(--lh-border))' }}>
          <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--lh-fg2)', margin: 0 }}>Ofertas reportadas</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <p style={{ fontFamily: 'var(--lh-font)', fontSize: 28, fontWeight: 700, letterSpacing: '-.02em', color: reportedJobs > 0 ? 'var(--lh-terra)' : 'var(--lh-fg)', margin: 0 }}>{reportedJobs}</p>
            {reportedJobs > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)', color: 'var(--lh-terra)', fontSize: 12, fontWeight: 600 }}>
                <AlertCircle size={14} /> Requiere atención
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
