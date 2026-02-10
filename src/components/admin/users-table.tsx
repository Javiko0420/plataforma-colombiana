'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { updateUserRole, toggleUserBan } from '@/app/admin/usuarios/actions'
import { UserRole } from '@prisma/client'
import Image from 'next/image'

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

  // Helper para colores de roles
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'MODERATOR':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'BUSINESS_OWNER':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          className="border border-gray-300 dark:border-slate-600 bg-transparent rounded-md px-3 py-2 text-sm w-full sm:w-80 focus:ring-2 focus:ring-blue-500 outline-none"
          defaultValue={searchParams.get('q')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-500 font-medium border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Rol (Permisos)</th>
                <th className="px-6 py-3">Fecha Registro</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors ${
                    user.isBanned ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt=""
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-gray-500">
                            {user.name?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.name || 'Sin Nombre'}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isBanned ? (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        🚫 BANEADO
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.id === currentUserId ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role} (Tú)
                      </span>
                    ) : (
                      <select
                        disabled={loadingId === user.id}
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`text-xs font-medium rounded-md border-gray-300 dark:border-slate-600 bg-transparent py-1 pl-2 pr-6 focus:ring-1 focus:ring-blue-500 cursor-pointer border ${getRoleBadgeColor(user.role)}`}
                      >
                        <option value="USER">USER</option>
                        <option value="BUSINESS_OWNER">BUSINESS_OWNER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.id !== currentUserId && (
                      <button
                        onClick={() =>
                          handleBanToggle(user.id, user.isBanned)
                        }
                        disabled={loadingId === user.id}
                        className={`text-xs font-medium px-3 py-1.5 rounded transition-colors border ${
                          user.isBanned
                            ? 'text-green-600 border-green-200 hover:bg-green-50'
                            : 'text-red-600 border-red-200 hover:bg-red-50'
                        }`}
                      >
                        {user.isBanned ? 'Desbloquear' : 'Bloquear'}
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
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => {
                const p = new URLSearchParams(searchParams)
                p.set('page', String(currentPage - 1))
                router.push(`/admin/usuarios?${p.toString()}`)
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
                router.push(`/admin/usuarios?${p.toString()}`)
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
