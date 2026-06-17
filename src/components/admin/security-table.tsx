'use client'

import { format } from 'date-fns'
import type { JsonValue } from '@prisma/client/runtime/library'

interface SecurityLog {
  id: string
  event: string
  severity: string
  ip: string | null
  userAgent: string | null
  details: JsonValue
  userId: string | null
  createdAt: Date
}

interface SecurityTableProps {
  logs: SecurityLog[]
}

const tint = (v: string) => `color-mix(in oklch, ${v} 16%, transparent)`

export function SecurityTable({ logs }: SecurityTableProps) {
  const severityColor = (severity: string): string => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'var(--lh-terra)'
      case 'medium':
        return 'var(--lh-warm)'
      case 'low':
        return 'var(--lh-accent)'
      default:
        return 'var(--lh-fg3)'
    }
  }

  return (
    <div className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="lh-table">
          <thead>
            <tr>
              <th>Severidad</th>
              <th>Evento</th>
              <th>IP / Origen</th>
              <th>Usuario afectado</th>
              <th>Fecha exacta</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const color = severityColor(log.severity)
              return (
                <tr key={log.id}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 99, background: tint(color), color, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                      {log.severity}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--lh-fg)' }}>{log.event}</td>
                  <td style={{ fontFamily: 'var(--lh-mono)', fontSize: 12, color: 'var(--lh-fg3)' }}>{log.ip || 'Unknown'}</td>
                  <td>
                    {log.userId ? (
                      <span style={{ color: 'var(--lh-accent)' }}>ID: {log.userId.slice(0, 8)}…</span>
                    ) : (
                      (log.details && typeof log.details === 'object' && !Array.isArray(log.details) && 'email' in log.details
                        ? String(log.details.email)
                        : 'N/A')
                    )}
                  </td>
                  <td style={{ fontSize: 12.5, color: 'var(--lh-fg3)' }}>
                    {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
