'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { approveReview, hideReview } from '@/app/(main)/admin/resenas/actions'
import { LtPanel, LtBadge, LtButton } from '@/components/lt'

interface ReviewCardProps {
  review: {
    id: string
    rating: number
    comment: string
    createdAt: Date
    reportCount: number
    user: { name: string | null; email: string; image: string | null }
    business: { name: string; slug: string }
    reports: { reason: string; details: string | null }[]
  }
}

export function ReviewModerationCard({ review }: ReviewCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isResolved, setIsResolved] = useState(false)

  const handleApprove = () => {
    startTransition(async () => {
      await approveReview(review.id)
      setIsResolved(true)
    })
  }

  const handleReject = () => {
    startTransition(async () => {
      await hideReview(review.id, 'Contenido inapropiado confirmado por moderador')
      setIsResolved(true)
    })
  }

  if (isResolved) return null

  return (
    <LtPanel className="overflow-hidden hover:shadow-[var(--lt-shadow-sticker-lg)] transition-shadow p-0" shadow="md">
      {/* Header: Usuario y Negocio */}
      <div className="p-4 border-b-[2.2px] border-[var(--lt-ink)] flex justify-between items-start bg-[var(--lt-bg)]">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--lt-sun)] border-[2px] border-[var(--lt-ink)] flex items-center justify-center text-[var(--lt-ink)] font-bold shrink-0">
            {review.user.name?.[0] || 'U'}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--lt-ink)]">
              {review.user.name || 'Usuario Anónimo'}
              <span className="text-xs font-normal text-[var(--lt-ink-soft)] ml-2">
                ({review.user.email})
              </span>
            </p>
            <p className="text-xs text-[var(--lt-ink-soft)]">
              Reseñó a{' '}
              <span className="font-medium text-[var(--lt-accent)]">
                {review.business.name}
              </span>{' '}
              •{' '}
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
                locale: es,
              })}
            </p>
          </div>
        </div>
        <LtBadge tone="sun">
          ⚠️ {review.reportCount} Reportes
        </LtBadge>
      </div>

      {/* Contenido de la Reseña */}
      <div className="p-4">
        <div className="flex items-center mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-lg ${i < review.rating ? 'text-[var(--lt-sun)]' : 'text-[var(--lt-ink-soft)] opacity-40'}`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-[var(--lt-ink)] text-sm leading-relaxed bg-[var(--lt-bg)] p-3 rounded-[var(--lt-radius-sm)] border-[2px] border-dashed border-[var(--lt-ink)]/30">
          &ldquo;{review.comment}&rdquo;
        </p>

        {/* Razones de los reportes */}
        {review.reports.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-[var(--lt-terracota)] uppercase tracking-wide">
              Motivos de denuncia:
            </p>
            <ul className="text-xs text-[var(--lt-ink-soft)] space-y-1 list-disc pl-4">
              {review.reports.slice(0, 3).map((rep, idx) => (
                <li key={idx}>
                  <span className="font-medium text-[var(--lt-ink)]">
                    {rep.reason}
                  </span>
                  {rep.details && (
                    <span className="text-[var(--lt-ink-soft)]">
                      {' '}
                      - &ldquo;{rep.details}&rdquo;
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="p-3 bg-[var(--lt-bg)] border-t-[2.2px] border-[var(--lt-ink)] flex justify-end gap-2">
        <LtButton
          variant="outline"
          tone="paper"
          size="sm"
          onClick={handleReject}
          disabled={isPending}
          loading={isPending}
          loadingText="Procesando..."
        >
          🗑️ Eliminar
        </LtButton>
        <LtButton
          variant="sticker"
          tone="verde"
          size="sm"
          onClick={handleApprove}
          disabled={isPending}
          loading={isPending}
          loadingText="Procesando..."
        >
          ✅ Aprobar y Publicar
        </LtButton>
      </div>
    </LtPanel>
  )
}
