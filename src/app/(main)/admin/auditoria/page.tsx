import { prisma } from '@/lib/prisma'
import { AuditTable } from '@/components/admin/audit-table'
import { SecurityTable } from '@/components/admin/security-table'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const resolvedParams = await searchParams
  const tab = resolvedParams.tab || 'audit' // 'audit' o 'security'
  const page = Number(resolvedParams.page) || 1
  const pageSize = 20

  let content
  let totalItems = 0

  if (tab === 'security') {
    // Fetch Security Logs
    const [count, logs] = await Promise.all([
      prisma.securityLog.count(),
      prisma.securityLog.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ])
    totalItems = count
    content = <SecurityTable logs={logs} />
  } else {
    // Fetch Audit Logs (Default)
    const [count, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, image: true } },
        },
      }),
    ])
    totalItems = count
    content = (
      <AuditTable
        logs={logs}
        totalPages={Math.ceil(count / pageSize)}
        currentPage={page}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Centro de Auditoría
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro inmutable de todas las acciones del sistema y eventos de
            seguridad.
          </p>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <nav className="-mb-px flex space-x-8">
          <TabLink
            active={tab === 'audit'}
            href="/admin/auditoria?tab=audit"
            label="Cambios de Sistema"
            icon="📋"
          />
          <TabLink
            active={tab === 'security'}
            href="/admin/auditoria?tab=security"
            label="Seguridad & Accesos"
            icon="🛡️"
          />
        </nav>
      </div>

      {/* Contenido Dinámico */}
      {content}

      <div className="text-right text-xs text-gray-400">
        Mostrando últimos eventos. Total histórico: {totalItems}
      </div>
    </div>
  )
}

function TabLink({
  active,
  href,
  label,
  icon,
}: {
  active: boolean
  href: string
  label: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
        active
          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Link>
  )
}
