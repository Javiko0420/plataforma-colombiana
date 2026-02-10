import { prisma } from '@/lib/prisma'
import { UsersTable } from '@/components/admin/users-table'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  const page = Number(resolvedParams.page) || 1
  const pageSize = 15

  // Filtro
  const whereClause: Prisma.UserWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      }
    : {}

  const [totalUsers, users] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    }),
  ])

  const totalPages = Math.ceil(totalUsers / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra roles, permisos y accesos a la plataforma.
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Total:{' '}
          <span className="font-bold text-gray-900 dark:text-white">
            {totalUsers}
          </span>{' '}
          usuarios
        </div>
      </div>

      <UsersTable
        users={users}
        totalPages={totalPages}
        currentPage={page}
        currentUserId={session?.user?.id || ''}
      />
    </div>
  )
}
