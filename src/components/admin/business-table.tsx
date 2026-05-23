'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  verifyBusiness,
  toggleBusinessStatus,
} from '@/app/(main)/admin/negocios/actions'
import Link from 'next/link'
import { LtPanel, LtBadge, LtButton } from '@/components/lt'

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
      <LtPanel className="flex flex-col sm:flex-row gap-4 justify-between p-4" shadow="sm">
        <input
          type="text"
          placeholder="Buscar por nombre, email o ciudad..."
          className="lt-input w-full sm:w-80"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />

        <div className="flex gap-2">
          <select
            className="lt-input cursor-pointer w-auto min-w-[180px]"
            onChange={(e) => handleFilter(e.target.value)}
            defaultValue={searchParams.get('filter') || 'all'}
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes de Verificar</option>
            <option value="verified">Verificados</option>
            <option value="inactive">Desactivados</option>
          </select>
        </div>
      </LtPanel>

      {/* Tabla */}
      <LtPanel className="overflow-hidden p-0" shadow="md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--lt-bg)] text-[var(--lt-ink-soft)] font-medium border-b-[2.2px] border-[var(--lt-ink)]">
              <tr>
                <th className="px-6 py-3">Negocio</th>
                <th className="px-6 py-3">Plan / Estado</th>
                <th className="px-6 py-3">Ubicación</th>
                <th className="px-6 py-3">Contacto (Dueño)</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-[var(--lt-ink)]/15">
              {businesses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-[var(--lt-ink-soft)]"
                  >
                    No se encontraron negocios con estos filtros.
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => (
                  <tr
                    key={biz.id}
                    className="hover:bg-[var(--lt-bg)] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[var(--lt-ink)] flex items-center gap-1">
                          {biz.name}
                          {biz.isVerified && (
                            <span
                              className="text-[var(--lt-verde)] text-xs"
                              title="Verificado"
                            >
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-[var(--lt-ink-soft)]">
                          ID: {biz.id.slice(-6)}...
                        </span>
                        <Link
                          href={`/negocio/${biz.slug}`}
                          target="_blank"
                          className="text-xs text-[var(--lt-accent)] hover:underline mt-1"
                        >
                          Ver en vivo ↗
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <LtBadge
                          tone={
                            biz.plan === 'PREMIUM' || biz.plan === 'SPONSOR'
                              ? 'accent'
                              : 'neutral'
                          }
                        >
                          {biz.plan}
                        </LtBadge>
                        <LtBadge tone={biz.isActive ? 'verde' : 'terracota'}>
                          {biz.isActive ? 'Activo' : 'Inactivo'}
                        </LtBadge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[var(--lt-ink)]">
                        {biz.city || 'N/A'}
                      </p>
                      <p className="text-xs text-[var(--lt-ink-soft)]">{biz.address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="font-medium text-[var(--lt-ink)]">
                          {biz.owner.name}
                        </p>
                        <p className="text-[var(--lt-ink-soft)]">{biz.owner.email}</p>
                        <p className="text-[var(--lt-ink-soft)]">{biz.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/negocio/editar/${biz.slug}`}
                          className="p-1.5 hover:bg-[var(--lt-bg)] text-[var(--lt-accent)] rounded-[var(--lt-radius-sm)] border-[2px] border-transparent hover:border-[var(--lt-ink)] transition text-xs font-medium"
                          title="Editar Negocio"
                        >
                          ✏️
                        </Link>
                        {!biz.isVerified && (
                          <button
                            onClick={() => handleVerify(biz.id)}
                            disabled={isLoading === biz.id}
                            className="p-1.5 hover:bg-[var(--lt-bg)] text-[var(--lt-verde)] rounded-[var(--lt-radius-sm)] border-[2px] border-transparent hover:border-[var(--lt-ink)] transition disabled:opacity-50"
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
                          className={`p-1.5 rounded-[var(--lt-radius-sm)] border-[2px] border-transparent transition disabled:opacity-50 ${
                            biz.isActive
                              ? 'hover:bg-[var(--lt-bg)] text-[var(--lt-terracota)] hover:border-[var(--lt-ink)]'
                              : 'hover:bg-[var(--lt-bg)] text-[var(--lt-verde)] hover:border-[var(--lt-ink)]'
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
          <div className="px-6 py-4 border-t-[2.2px] border-[var(--lt-ink)] flex justify-center gap-2 items-center">
            <LtButton
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => {
                const p = new URLSearchParams(searchParams)
                p.set('page', String(currentPage - 1))
                router.push(`/admin/negocios?${p.toString()}`)
              }}
            >
              Anterior
            </LtButton>
            <span className="text-sm py-1 text-[var(--lt-ink-soft)]">
              Página {currentPage} de {totalPages}
            </span>
            <LtButton
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => {
                const p = new URLSearchParams(searchParams)
                p.set('page', String(currentPage + 1))
                router.push(`/admin/negocios?${p.toString()}`)
              }}
            >
              Siguiente
            </LtButton>
          </div>
        )}
      </LtPanel>
    </div>
  )
}
