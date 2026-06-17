'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@/components/providers/language-provider'
import type { WorldCupLiveResponse, WorldCupFixture } from '@/lib/sports/worldcup/types'

const POLL_LIVE_MS = 15_000
const POLL_IDLE_MS = 60_000

function LiveElapsedBadge({ fx }: { fx: WorldCupFixture }) {
  if (fx.status.elapsed == null) return null
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5"
      style={{ background: 'var(--lh-terra)', color: '#fff', borderRadius: 99, fontVariantNumeric: 'tabular-nums' }}
    >
      <span className="animate-pulse leading-none" aria-hidden="true">●</span>
      {fx.status.elapsed}&apos;
    </span>
  )
}

function FixtureRow({ fx }: { fx: WorldCupFixture }) {
  return (
    <li className="lh-card" style={{ padding: 14 }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ fontSize: 12, color: 'var(--lh-fg3)' }}>{fx.round}</span>
        <LiveElapsedBadge fx={fx} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontWeight: 600, fontSize: 15, color: 'var(--lh-fg)' }}>
        <span style={{ flex: 1, textAlign: 'right', lineHeight: 1.2 }}>{fx.teams.home.name}</span>
        <span
          className="shrink-0"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 56, padding: '5px 12px', borderRadius: 10, background: 'color-mix(in oklch, var(--lh-terra) 14%, transparent)', color: 'var(--lh-terra)', fontWeight: 700, fontSize: 14, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}
        >
          {fx.goals.home ?? '–'} : {fx.goals.away ?? '–'}
        </span>
        <span style={{ flex: 1, lineHeight: 1.2 }}>{fx.teams.away.name}</span>
      </div>
    </li>
  )
}

export default function WorldcupLiveSection({
  initialData,
}: {
  initialData: WorldCupLiveResponse
}) {
  const [data, setData] = useState<WorldCupLiveResponse>(initialData)
  const { t } = useTranslations()

  useEffect(() => {
    const delay = data.hasLive ? POLL_LIVE_MS : POLL_IDLE_MS
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/sports/worldcup/live')
        if (res.ok) {
          const next = (await res.json()) as WorldCupLiveResponse
          setData(next)
        }
      } catch {
        // Stale display is better than a broken UI
      }
    }, delay)
    return () => clearInterval(id)
  }, [data.hasLive])

  if (data.fixtures.length === 0) {
    return (
      <p className="text-sm py-1 pl-3" style={{ color: 'var(--lh-fg3)', borderLeft: '2px solid var(--lh-border)' }}>
        {t('sports.empty.live')}
      </p>
    )
  }

  return (
    <ul className="space-y-2.5">
      {data.fixtures.map((fx) => (
        <FixtureRow key={fx.id} fx={fx} />
      ))}
    </ul>
  )
}
