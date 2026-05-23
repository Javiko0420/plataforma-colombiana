'use client'

import { useState } from 'react'
import { Star, User, Flag } from 'lucide-react'
import Image from 'next/image'
import { ReportModal } from '@/components/ui/report-modal'
import { SunMotif } from '@/components/lt/SunMotif'

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
      <div
        className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-[var(--lt-radius-lg)] border-[2px] border-dashed border-[var(--lt-ink)]"
        style={{ background: 'var(--lt-bg)' }}
      >
        <div aria-hidden="true" className="mb-4 opacity-25">
          <SunMotif size={56} />
        </div>
        <p
          className="text-base font-semibold mb-1"
          style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
        >
          Aún no hay reseñas
        </p>
        <p
          className="text-sm max-w-xs"
          style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
        >
          ¡Sé el primero en opinar!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)] p-5"
          style={{ background: 'var(--lt-bg)', boxShadow: 'var(--lt-shadow-sticker)' }}
        >
          <div className="flex items-start justify-between mb-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-[1.6px] border-[var(--lt-ink)]"
                style={{ background: 'var(--lt-paper)' }}
              >
                {review.user.image ? (
                  <Image
                    src={review.user.image}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--lt-ink-soft)' }}>
                    <User className="w-5 h-5" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p
                  className="font-bold text-sm truncate"
                  style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
                >
                  {review.user.name || 'Usuario Anónimo'}
                </p>
                <p className="text-xs" style={{ color: 'var(--lt-ink-soft)' }}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-0.5 shrink-0" aria-label={`Calificación: ${review.rating} de 5`}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-4 h-4"
                  style={{
                    color: star <= review.rating ? 'var(--lt-sun)' : 'var(--lt-ink-soft)',
                    fill: star <= review.rating ? 'var(--lt-sun)' : 'transparent',
                    opacity: star <= review.rating ? 1 : 0.35,
                  }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>

          <p
            className="text-sm leading-relaxed"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink-soft)' }}
          >
            {review.comment}
          </p>

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setReportTarget(review.id)}
              className="text-xs flex items-center gap-1 transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)] rounded px-1"
              style={{ color: 'var(--lt-ink-soft)' }}
              title="Reportar reseña"
            >
              <Flag className="w-3 h-3" aria-hidden="true" />
              Reportar
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
