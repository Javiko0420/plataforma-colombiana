'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AccessibleModal } from '@/components/ui/accessible-modal'

interface ForumGuidelinesBannerProps {
  children: React.ReactNode
  targetUrl?: string
  onAccept?: () => void
}

const STORAGE_KEY = 'latinterritory_forum_guidelines_v1'

export function ForumGuidelinesBanner({
  children,
  targetUrl,
  onAccept,
}: ForumGuidelinesBannerProps) {
  const [open, setOpen] = useState(false)
  const [hasAcknowledged, setHasAcknowledged] = useState(false)
  const router = useRouter()

  // Check if the user already accepted the guidelines
  useEffect(() => {
    const acknowledged = localStorage.getItem(STORAGE_KEY)
    if (acknowledged) {
      setHasAcknowledged(true)
    }
  }, [])

  const handleTrigger = (e: React.MouseEvent) => {
    // If already accepted, let the original event flow or navigate directly
    if (hasAcknowledged) {
      if (targetUrl) router.push(targetUrl)
      if (onAccept) onAccept()
      return
    }

    // If NOT accepted, prevent the action and show the modal
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }

  const handleConfirm = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setHasAcknowledged(true)
    setOpen(false)

    if (targetUrl) router.push(targetUrl)
    if (onAccept) onAccept()
  }

  return (
    <>
      <div onClick={handleTrigger} className="inline-block cursor-pointer">
        {children}
      </div>

      <AccessibleModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="⚠️ Aviso Importante del Foro"
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--lh-fg2)', margin: 0 }}>
            Foros V1: solo texto y publicaciones se eliminan automáticamente en ~24 horas.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 600, color: 'var(--lh-fg)', margin: 0 }}>
            No compartas datos personales ni acusaciones sin fundamento.{' '}
            <span style={{ fontWeight: 400, color: 'var(--lh-fg2)' }}>Prohibidos enlaces acortados.</span>
          </p>

          <Link
            href="/normas-comunidad"
            target="_blank"
            style={{ fontSize: 14, fontWeight: 500, color: 'var(--lh-accent)', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'underline' }}
          >
            📄 Lee las Community Guidelines completas aquí
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 12, borderTop: '1px solid var(--lh-border2)' }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="lh-btn lh-btn--sm lh-btn--ghost"
              style={{ minHeight: 44 }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="lh-btn lh-btn--sm lh-btn--primary"
              style={{ minHeight: 44 }}
            >
              Entendido, entrar
            </button>
          </div>
        </div>
      </AccessibleModal>
    </>
  )
}
