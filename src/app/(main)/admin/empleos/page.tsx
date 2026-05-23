import { getAdminJobOffers } from './actions'
import JobsAdminTable from '@/components/admin/jobs-admin-table'
import { AlertCircle, Briefcase } from 'lucide-react'
import { redirect } from 'next/navigation'
import { LtBadge, LtPanel } from '@/components/lt'

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
          <h1
            className="text-2xl font-bold text-[var(--lt-ink)] flex items-center gap-2"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            <Briefcase className="h-6 w-6 text-[var(--lt-accent)]" />
            Moderación de Ofertas de Empleo
          </h1>
          <p className="text-sm text-[var(--lt-ink-soft)] mt-1">
            Revisa las publicaciones de la comunidad, gestiona reportes y
            elimina contenido inapropiado.
          </p>
        </div>
        <div className="text-right text-xs text-[var(--lt-ink-soft)]">
          Total:{' '}
          <span className="font-bold text-[var(--lt-ink)]">
            {totalJobs}
          </span>{' '}
          ofertas activas
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LtPanel className="p-6" shadow="sm">
          <p className="text-sm font-medium text-[var(--lt-ink-soft)]">
            Total de Ofertas Activas
          </p>
          <p
            className="text-3xl font-bold text-[var(--lt-ink)] mt-2"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            {totalJobs}
          </p>
        </LtPanel>

        <LtPanel className="p-6 relative overflow-hidden border-[var(--lt-terracota)]" shadow="sm">
          <div className="absolute right-0 top-0 h-full w-2 bg-[var(--lt-terracota)]" />
          <p className="text-sm font-medium text-[var(--lt-ink-soft)]">
            Ofertas Reportadas
          </p>
          <div className="flex items-center gap-3 mt-2">
            <p
              className="text-3xl font-bold text-[var(--lt-ink)]"
              style={{ fontFamily: 'var(--lt-font-serif)' }}
            >
              {reportedJobs}
            </p>
            {reportedJobs > 0 && (
              <LtBadge tone="terracota" className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Requiere atención
              </LtBadge>
            )}
          </div>
        </LtPanel>
      </div>

      {/* Tabla de Moderación */}
      <JobsAdminTable jobs={jobs} />
    </div>
  )
}
