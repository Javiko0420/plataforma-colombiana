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
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 font-medium border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3">Actor</th>
              <th className="px-6 py-3">Acción</th>
              <th className="px-6 py-3">Recurso</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3 text-right">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {logs.map((log) => (
              <Fragment key={log.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                        {log.user?.name?.[0] || '?'}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {log.user?.name || 'Sistema'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded border border-gray-200 dark:border-slate-600">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {log.resource}{' '}
                    <span className="text-xs opacity-50">
                      #{log.resourceId?.slice(-4)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleRow(log.id)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      {expandedRow === log.id ? 'Ocultar' : 'Ver Cambios'}
                    </button>
                  </td>
                </tr>
                {expandedRow === log.id && (
                  <tr className="bg-gray-50 dark:bg-slate-900/50">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div>
                          <p className="font-bold text-red-600 mb-1">Antes:</p>
                          <pre className="bg-white dark:bg-slate-800 p-2 rounded border border-red-100 overflow-x-auto">
                            {JSON.stringify(log.oldValues, null, 2) || 'N/A'}
                          </pre>
                        </div>
                        <div>
                          <p className="font-bold text-green-600 mb-1">
                            Después:
                          </p>
                          <pre className="bg-white dark:bg-slate-800 p-2 rounded border border-green-100 overflow-x-auto">
                            {JSON.stringify(log.newValues, null, 2) || 'N/A'}
                          </pre>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
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
      <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-700 text-xs text-center text-gray-500">
        Página {currentPage} de {totalPages}
      </div>
    </div>
  )
}
