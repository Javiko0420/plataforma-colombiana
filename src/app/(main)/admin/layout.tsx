import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { LtBadge } from '@/components/lt'

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
    <div className="min-h-screen bg-[var(--lt-bg)] flex" style={{ fontFamily: 'var(--lt-font-sans)' }}>
      {/* Sidebar - Componentizar esto luego en /components/admin/sidebar.tsx */}
      <aside className="w-64 bg-[var(--lt-paper)] border-r-[2.2px] border-[var(--lt-ink)] hidden md:flex flex-col fixed h-full z-10 shadow-[var(--lt-shadow-sticker)]">
        <div className="p-6 border-b-[2.2px] border-[var(--lt-ink)]">
          <h2
            className="text-xl font-bold text-[var(--lt-terracota)]"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            Admin Panel
          </h2>
          <p className="text-xs text-[var(--lt-ink-soft)] mt-1">v1.0 Enterprise</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <AdminLink href="/admin" icon="📊" label="Dashboard" />

          <div className="pt-4 pb-2 text-xs font-semibold text-[var(--lt-ink-soft)] uppercase tracking-wider">
            Moderación
          </div>
          <AdminLink href="/admin/negocios" icon="🏪" label="Negocios" />
          <AdminLink href="/admin/resenas" icon="⭐" label="Reseñas" />
          <AdminLink href="/admin/foros" icon="💬" label="Foros" />
          <AdminLink href="/admin/empleos" icon="💼" label="Bolsa de Empleo" />
          <AdminLink href="/admin/eventos" icon="🎪" label="Eventos" />

          <div className="pt-4 pb-2 text-xs font-semibold text-[var(--lt-ink-soft)] uppercase tracking-wider">
            Sistema
          </div>
          <AdminLink href="/admin/usuarios" icon="👥" label="Usuarios" />
          <AdminLink href="/admin/auditoria" icon="🛡️" label="Logs & Seguridad" />
          <AdminLink href="/admin/integraciones" icon="⚡" label="n8n & APIs" pending />
        </nav>

        <div className="p-4 border-t-[2.2px] border-[var(--lt-ink)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--lt-sun)] border-[2px] border-[var(--lt-ink)] flex items-center justify-center text-[var(--lt-ink)] font-bold">
              {session.user.name?.[0] || 'A'}
            </div>
            <div className="text-sm">
              <p className="font-medium text-[var(--lt-ink)]">{session.user.name}</p>
              <p className="text-xs text-[var(--lt-ink-soft)] capitalize">{session.user.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8 bg-[var(--lt-bg)]">
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
      className={`flex items-center gap-3 px-3 py-2 rounded-[var(--lt-radius-sm)] text-sm font-medium transition-colors
        ${pending
          ? 'text-[var(--lt-ink-soft)] cursor-not-allowed opacity-60'
          : 'text-[var(--lt-ink)] hover:bg-[var(--lt-bg)]'
        }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
      {pending && (
        <LtBadge tone="sun" className="ml-auto text-[10px] px-1.5 py-0">
          WIP
        </LtBadge>
      )}
    </Link>
  )
}
