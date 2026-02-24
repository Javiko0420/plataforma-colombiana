import { prisma } from '@/lib/prisma'
import { ReviewModerationCard } from '@/components/admin/review-moderation-card'

export const dynamic = 'force-dynamic'

export default async function ReviewsModerationPage() {
  // Obtener reseñas que requieren atención
  // Incluye: FLAGGED (auto-ocultas por 3+ reportes) y cualquiera con al menos 1 reporte
  const flaggedReviews = await prisma.review.findMany({
    where: {
      OR: [
        { status: 'FLAGGED' },
        { reportCount: { gt: 0 } },
      ],
    },
    include: {
      user: {
        select: { name: true, email: true, image: true },
      },
      business: {
        select: { name: true, slug: true },
      },
      reports: {
        select: { reason: true, details: true },
      },
    },
    orderBy: [
      { status: 'asc' }, // FLAGGED primero (prioridad alta)
      { reportCount: 'desc' }, // Más reportes = más urgente
      { createdAt: 'asc' }, // Las más antiguas primero para evitar backlog
    ],
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Moderación de Reseñas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Reseñas reportadas por usuarios que requieren revisión.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
          Pendientes: {flaggedReviews.length}
        </div>
      </div>

      {flaggedReviews.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            ¡Todo limpio!
          </h3>
          <p className="text-gray-500">
            No hay reseñas pendientes de moderación.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {flaggedReviews.map((review) => (
            <ReviewModerationCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}
