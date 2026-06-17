'use client'

import { useState } from 'react'
import { Star, User, Flag } from 'lucide-react'
import Image from 'next/image'
import { ReportModal } from '@/components/ui/report-modal'

interface ReviewProps {
  reviews: {
    id: string
    rating: number
    comment: string
    createdAt: Date
    user: {
      name: string | null
      image: string | null
    }
  }[]
}

export default function ReviewsList({ reviews }: ReviewProps) {
  const [reportTarget, setReportTarget] = useState<string | null>(null)

  if (reviews.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px', borderRadius: 16, border: '1.5px dashed var(--lh-border)', background: 'var(--lh-surface)' }}>
        <Star size={32} style={{ color: 'var(--lh-fg3)', opacity: 0.5, marginBottom: 12 }} aria-hidden="true" />
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--lh-fg)', margin: '0 0 4px' }}>Aún no hay reseñas</p>
        <p style={{ fontSize: 14, color: 'var(--lh-fg3)', margin: 0 }}>¡Sé el primero en opinar!</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {reviews.map((review) => (
        <div key={review.id} className="lh-card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <div style={{ position: 'relative', width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--lh-surface2)', border: '1px solid var(--lh-border)' }}>
                {review.user.image ? (
                  <Image src={review.user.image} alt="" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--lh-fg3)' }}>
                    <User size={20} aria-hidden="true" />
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <p className="truncate" style={{ fontWeight: 600, fontSize: 14, color: 'var(--lh-fg)', margin: 0 }}>
                  {review.user.name || 'Usuario Anónimo'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: 0 }}>{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} aria-label={`Calificación: ${review.rating} de 5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  style={{
                    color: star <= review.rating ? 'var(--lh-warm)' : 'var(--lh-fg3)',
                    fill: star <= review.rating ? 'var(--lh-warm)' : 'transparent',
                    opacity: star <= review.rating ? 1 : 0.35,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--lh-fg2)', margin: 0 }}>{review.comment}</p>

          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setReportTarget(review.id)}
              style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--lh-fg3)', background: 'transparent', border: 0, cursor: 'pointer' }}
              title="Reportar reseña"
            >
              <Flag size={12} aria-hidden="true" /> Reportar
            </button>
          </div>
        </div>
      ))}

      {reportTarget && (
        <ReportModal
          isOpen={!!reportTarget}
          onClose={() => setReportTarget(null)}
          targetId={reportTarget}
          targetType="review"
        />
      )}
    </div>
  )
}
