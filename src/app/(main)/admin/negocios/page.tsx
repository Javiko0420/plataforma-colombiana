import { prisma } from '@/lib/prisma'
import { BusinessTable } from '@/components/admin/business-table'
import { BusinessReportCard } from '@/components/admin/business-report-card'
import { LtBadge } from '@/components/lt'
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
          <div className="flex justify-between items-center">
            <div>
              <h2
                className="text-xl font-bold text-[var(--lt-terracota)]"
                style={{ fontFamily: 'var(--lt-font-serif)' }}
              >
                Negocios Reportados
              </h2>
              <p className="text-sm text-[var(--lt-ink-soft)] mt-1">
                Negocios con reportes pendientes de revisión por la comunidad.
              </p>
            </div>
            <LtBadge tone="terracota">
              {reportedBusinesses.length} pendiente{reportedBusinesses.length !== 1 ? 's' : ''}
            </LtBadge>
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
        <div className="flex justify-between items-end">
          <div>
            <h1
              className="text-2xl font-bold text-[var(--lt-ink)]"
              style={{ fontFamily: 'var(--lt-font-serif)' }}
            >
              Gestión de Negocios
            </h1>
            <p className="text-sm text-[var(--lt-ink-soft)] mt-1">
              Administra el directorio, verifica empresas y gestiona la
              visibilidad.
            </p>
          </div>
          <div className="text-right text-xs text-[var(--lt-ink-soft)]">
            Total:{' '}
            <span className="font-bold text-[var(--lt-ink)]">
              {totalItems}
            </span>{' '}
            negocios encontrados
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
