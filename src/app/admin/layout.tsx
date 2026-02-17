import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Panel de Control - Plataforma Colombiana',
  robots: 'noindex, nofollow', // No queremos que Google indexe el admin
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Doble verificación de seguridad en servidor
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex">
      {/* Sidebar - Componentizar esto luego en /components/admin/sidebar.tsx */}
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">Admin Panel</h2>
          <p className="text-xs text-gray-500 mt-1">v1.0 Enterprise</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <AdminLink href="/admin" icon="📊" label="Dashboard" />

          <div className="pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Moderación
          </div>
          <AdminLink href="/admin/negocios" icon="🏪" label="Negocios" />
          <AdminLink href="/admin/resenas" icon="⭐" label="Reseñas" />
          <AdminLink href="/admin/foros" icon="💬" label="Foros" />
          <AdminLink href="/admin/empleos" icon="💼" label="Bolsa de Empleo" />
          <AdminLink href="/admin/eventos" icon="🎪" label="Eventos" />

          <div className="pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Sistema
          </div>
          <AdminLink href="/admin/usuarios" icon="👥" label="Usuarios" />
          <AdminLink href="/admin/auditoria" icon="🛡️" label="Logs & Seguridad" />
          <AdminLink href="/admin/integraciones" icon="⚡" label="n8n & APIs" />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {session.user.name?.[0] || 'A'}
            </div>
            <div className="text-sm">
              <p className="font-medium">{session.user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{session.user.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  )
}

function AdminLink({
  href,
  icon,
  label,
  pending = false,
}: {
  href: string
  icon: string
  label: string
  pending?: boolean
}) {
  return (
    <Link
      href={pending ? '#' : href}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${pending
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
        }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
      {pending && (
        <span className="ml-auto text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
          WIP
        </span>
      )}
    </Link>
  )
}
