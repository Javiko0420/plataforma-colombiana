'use client'

import { Fragment, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { JsonValue } from '@prisma/client/runtime/library'
import { LtPanel } from '@/components/lt'

interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId: string | null
  oldValues: JsonValue
  newValues: JsonValue
  ip: string | null
  userAgent: string | null
  createdAt: Date
  user: { name: string | null } | null
}

interface AuditTableProps {
  logs: AuditLog[]
  totalPages: number
  currentPage: number
}

export function AuditTable({
  logs,
  totalPages,
  currentPage,
}: AuditTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <LtPanel className="overflow-hidden p-0" shadow="md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--lt-bg)] text-[var(--lt-ink-soft)] font-medium border-b-[2.2px] border-[var(--lt-ink)]">
            <tr>
              <th className="px-6 py-3">Actor</th>
              <th className="px-6 py-3">Acción</th>
              <th className="px-6 py-3">Recurso</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3 text-right">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y-[2px] divide-[var(--lt-ink)]/15">
            {logs.map((log) => (
              <Fragment key={log.id}>
                <tr className="hover:bg-[var(--lt-bg)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--lt-sun)] border-[2px] border-[var(--lt-ink)] flex items-center justify-center text-[10px] font-bold text-[var(--lt-ink)]">
                        {log.user?.name?.[0] || '?'}
                      </div>
                      <span className="font-medium text-[var(--lt-ink)]">
                        {log.user?.name || 'Sistema'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-[var(--lt-bg)] text-[var(--lt-ink)] px-2 py-1 rounded-[var(--lt-radius-sm)] border-[2px] border-[var(--lt-ink)]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--lt-ink-soft)]">
                    {log.resource}{' '}
                    <span className="text-xs opacity-50">
                      #{log.resourceId?.slice(-4)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--lt-ink-soft)]">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleRow(log.id)}
                      className="text-[var(--lt-accent)] hover:text-[var(--lt-terracota)] text-xs font-medium"
                    >
                      {expandedRow === log.id ? 'Ocultar' : 'Ver Cambios'}
                    </button>
                  </td>
                </tr>
                {expandedRow === log.id && (
                  <tr className="bg-[var(--lt-bg)]">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <p className="font-bold text-[var(--lt-terracota)] mb-1">Antes:</p>
                          <pre className="bg-[var(--lt-paper)] text-[var(--lt-ink)] p-2 rounded-[var(--lt-radius-sm)] border-[2px] border-[var(--lt-terracota)]/40 overflow-x-auto">
                            {JSON.stringify(log.oldValues, null, 2) || 'N/A'}
                          </pre>
                        </div>
                        <div>
                          <p className="font-bold text-[var(--lt-verde)] mb-1">
                            Después:
                          </p>
                          <pre className="bg-[var(--lt-paper)] text-[var(--lt-ink)] p-2 rounded-[var(--lt-radius-sm)] border-[2px] border-[var(--lt-verde)]/40 overflow-x-auto">
                            {JSON.stringify(log.newValues, null, 2) || 'N/A'}
                          </pre>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-[var(--lt-ink-soft)]">
                        IP: {log.ip || 'Desconocida'} • UA:{' '}
                        {log.userAgent?.slice(0, 50)}...
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* Paginación simple */}
      <div className="px-6 py-3 border-t-[2.2px] border-[var(--lt-ink)] text-xs text-center text-[var(--lt-ink-soft)]">
        Página {currentPage} de {totalPages}
      </div>
    </LtPanel>
  )
}
