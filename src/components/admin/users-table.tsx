'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { updateUserRole, toggleUserBan } from '@/app/(main)/admin/usuarios/actions'
import { UserRole } from '@prisma/client'
import Image from 'next/image'
import { Button } from '@/components/lh/Button'

interface UsersTableProps {
  users: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
    isBanned: boolean
    createdAt: Date
  }[]
  totalPages: number
  currentPage: number
  currentUserId: string
}

const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

const chip = (color: string): React.CSSProperties => ({
  display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 99,
  background: tint(color), color, fontSize: 12, fontWeight: 600,
})

export function UsersTable({ users, totalPages, currentPage, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) params.set('q', term)
    else params.delete('q')
    params.set('page', '1')
    router.replace(`/admin/usuarios?${params.toString()}`)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`¿Estás seguro de cambiar el rol de este usuario a ${newRole}? Esto cambiará sus permisos inmediatamente.`)) return
    setLoadingId(userId)
    const res = await updateUserRole(userId, newRole as UserRole)
    if (!res.success && res.error) alert(res.error)
    setLoadingId(null)
  }

  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    const action = isBanned ? 'desbloquear' : 'BLOQUEAR'
    if (!confirm(`¿Estás seguro de ${action} a este usuario? ${!isBanned ? 'No podrá iniciar sesión.' : ''}`)) return
    setLoadingId(userId)
    const res = await toggleUserBan(userId, isBanned)
    if (!res.success && res.error) alert(res.error)
    setLoadingId(null)
  }

  const roleColor = (role: string): string => {
    switch (role) {
      case 'ADMIN': return 'var(--lh-terra)'
      case 'MODERATOR': return 'var(--lh-accent)'
      case 'BUSINESS_OWNER': return 'var(--lh-warm)'
      default: return 'var(--lh-fg3)'
    }
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="lh-card" style={{ padding: 16 }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          className="lh-input w-full sm:w-80"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="lh-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Estado</th>
                <th>Rol (Permisos)</th>
                <th>Registro</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={user.isBanned ? { background: 'var(--lh-surface2)' } : undefined}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--lh-surface2)', border: '1px solid var(--lh-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {user.image ? (
                          <Image src={user.image} alt="" width={32} height={32} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--lh-fg3)' }}>{user.name?.[0] || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--lh-fg)', margin: 0 }}>{user.name || 'Sin Nombre'}</p>
                        <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: 0 }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {user.isBanned ? <span style={chip('var(--lh-terra)')}>🚫 Baneado</span> : <span style={chip('var(--lh-green)')}>Activo</span>}
                  </td>
                  <td>
                    {user.id === currentUserId ? (
                      <span style={chip(roleColor(user.role))}>{user.role} (Tú)</span>
                    ) : (
                      <select
                        disabled={loadingId === user.id}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="lh-input"
                        style={{ fontSize: 12.5, fontWeight: 500, padding: '6px 30px 6px 10px', width: 'auto', minWidth: 150 }}
                      >
                        <option value="USER">USER</option>
                        <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>
                  <td style={{ color: 'var(--lh-fg3)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    {user.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => handleBanToggle(user.id, user.isBanned)}
                        disabled={loadingId === user.id}
                        className="lh-btn lh-btn--sm lh-btn--secondary"
                        style={{ color: user.isBanned ? 'var(--lh-green)' : 'var(--lh-terra)', borderColor: `color-mix(in oklch, ${user.isBanned ? 'var(--lh-green)' : 'var(--lh-terra)'} 35%, transparent)`, opacity: loadingId === user.id ? 0.5 : 1 }}
                      >
                        {loadingId === user.id ? '…' : user.isBanned ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--lh-border)', display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
            <Button variant="secondary" size="sm" disabled={currentPage <= 1} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(currentPage - 1)); router.push(`/admin/usuarios?${p.toString()}`) }}>
              Anterior
            </Button>
            <span style={{ fontSize: 14, color: 'var(--lh-fg3)' }}>Página {currentPage} de {totalPages}</span>
            <Button variant="secondary" size="sm" disabled={currentPage >= totalPages} onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', String(currentPage + 1)); router.push(`/admin/usuarios?${p.toString()}`) }}>
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
