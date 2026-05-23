import { prisma } from '@/lib/prisma'
import { ReviewModerationCard } from '@/components/admin/review-moderation-card'
import { LtBadge, LtPanel } from '@/components/lt'

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
          <h1
            className="text-2xl font-bold text-[var(--lt-ink)]"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            Moderación de Reseñas
          </h1>
          <p className="text-sm text-[var(--lt-ink-soft)] mt-1">
            Reseñas reportadas por usuarios que requieren revisión.
          </p>
        </div>
        <LtBadge tone="accent">
          Pendientes: {flaggedReviews.length}
        </LtBadge>
      </div>

      {flaggedReviews.length === 0 ? (
        <LtPanel className="text-center py-20 border-dashed" shadow="sm">
          <div className="text-4xl mb-4">🎉</div>
          <h3
            className="text-lg font-medium text-[var(--lt-ink)]"
            style={{ fontFamily: 'var(--lt-font-serif)' }}
          >
            ¡Todo limpio!
          </h3>
          <p className="text-[var(--lt-ink-soft)]">
            No hay reseñas pendientes de moderación.
          </p>
        </LtPanel>
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
