'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  verifyBusiness,
  toggleBusinessStatus,
} from '@/app/(main)/admin/negocios/actions'
import Link from 'next/link'

interface BusinessTableProps {
  businesses: {
    id: string
    name: string
    slug: string
    plan: string
    isActive: boolean
    isVerified: boolean
    city: string | null
    address: string | null
    phone: string
    owner: { name: string | null; email: string }
  }[]
  totalPages: number
  currentPage: number
}

export function BusinessTable({
  businesses,
  totalPages,
  currentPage,
}: BusinessTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Manejo de Filtros
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    router.replace(`/admin/negocios?${params.toString()}`)
  }

  const handleFilter = (filter: string) => {
    const params = new URLSearchParams(searchParams)
    if (filter === 'all') params.delete('filter')
    else params.set('filter', filter)
    params.set('page', '1')
    router.replace(`/admin/negocios?${params.toString()}`)
  }

  // Acciones
  const handleVerify = async (id: string) => {
    if (
      !confirm(
        '¿Confirmas que has validado la documentación de este negocio?',
      )
    )
      return
    setIsLoading(id)
    await verifyBusiness(id)
    setIsLoading(null)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar'
    if (
      !confirm(
        `¿Estás seguro de ${action} este negocio? Se ocultará del directorio.`,
      )
    )
      return
    setIsLoading(id)
    await toggleBusinessStatus(id, currentStatus)
    setIsLoading(null)
  }

  return (
    <div className="space-y-4">
      {/* Barra de Herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
        <input
          type="text"
          placeholder="Buscar por nombre, email o ciudad..."
          className="border border-gray-300 dark:border-slate-600 bg-transparent rounded-md px-3 py-2 text-sm w-full sm:w-80 focus:ring-2 focus:ring-blue-500 outline-none"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <select
            className="border border-gray-300 dark:border-slate-600 bg-transparent rounded-md px-3 py-2 text-sm outline-none cursor-pointer"
            onChange={(e) => handleFilter(e.target.value)}
            defaultValue={searchParams.get('filter') || 'all'}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes de Verificar</option>
            <option value="verified">Verificados</option>
            <option value="inactive">Desactivados</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3">Negocio</th>
                <th className="px-6 py-3">Plan / Estado</th>
                <th className="px-6 py-3">Ubicación</th>
                <th className="px-6 py-3">Contacto (Dueño)</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {businesses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No se encontraron negocios con estos filtros.
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => (
                  <tr
                    key={biz.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          {biz.name}
                          {biz.isVerified && (
                            <span
                              className="text-blue-500 text-xs"
                              title="Verificado"
                            >
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: {biz.id.slice(-6)}...
                        </span>
                        <Link
                          href={`/negocio/${biz.slug}`}
                          target="_blank"
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Ver en vivo ↗
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium ${
                            biz.plan === 'PREMIUM' || biz.plan === 'SPONSOR'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {biz.plan}
                        </span>
                        <span
                          className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium ${
                            biz.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {biz.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        {biz.city || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{biz.address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {biz.owner.name}
                        </p>
                        <p className="text-gray-500">{biz.owner.email}</p>
                        <p className="text-gray-500">{biz.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/negocio/editar/${biz.slug}`}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded border border-transparent hover:border-blue-200 transition text-xs font-medium"
                          title="Editar Negocio"
                        >
                          ✏️
                        </Link>
                        {!biz.isVerified && (
                          <button
                            onClick={() => handleVerify(biz.id)}
                            disabled={isLoading === biz.id}
                            className="p-1.5 hover:bg-green-50 text-green-600 rounded border border-transparent hover:border-green-200 transition"
                            title="Verificar Negocio"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleToggleStatus(biz.id, biz.isActive)
                          }
                          disabled={isLoading === biz.id}
                          className={`p-1.5 rounded border border-transparent transition ${
                            biz.isActive
                              ? 'hover:bg-red-50 text-red-600 hover:border-red-200'
                              : 'hover:bg-green-50 text-green-600 hover:border-green-200'
                          }`}
                          title={biz.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {biz.isActive ? '🚫' : '🔄'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación simple */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => {
                const p = new URLSearchParams(searchParams)
                p.set('page', String(currentPage - 1))
                router.push(`/admin/negocios?${p.toString()}`)
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm py-1">
              Página {currentPage} de {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => {
                const p = new URLSearchParams(searchParams)
                p.set('page', String(currentPage + 1))
                router.push(`/admin/negocios?${p.toString()}`)
              }}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
