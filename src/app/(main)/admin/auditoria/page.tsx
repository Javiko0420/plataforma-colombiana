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
          <h1 className="lh-h2" style={{ fontSize: 'clamp(22px,3.4vw,28px)', margin: 0 }}>Centro de auditoría</h1>
          <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '4px 0 0' }}>
            Registro inmutable de todas las acciones del sistema y eventos de seguridad.
          </p>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div style={{ borderBottom: '1px solid var(--lh-border)' }}>
        <nav className="flex space-x-8" style={{ marginBottom: -1 }}>
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

      <div style={{ textAlign: 'right', fontSize: 12.5, color: 'var(--lh-fg3)' }}>
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
      className="inline-flex items-center"
      style={{
        padding: '14px 4px', borderBottom: '2px solid',
        fontWeight: 500, fontSize: 14, transition: 'color .18s, border-color .18s',
        borderColor: active ? 'var(--lh-accent)' : 'transparent',
        color: active ? 'var(--lh-accent)' : 'var(--lh-fg2)',
      }}
    >
      <span style={{ marginRight: 8 }}>{icon}</span>
      {label}
    </Link>
  )
}
