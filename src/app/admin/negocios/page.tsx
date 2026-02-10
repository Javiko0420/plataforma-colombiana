import { prisma } from '@/lib/prisma'
import { BusinessTable } from '@/components/admin/business-table'
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
      // Filtro de búsqueda (Texto)
      query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { city: { contains: query, mode: 'insensitive' } },
              // Búsqueda profunda por email del dueño
              { owner: { email: { contains: query, mode: 'insensitive' } } },
            ],
          }
        : {},
      // Filtros de estado
      filter === 'pending' ? { isVerified: false } : {},
      filter === 'verified' ? { isVerified: true } : {},
      filter === 'inactive' ? { isActive: false } : {},
    ],
  }

  // Ejecución paralela (Count + Data) para paginación
  const [totalItems, businesses] = await Promise.all([
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
  ])

  const totalPages = Math.ceil(totalItems / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Negocios
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra el directorio, verifica empresas y gestiona la
            visibilidad.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Total:{' '}
          <span className="font-bold text-gray-900 dark:text-white">
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
  )
}
