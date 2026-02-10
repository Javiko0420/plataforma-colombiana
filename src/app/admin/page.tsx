import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic' // Siempre datos frescos

async function getDashboardStats() {
  // Ejecutamos consultas en paralelo para velocidad
  const [usersCount, businessesCount, pendingReviews, flaggedPosts] =
    await Promise.all([
      prisma.user.count(),
      prisma.business.count(),
      prisma.review.count({ where: { status: 'FLAGGED' } }),
      prisma.forumPost.count({ where: { isFlagged: true } }),
    ])

  return { usersCount, businessesCount, pendingReviews, flaggedPosts }
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
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
      </div>

      {/* Paneles inferiores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm h-[400px]">
          <h3 className="font-semibold mb-4">Actividad Reciente</h3>
          <div className="flex items-center justify-center h-full text-gray-400">
            [Gráfico de Actividad de Usuarios - Próximamente]
          </div>
        </div>
        <div className="col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm h-[400px]">
          <h3 className="font-semibold mb-4">Acciones Rápidas</h3>
          <div className="space-y-4">
            <button className="w-full text-left px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
              ⚡ Disparar Webhook n8n (Sincronización Manual)
            </button>
            <button className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 transition text-sm font-medium">
              📄 Revisar Documentos Pendientes
            </button>
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
    <div
      className={`p-6 rounded-xl border bg-white dark:bg-slate-800 shadow-sm ${
        isAlert
          ? 'border-red-200 bg-red-50 dark:bg-red-900/10'
          : 'border-gray-200 dark:border-slate-700'
      }`}
    >
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="mt-2">
        <div
          className={`text-2xl font-bold ${isAlert ? 'text-red-600' : ''}`}
        >
          {value}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  )
}
