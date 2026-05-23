'use client'

import { format } from 'date-fns'
import type { JsonValue } from '@prisma/client/runtime/library'
import { LtPanel, LtBadge } from '@/components/lt'
import type { BadgeTone } from '@/components/lt'

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

export function SecurityTable({ logs }: SecurityTableProps) {
  const getSeverityTone = (severity: string): BadgeTone => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'terracota'
      case 'medium':
        return 'sun'
      case 'low':
        return 'accent'
      default:
        return 'neutral'
    }
  }

  return (
    <LtPanel className="overflow-hidden p-0" shadow="md">
      <table className="w-full text-sm text-left">
        <thead className="bg-[var(--lt-bg)] text-[var(--lt-ink-soft)] font-medium border-b-[2.2px] border-[var(--lt-ink)]">
          <tr>
            <th className="px-6 py-3">Severidad</th>
            <th className="px-6 py-3">Evento</th>
            <th className="px-6 py-3">IP / Origen</th>
            <th className="px-6 py-3">Usuario Afectado</th>
            <th className="px-6 py-3">Fecha Exacta</th>
          </tr>
        </thead>
        <tbody className="divide-y-[2px] divide-[var(--lt-ink)]/15">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-[var(--lt-bg)]"
            >
              <td className="px-6 py-4">
                <LtBadge tone={getSeverityTone(log.severity)} className="uppercase text-[10px]">
                  {log.severity}
                </LtBadge>
              </td>
              <td className="px-6 py-4 font-medium text-[var(--lt-ink)]">
                {log.event}
              </td>
              <td className="px-6 py-4 text-[var(--lt-ink-soft)] font-mono text-xs">
                {log.ip || 'Unknown'}
              </td>
              <td className="px-6 py-4 text-[var(--lt-ink-soft)]">
                {log.userId ? (
                  <span className="text-[var(--lt-accent)]">
                    ID: {log.userId.slice(0, 8)}...
                  </span>
                ) : (
                  (log.details && typeof log.details === 'object' && !Array.isArray(log.details) && 'email' in log.details
                    ? String(log.details.email)
                    : 'N/A')
                )}
              </td>
              <td className="px-6 py-4 text-[var(--lt-ink-soft)] text-xs">
                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </LtPanel>
  )
}
