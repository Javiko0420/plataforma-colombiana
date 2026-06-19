'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  verifyBusiness,
  toggleBusinessStatus,
  setBusinessFeatured,
} from '@/app/(main)/admin/negocios/actions'
import Link from 'next/link'
import { Button } from '@/components/lh/Button'

interface BusinessTableProps {
  businesses: {
    id: string
    name: string
    slug: string
    plan: string
    ranking: number
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

const PLAN_OPTIONS = ['FREE', 'BASIC', 'PREMIUM', 'SPONSOR'] as const
const MAX_SLOT = 8

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`
const chip = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', width: 'fit-content', padding: '3px 9px', borderRadius: 99,
  background: tint(color), color, fontSize: 11.5, fontWeight: 600,
})
const iconBtn = (color: string): React.CSSProperties => ({
  padding: 7, borderRadius: 9, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)',
  color, cursor: 'pointer', fontSize: 13, lineHeight: 1, textDecoration: 'none', display: 'inline-flex',
})

export function BusinessTable({ businesses, totalPages, currentPage }: BusinessTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) params.set('q', term)
    else params.delete('q')
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

  const handleVerify = async (id: string) => {
    if (!confirm('¿Confirmas que has validado la documentación de este negocio?')) return
    setIsLoading(id)
    await verifyBusiness(id)
    setIsLoading(null)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'desactivar' : 'activar'
    if (!confirm(`¿Estás seguro de ${action} este negocio? Se ocultará del directorio.`)) return
    setIsLoading(id)
    await toggleBusinessStatus(id, currentStatus)
    setIsLoading(null)
  }

  const handleSlotChange = async (id: string, ranking: number) => {
    setIsLoading(id)
    await setBusinessFeatured(id, { ranking })
    setIsLoading(null)
  }

  const handlePlanChange = async (id: string, plan: string) => {
    setIsLoading(id)
    await setBusinessFeatured(id, { plan: plan as (typeof PLAN_OPTIONS)[number] })
    setIsLoading(null)
  }

  return (
    <div className="space-y-4">
      {/* Barra de Herramientas */}
      <div className="lh-card flex flex-col sm:flex-row gap-4 justify-between" style={{ padding: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o ciudad…"
          className="lh-input w-full sm:w-80"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <select
          className="lh-input"
          style={{ width: 'auto', minWidth: 190 }}
          onChange={(e) => handleFilter(e.target.value)}
          defaultValue={searchParams.get('filter') || 'all'}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes de verificar</option>
          <option value="verified">Verificados</option>
          <option value="inactive">Desactivados</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="lh-table">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Exposición / Estado</th>
                <th>Ubicación</th>
                <th>Contacto (Dueño)</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {businesses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--lh-fg3)' }}>
                    No se encontraron negocios con estos filtros.
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => (
                  <tr key={biz.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--lh-fg)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {biz.name}
                          {biz.isVerified && <span style={{ color: 'var(--lh-green)', fontSize: 12 }} title="Verificado">✓</span>}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>ID: {biz.id.slice(-6)}…</span>
                        <Link href={`/negocio/${biz.slug}`} target="_blank" style={{ fontSize: 12, color: 'var(--lh-accent)', marginTop: 4 }}>
                          Ver en vivo ↗
                        </Link>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 150 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--lh-fg3)' }}>
                          Slot
                          <select
                            className="lh-input"
                            style={{ padding: '4px 8px', fontSize: 12.5, minWidth: 60 }}
                            value={biz.ranking}
                            disabled={isLoading === biz.id}
                            onChange={(e) => handleSlotChange(biz.id, Number(e.target.value))}
                            title="Posición en el carrusel del home (0 = sin slot)"
                          >
                            {Array.from({ length: MAX_SLOT + 1 }).map((_, n) => (
                              <option key={n} value={n}>{n === 0 ? '— sin slot' : n}</option>
                            ))}
                          </select>
                        </label>
                        <select
                          className="lh-input"
                          style={{ padding: '4px 8px', fontSize: 12.5 }}
                          value={biz.plan}
                          disabled={isLoading === biz.id}
                          onChange={(e) => handlePlanChange(biz.id, e.target.value)}
                          title="Plan comercial (PREMIUM/SPONSOR muestran el badge «Destacado»)"
                        >
                          {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <span style={chip(biz.isActive ? 'var(--lh-green)' : 'var(--lh-terra)')}>{biz.isActive ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td>
                      <p style={{ color: 'var(--lh-fg)', margin: 0 }}>{biz.city || 'N/A'}</p>
                      <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: 0 }}>{biz.address}</p>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        <p style={{ fontWeight: 500, color: 'var(--lh-fg)', margin: 0 }}>{biz.owner.name}</p>
                        <p style={{ color: 'var(--lh-fg3)', margin: 0 }}>{biz.owner.email}</p>
                        <p style={{ color: 'var(--lh-fg3)', margin: 0 }}>{biz.phone}</p>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <Link href={`/negocio/editar/${biz.slug}`} style={iconBtn('var(--lh-accent)')} title="Editar negocio">✏️</Link>
                        {!biz.isVerified && (
                          <button onClick={() => handleVerify(biz.id)} disabled={isLoading === biz.id} style={{ ...iconBtn('var(--lh-green)'), opacity: isLoading === biz.id ? 0.5 : 1 }} title="Verificar negocio">✓</button>
                        )}
                        <button onClick={() => handleToggleStatus(biz.id, biz.isActive)} disabled={isLoading === biz.id} style={{ ...iconBtn(biz.isActive ? 'var(--lh-terra)' : 'var(--lh-green)'), opacity: isLoading === biz.id ? 0.5 : 1 }} title={biz.isActive ? 'Desactivar' : 'Activar'}>
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

        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--lh-border)', display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
            <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(currentPage - 1)); router.push(`/admin/negocios?${p.toString()}`) }}>Anterior</Button>
            <span style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>Página {currentPage} de {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(currentPage + 1)); router.push(`/admin/negocios?${p.toString()}`) }}>Siguiente</Button>
          </div>
        )}
      </div>
    </div>
  )
}
