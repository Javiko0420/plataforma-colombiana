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

export function SecurityTable({ logs }: SecurityTableProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 font-medium border-b border-gray-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-3">Severidad</th>
            <th className="px-6 py-3">Evento</th>
            <th className="px-6 py-3">IP / Origen</th>
            <th className="px-6 py-3">Usuario Afectado</th>
            <th className="px-6 py-3">Fecha Exacta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
          {logs.map((log) => (
            <tr
              key={log.id}
              className="hover:bg-gray-50 dark:hover:bg-slate-700/30"
            >
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${getSeverityColor(log.severity)}`}
                >
                  {log.severity}
                </span>
              </td>
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {log.event}
              </td>
              <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                {log.ip || 'Unknown'}
              </td>
              <td className="px-6 py-4 text-gray-500">
                {log.userId ? (
                  <span className="text-blue-600">
                    ID: {log.userId.slice(0, 8)}...
                  </span>
                ) : (
                  (log.details && typeof log.details === 'object' && !Array.isArray(log.details) && 'email' in log.details
                    ? String(log.details.email)
                    : 'N/A')
                )}
              </td>
              <td className="px-6 py-4 text-gray-500 text-xs">
                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
