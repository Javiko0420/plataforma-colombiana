import { prisma } from '@/lib/prisma'
import { LtPanel, LtButton } from '@/components/lt'

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
        <h1
          className="text-3xl font-bold tracking-tight text-[var(--lt-ink)]"
          style={{ fontFamily: 'var(--lt-font-serif)' }}
        >
          Dashboard
        </h1>
        <p className="text-[var(--lt-ink-soft)]">
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
        <LtPanel className="col-span-4 p-6 h-[400px]" shadow="md">
          <h3
            className="font-semibold mb-4 text-[var(--lt-ink)]"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            Actividad Reciente
          </h3>
          <div className="flex items-center justify-center h-full text-[var(--lt-ink-soft)]">
            [Gráfico de Actividad de Usuarios - Próximamente]
          </div>
        </LtPanel>
        <LtPanel className="col-span-3 p-6 h-[400px]" shadow="md">
          <h3
            className="font-semibold mb-4 text-[var(--lt-ink)]"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            Acciones Rápidas
          </h3>
          <div className="space-y-4">
            <LtButton variant="sticker" tone="sun" size="md" className="w-full justify-start">
              ⚡ Disparar Webhook n8n (Sincronización Manual)
            </LtButton>
            <LtButton variant="outline" tone="paper" size="md" className="w-full justify-start">
              📄 Revisar Documentos Pendientes
            </LtButton>
          </div>
        </LtPanel>
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
    <LtPanel
      className={`p-6 ${isAlert ? 'border-[var(--lt-terracota)] bg-[var(--lt-paper)]' : ''}`}
      shadow="sm"
      tone="paper"
    >
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-[var(--lt-ink-soft)]">
          {title}
        </h3>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="mt-2">
        <div
          className={`text-2xl font-bold text-[var(--lt-ink)] ${isAlert ? 'text-[var(--lt-terracota)]' : ''}`}
          style={isAlert ? undefined : { fontFamily: 'var(--lt-font-serif)' }}
        >
          {value}
        </div>
        <p className="text-xs text-[var(--lt-ink-soft)] mt-1">
          {description}
        </p>
      </div>
    </LtPanel>
  )
}
