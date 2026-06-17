import { prisma } from '@/lib/prisma'
import { BusinessTable } from '@/components/admin/business-table'
import { BusinessReportCard } from '@/components/admin/business-report-card'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; filter?: string }>
}) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  const page = Number(resolvedParams.page) || 1
  const filter = resolvedParams.filter || 'all'
  const pageSize = 10

  // Construcción dinámica del filtro WHERE
  const whereClause: Prisma.BusinessWhereInput = {
    AND: [
      query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
              { owner: { email: { contains: query, mode: 'insensitive' } } },
            ],
          }
        : {},
      filter === 'pending' ? { isVerified: false } : {},
      filter === 'verified' ? { isVerified: true } : {},
      filter === 'inactive' ? { isActive: false } : {},
    ],
  }

  // Ejecución paralela: directorio + reportes pendientes de negocios
  const [totalItems, businesses, reportedBusinesses] = await Promise.all([
    prisma.business.count({ where: whereClause }),
    prisma.business.findMany({
      where: whereClause,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { name: true, email: true },
        },
      },
    }),
    // Negocios con reportes pendientes de moderación
    prisma.business.findMany({
      where: {
        reports: {
          some: { status: 'PENDING' },
        },
      },
      include: {
        owner: { select: { name: true, email: true } },
        reports: {
          where: { status: 'PENDING' },
          select: {
            id: true,
            reason: true,
            details: true,
            createdAt: true,
            reporter: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            reports: { where: { status: 'PENDING' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div className="space-y-8">
      {/* Sección: Negocios Reportados (prioridad alta) */}
      {reportedBusinesses.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div>
              <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 20, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-terra)', margin: 0 }}>
                Negocios reportados
              </h2>
              <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '4px 0 0' }}>
                Negocios con reportes pendientes de revisión por la comunidad.
              </p>
            </div>
            <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: '5px 11px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)', color: 'var(--lh-terra)', fontSize: 12.5, fontWeight: 600 }}>
              {reportedBusinesses.length} pendiente{reportedBusinesses.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reportedBusinesses.map((business) => (
              <BusinessReportCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      )}

      {/* Sección: Gestión General del Directorio */}
      <div className="space-y-6">
        <div className="flex justify-between items-end gap-4">
          <div>
            <h1 className="lh-h2" style={{ fontSize: 'clamp(22px,3.4vw,28px)', margin: 0 }}>Gestión de negocios</h1>
            <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '4px 0 0' }}>
              Administra el directorio, verifica empresas y gestiona la visibilidad.
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--lh-fg3)', whiteSpace: 'nowrap' }}>
            Total: <span style={{ fontWeight: 700, color: 'var(--lh-fg)' }}>{totalItems}</span> negocios
          </div>
        </div>

        <BusinessTable
          businesses={businesses}
          totalPages={totalPages}
          currentPage={page}
        />
      </div>
    </div>
  )
}
