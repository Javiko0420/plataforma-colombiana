import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Panel de Control - Plataforma Colombiana',
  robots: 'noindex, nofollow',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--lh-bg)', fontFamily: 'var(--lh-font)' }}>
      {/* Sidebar */}
      <aside
        className="w-64 hidden md:flex flex-col fixed h-full z-10"
        style={{ background: 'var(--lh-surface)', borderRight: '1px solid var(--lh-border)' }}
      >
        <div style={{ padding: 24, borderBottom: '1px solid var(--lh-border)' }}>
          <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 19, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-accent)', margin: 0 }}>
            Admin Panel
          </h2>
          <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: '4px 0 0' }}>v1.0 Enterprise</p>
        </div>

        <nav className="flex-1 overflow-y-auto" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AdminLink href="/admin" icon="📊" label="Dashboard" />

          <SectionLabel>Moderación</SectionLabel>
          <AdminLink href="/admin/negocios" icon="🏪" label="Negocios" />
          <AdminLink href="/admin/resenas" icon="⭐" label="Reseñas" />
          <AdminLink href="/admin/foros" icon="💬" label="Foros" />
          <AdminLink href="/admin/empleos" icon="💼" label="Bolsa de Empleo" />
          <AdminLink href="/admin/eventos" icon="🎪" label="Eventos" />

          <SectionLabel>Sistema</SectionLabel>
          <AdminLink href="/admin/usuarios" icon="👥" label="Usuarios" />
          <AdminLink href="/admin/auditoria" icon="🛡️" label="Logs & Seguridad" />
          <AdminLink href="/admin/integraciones" icon="⚡" label="n8n & APIs" pending />
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid var(--lh-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--lh-accent),var(--lh-accent-ink))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {session.user.name?.[0] || 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 500, fontSize: 14, color: 'var(--lh-fg)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.user.name}</p>
              <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: 0, textTransform: 'capitalize' }}>{session.user.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64" style={{ padding: 'clamp(20px,4vw,32px)', background: 'var(--lh-bg)' }}>
        {children}
      </main>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 16, paddingBottom: 8, fontFamily: 'var(--lh-mono)', fontSize: 11, fontWeight: 600, color: 'var(--lh-fg3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
      {children}
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
      className="lh-admin-link"
      style={{
        display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px',
        borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none',
        color: pending ? 'var(--lh-fg3)' : 'var(--lh-fg2)',
        opacity: pending ? 0.6 : 1, cursor: pending ? 'not-allowed' : 'pointer',
      }}
    >
      <span style={{ fontSize: 17 }}>{icon}</span>
      {label}
      {pending && (
        <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99, background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)', color: 'var(--lh-fg3)' }}>
          WIP
        </span>
      )}
    </Link>
  )
}
