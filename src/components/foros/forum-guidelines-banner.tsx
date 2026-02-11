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
        <div className="space-y-4">
          <p className="text-base text-gray-700 dark:text-gray-300">
            Foros V1: solo texto y publicaciones se eliminan automáticamente
            en ~24 horas.
          </p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">
            No compartas datos personales ni acusaciones sin fundamento.{' '}
            <span className="font-normal">Prohibidos enlaces acortados.</span>
          </p>

          <div className="pt-1">
            <Link
              href="/normas-comunidad"
              target="_blank"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              📄 Lee las Community Guidelines completas aquí
            </Link>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              Entendido, entrar
            </button>
          </div>
        </div>
      </AccessibleModal>
    </>
  )
}
