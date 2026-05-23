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
        className="text-xs flex items-center gap-1 transition-colors hover:opacity-80"
        style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
        aria-label="Reportar este negocio"
      >
        <Flag className="w-3 h-3" />
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
