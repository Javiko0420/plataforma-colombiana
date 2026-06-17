'use client'

import { useState, useTransition } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { approveReview, hideReview } from '@/app/(main)/admin/resenas/actions'

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
    <div className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
      {/* Header: Usuario y Negocio */}
      <div style={{ padding: 16, borderBottom: '1px solid var(--lh-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, background: 'var(--lh-surface2)' }}>
        <div style={{ display: 'flex', gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--lh-accent),var(--lh-accent-ink))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
            {review.user.name?.[0] || 'U'}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>
              {review.user.name || 'Usuario Anónimo'}
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--lh-fg3)', marginLeft: 8 }}>({review.user.email})</span>
            </p>
            <p style={{ fontSize: 12, color: 'var(--lh-fg3)', margin: 0 }}>
              Reseñó a <span style={{ fontWeight: 500, color: 'var(--lh-accent)' }}>{review.business.name}</span> •{' '}
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>
        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', padding: '4px 9px', borderRadius: 99, background: 'color-mix(in oklch, var(--lh-warm) 14%, transparent)', color: 'var(--lh-warm)', fontSize: 11.5, fontWeight: 600 }}>
          ⚠️ {review.reportCount} reportes
        </span>
      </div>

      {/* Contenido de la Reseña */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ fontSize: 17, color: i < review.rating ? 'var(--lh-warm)' : 'var(--lh-fg3)', opacity: i < review.rating ? 1 : 0.4 }}>★</span>
          ))}
        </div>
        <p style={{ color: 'var(--lh-fg)', fontSize: 14, lineHeight: 1.6, background: 'var(--lh-surface2)', padding: 12, borderRadius: 12, border: '1px dashed var(--lh-border)', margin: 0 }}>
          &ldquo;{review.comment}&rdquo;
        </p>

        {review.reports.length > 0 && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--lh-terra)', textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>Motivos de denuncia:</p>
            <ul style={{ fontSize: 12, color: 'var(--lh-fg3)', listStyle: 'disc', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {review.reports.slice(0, 3).map((rep, idx) => (
                <li key={idx}>
                  <span style={{ fontWeight: 500, color: 'var(--lh-fg)' }}>{rep.reason}</span>
                  {rep.details && <span style={{ color: 'var(--lh-fg3)' }}> - &ldquo;{rep.details}&rdquo;</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div style={{ padding: 12, background: 'var(--lh-surface2)', borderTop: '1px solid var(--lh-border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" onClick={handleReject} disabled={isPending} className="lh-btn lh-btn--sm lh-btn--secondary" style={{ color: 'var(--lh-terra)', borderColor: 'color-mix(in oklch, var(--lh-terra) 35%, transparent)', opacity: isPending ? 0.6 : 1 }}>
          🗑️ Eliminar
        </button>
        <button type="button" onClick={handleApprove} disabled={isPending} className="lh-btn lh-btn--sm" style={{ background: 'var(--lh-green)', color: '#fff', opacity: isPending ? 0.6 : 1 }}>
          ✅ Aprobar y publicar
        </button>
      </div>
    </div>
  )
}
