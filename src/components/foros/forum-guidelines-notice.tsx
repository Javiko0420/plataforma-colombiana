'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, X } from 'lucide-react'

/**
 * Dismissible community-guidelines notice shown at the top of the /foros hub.
 * Replaces the former per-card modal gate: it surfaces the same acknowledgment
 * (text-only V1, no personal data, posts expire in ~24h) once, and remembers
 * the dismissal in localStorage. Strings are passed in already translated.
 */

const STORAGE_KEY = 'lt_forum_guidelines_notice_v1'

interface ForumGuidelinesNoticeProps {
  title: string
  body: string
  linkLabel: string
  dismissLabel: string
}

export function ForumGuidelinesNotice({ title, body, linkLabel, dismissLabel }: ForumGuidelinesNoticeProps) {
  // Start hidden to avoid an SSR/CSR flash; reveal after reading localStorage.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  return (
    <div
      role="note"
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 28, padding: '14px 16px', borderRadius: 14, border: '1px solid var(--lh-border)', background: 'var(--lh-surface)' }}
    >
      <span aria-hidden="true" style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in oklch, var(--lh-green) 14%, transparent)', color: 'var(--lh-green)' }}>
        <ShieldCheck size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--lh-fg)', margin: '2px 0 4px' }}>{title}</p>
        <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'var(--lh-fg2)', margin: 0 }}>
          {body}{' '}
          <Link href="/normas-comunidad" target="_blank" style={{ fontWeight: 600, color: 'var(--lh-accent)', textDecoration: 'underline' }}>
            {linkLabel}
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={dismissLabel}
        style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: '1px solid var(--lh-border)', background: 'var(--lh-surface2)', color: 'var(--lh-fg3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
