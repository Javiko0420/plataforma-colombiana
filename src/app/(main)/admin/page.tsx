import { prisma } from '@/lib/prisma'
import { Button } from '@/components/lh/Button'

export const dynamic = 'force-dynamic' // Siempre datos frescos

async function getDashboardStats() {
  // Ejecutamos consultas en paralelo para velocidad
  const [
    usersCount,
    businessesCount,
    pendingReviews,
    flaggedPosts,
    reportedBusinesses,
    totalJobOffers,
    reportedJobOffers,
    activeEvents,
    totalEvents,
    reportedEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.business.count(),
    // Reseñas con al menos 1 reporte O estado FLAGGED
    prisma.review.count({
      where: { OR: [{ status: 'FLAGGED' }, { reportCount: { gt: 0 } }] },
    }),
    prisma.forumPost.count({ where: { isFlagged: true } }),
    // Negocios con reportes pendientes
    prisma.business.count({
      where: { reports: { some: { status: 'PENDING' } } },
    }),
    // Ofertas de empleo activas (no eliminadas y no expiradas)
    prisma.jobOffer.count({
      where: { deletedAt: null, expiresAt: { gt: new Date() } },
    }),
    // Ofertas de empleo con reportes pendientes de moderación
    prisma.jobOffer.count({
      where: { deletedAt: null, reportCount: { gt: 0 } },
    }),
    // Eventos activos (fecha futura)
    prisma.event.count({
      where: { eventDate: { gte: new Date() } },
    }),
    // Total de eventos registrados
    prisma.event.count(),
    // Eventos reportados pendientes de moderación
    prisma.event.count({
      where: {
        OR: [
          { isHidden: true },
          { reports: { some: { status: 'PENDING' } } },
        ],
      },
    }),
  ])

  return {
    usersCount,
    businessesCount,
    pendingReviews,
    flaggedPosts,
    reportedBusinesses,
    totalJobOffers,
    reportedJobOffers,
    activeEvents,
    totalEvents,
    reportedEvents,
  }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="lh-h2" style={{ fontSize: 'clamp(26px,4vw,34px)', margin: 0 }}>Dashboard</h1>
        <p style={{ color: 'var(--lh-fg2)', margin: '6px 0 0' }}>
          Bienvenido al centro de comando de Plataforma Colombiana.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Usuarios Totales"
          value={stats.usersCount}
          icon="👥"
          description="+12% mes anterior"
        />
        <StatCard
          title="Negocios Activos"
          value={stats.businessesCount}
          icon="🏪"
          description="Directorio oficial"
        />
        <StatCard
          title="Ofertas de Empleo"
          value={stats.totalJobOffers}
          icon="💼"
          description="Publicaciones activas"
        />
        <StatCard
          title="Eventos Activos"
          value={stats.activeEvents}
          icon="🎪"
          description={`${stats.totalEvents} eventos en total`}
        />
        <StatCard
          title="Negocios Reportados"
          value={stats.reportedBusinesses}
          icon="🏴"
          trend="requires_action"
          description="Reportes pendientes de revisión"
        />
        <StatCard
          title="Reseñas por Moderar"
          value={stats.pendingReviews}
          icon="⚠️"
          trend="requires_action"
          description="Reportadas por usuarios"
        />
        <StatCard
          title="Alertas en Foros"
          value={stats.flaggedPosts}
          icon="🚩"
          trend="requires_action"
          description="Contenido potencialmente sensible"
        />
        <StatCard
          title="Empleos por Moderar"
          value={stats.reportedJobOffers}
          icon="📋"
          trend="requires_action"
          description="Ofertas reportadas por la comunidad"
        />
        <StatCard
          title="Eventos Reportados"
          value={stats.reportedEvents}
          icon="🎭"
          trend="requires_action"
          description="Eventos pendientes de moderación"
        />
      </div>

      {/* Paneles inferiores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lh-card col-span-4" style={{ padding: 24, height: 400 }}>
          <h3 style={{ fontFamily: 'var(--lh-font)', fontWeight: 600, fontSize: 16, color: 'var(--lh-fg)', margin: '0 0 16px' }}>Actividad reciente</h3>
          <div className="flex items-center justify-center" style={{ height: '100%', color: 'var(--lh-fg3)' }}>
            [Gráfico de Actividad de Usuarios - Próximamente]
          </div>
        </div>
        <div className="lh-card col-span-3" style={{ padding: 24, height: 400 }}>
          <h3 style={{ fontFamily: 'var(--lh-font)', fontWeight: 600, fontSize: 16, color: 'var(--lh-fg)', margin: '0 0 16px' }}>Acciones rápidas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Button variant="primary" size="md" style={{ width: '100%', justifyContent: 'flex-start' }}>
              ⚡ Disparar Webhook n8n (Sincronización Manual)
            </Button>
            <Button variant="secondary" size="md" style={{ width: '100%', justifyContent: 'flex-start' }}>
              📄 Revisar Documentos Pendientes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
  trend,
}: {
  title: string
  value: number
  icon: string
  description: string
  trend?: string
}) {
  const isAlert = trend === 'requires_action' && value > 0

  return (
    <div className="lh-card" style={{ padding: 22, borderColor: isAlert ? 'color-mix(in oklch, var(--lh-terra) 40%, var(--lh-border))' : undefined }}>
      <div className="flex flex-row items-center justify-between" style={{ paddingBottom: 8 }}>
        <h3 style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--lh-fg2)', margin: 0 }}>{title}</h3>
        <span style={{ fontSize: 20 }}>{icon}</span>
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontFamily: 'var(--lh-font)', fontSize: 26, fontWeight: 700, letterSpacing: '-.02em', color: isAlert ? 'var(--lh-terra)' : 'var(--lh-fg)' }}>
          {value}
        </div>
        <p style={{ fontSize: 12, color: 'var(--lh-fg3)', marginTop: 4 }}>{description}</p>
      </div>
    </div>
  )
}
