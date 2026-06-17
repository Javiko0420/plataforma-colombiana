'use client'

import { Fragment, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { JsonValue } from '@prisma/client/runtime/library'

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

export function AuditTable({ logs, totalPages, currentPage }: AuditTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  return (
    <div className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="lh-table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Acción</th>
              <th>Recurso</th>
              <th>Fecha</th>
              <th style={{ textAlign: 'right' }}>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <Fragment key={log.id}>
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,var(--lh-accent),var(--lh-accent-ink))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                        {log.user?.name?.[0] || '?'}
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--lh-fg)' }}>{log.user?.name || 'Sistema'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, background: 'var(--lh-surface2)', color: 'var(--lh-fg)', padding: '3px 8px', borderRadius: 7, border: '1px solid var(--lh-border2)' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    {log.resource} <span style={{ fontSize: 12, opacity: 0.5 }}>#{log.resourceId?.slice(-4)}</span>
                  </td>
                  <td>{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: es })}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => toggleRow(log.id)} style={{ color: 'var(--lh-accent)', fontSize: 12.5, fontWeight: 500, background: 'transparent', border: 0, cursor: 'pointer' }}>
                      {expandedRow === log.id ? 'Ocultar' : 'Ver cambios'}
                    </button>
                  </td>
                </tr>
                {expandedRow === log.id && (
                  <tr style={{ background: 'var(--lh-surface2)' }}>
                    <td colSpan={5}>
                      <div className="grid grid-cols-2 gap-4" style={{ fontSize: 12, fontFamily: 'var(--lh-mono)' }}>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--lh-terra)', marginBottom: 4 }}>Antes:</p>
                          <pre style={{ background: 'var(--lh-surface)', color: 'var(--lh-fg)', padding: 8, borderRadius: 8, border: '1px solid var(--lh-border)', overflowX: 'auto' }}>
                            {JSON.stringify(log.oldValues, null, 2) || 'N/A'}
                          </pre>
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, color: 'var(--lh-green)', marginBottom: 4 }}>Después:</p>
                          <pre style={{ background: 'var(--lh-surface)', color: 'var(--lh-fg)', padding: 8, borderRadius: 8, border: '1px solid var(--lh-border)', overflowX: 'auto' }}>
                            {JSON.stringify(log.newValues, null, 2) || 'N/A'}
                          </pre>
                        </div>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--lh-fg3)' }}>
                        IP: {log.ip || 'Desconocida'} • UA: {log.userAgent?.slice(0, 50)}…
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--lh-border)', fontSize: 12.5, textAlign: 'center', color: 'var(--lh-fg3)' }}>
        Página {currentPage} de {totalPages}
      </div>
    </div>
  )
}
