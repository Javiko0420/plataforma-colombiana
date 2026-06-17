'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { ReportModal } from '@/components/ui/report-modal'

interface ReportBusinessButtonProps {
  businessId: string
}

export function ReportBusinessButton({ businessId }: ReportBusinessButtonProps) {
  const [isReportOpen, setIsReportOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsReportOpen(true)}
        style={{ fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--lh-fg3)', background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'var(--lh-font)' }}
        aria-label="Reportar este negocio"
      >
        <Flag size={13} />
        Reportar este negocio
      </button>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={businessId}
        targetType="business"
      />
    </>
  )
}
