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
          <h1
            className="text-2xl font-bold text-[var(--lt-ink)]"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            Centro de Auditoría
          </h1>
          <p className="text-sm text-[var(--lt-ink-soft)] mt-1">
            Registro inmutable de todas las acciones del sistema y eventos de
            seguridad.
          </p>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="border-b-[2.2px] border-[var(--lt-ink)]">
        <nav className="-mb-[2.2px] flex space-x-8">
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

      <div className="text-right text-xs text-[var(--lt-ink-soft)]">
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
      className={`group inline-flex items-center py-4 px-1 border-b-[2.2px] font-medium text-sm transition-colors ${
        active
          ? 'border-[var(--lt-terracota)] text-[var(--lt-terracota)]'
          : 'border-transparent text-[var(--lt-ink-soft)] hover:text-[var(--lt-ink)] hover:border-[var(--lt-ink-soft)]'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Link>
  )
}
