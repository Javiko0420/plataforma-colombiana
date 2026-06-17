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
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="lh-h2" style={{ fontSize: 'clamp(22px,3.4vw,28px)', margin: 0 }}>Moderación de reseñas</h1>
          <p style={{ fontSize: 14, color: 'var(--lh-fg2)', margin: '4px 0 0' }}>
            Reseñas reportadas por usuarios que requieren revisión.
          </p>
        </div>
        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: '5px 11px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-accent) 14%, transparent)', color: 'var(--lh-accent)', fontSize: 12.5, fontWeight: 600 }}>
          Pendientes: {flaggedReviews.length}
        </span>
      </div>

      {flaggedReviews.length === 0 ? (
        <div className="lh-card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 4px' }}>¡Todo limpio!</h3>
          <p style={{ color: 'var(--lh-fg2)', margin: 0 }}>No hay reseñas pendientes de moderación.</p>
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
