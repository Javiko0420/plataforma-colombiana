'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { updateUserRole, toggleUserBan } from '@/app/(main)/admin/usuarios/actions'
import { UserRole } from '@prisma/client'
import Image from 'next/image'
import { LtPanel, LtBadge, LtButton } from '@/components/lt'
import type { BadgeTone } from '@/components/lt'

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
  currentUserId: string // Para deshabilitar acciones sobre uno mismo
}

export function UsersTable({
  users,
  totalPages,
  currentPage,
  currentUserId,
}: UsersTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Búsqueda
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) params.set('q', term)
    else params.delete('q')
    params.set('page', '1')
    router.replace(`/admin/usuarios?${params.toString()}`)
  }

  // Cambio de Rol
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (
      !confirm(
        `¿Estás seguro de cambiar el rol de este usuario a ${newRole}? Esto cambiará sus permisos inmediatamente.`,
      )
    )
      return

    setLoadingId(userId)
    const res = await updateUserRole(userId, newRole as UserRole)
    if (!res.success && res.error) alert(res.error)
    setLoadingId(null)
  }

  // Banear
  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    const action = isBanned ? 'desbloquear' : 'BLOQUEAR'
    if (
      !confirm(
        `¿Estás seguro de ${action} a este usuario? ${!isBanned ? 'No podrá iniciar sesión.' : ''}`,
      )
    )
      return

    setLoadingId(userId)
    const res = await toggleUserBan(userId, isBanned)
    if (!res.success && res.error) alert(res.error)
    setLoadingId(null)
  }

  const getRoleBadgeTone = (role: string): BadgeTone => {
    switch (role) {
      case 'ADMIN':
        return 'terracota'
      case 'MODERATOR':
        return 'accent'
      case 'BUSINESS_OWNER':
        return 'sun'
      default:
        return 'neutral'
    }
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <LtPanel className="p-4" shadow="sm">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          className="lt-input w-full sm:w-80"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </LtPanel>

      {/* Tabla */}
      <LtPanel className="overflow-hidden p-0" shadow="md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[var(--lt-bg)] text-[var(--lt-ink-soft)] font-medium border-b-[2.2px] border-[var(--lt-ink)]">
              <tr>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Rol (Permisos)</th>
                <th className="px-6 py-3">Fecha Registro</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-[var(--lt-ink)]/15">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-[var(--lt-bg)] transition-colors ${
                    user.isBanned ? 'bg-[var(--lt-bg)]' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--lt-bg)] border-[2px] border-[var(--lt-ink)] flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt=""
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[var(--lt-ink-soft)]">
                            {user.name?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--lt-ink)]">
                          {user.name || 'Sin Nombre'}
                        </p>
                        <p className="text-xs text-[var(--lt-ink-soft)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isBanned ? (
                      <LtBadge tone="terracota">🚫 BANEADO</LtBadge>
                    ) : (
                      <LtBadge tone="verde">Activo</LtBadge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.id === currentUserId ? (
                      <LtBadge tone={getRoleBadgeTone(user.role)}>
                        {user.role} (Tú)
                      </LtBadge>
                    ) : (
                      <select
                        disabled={loadingId === user.id}
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="lt-input text-xs font-medium py-1 pl-2 pr-6 cursor-pointer w-auto min-w-[140px]"
                      >
                        <option value="USER">USER</option>
                        <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[var(--lt-ink-soft)]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.id !== currentUserId && (
                      <LtButton
                        variant="outline"
                        size="sm"
                        tone={user.isBanned ? 'verde' : 'terracota'}
                        onClick={() =>
                          handleBanToggle(user.id, user.isBanned)
                        }
                        disabled={loadingId === user.id}
                        loading={loadingId === user.id}
                        loadingText="..."
                      >
                        {user.isBanned ? 'Desbloquear' : 'Bloquear'}
                      </LtButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t-[2.2px] border-[var(--lt-ink)] flex justify-center gap-2 items-center">
            <LtButton
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => {
                const p = new URLSearchParams(searchParams)
                p.set('page', String(currentPage - 1))
                router.push(`/admin/usuarios?${p.toString()}`)
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
                router.push(`/admin/usuarios?${p.toString()}`)
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
