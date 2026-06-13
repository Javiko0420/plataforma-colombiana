'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from '@/components/providers/language-provider'
import type { WorldCupLiveResponse, WorldCupFixture } from '@/lib/sports/worldcup/types'

const POLL_LIVE_MS = 15_000
const POLL_IDLE_MS = 60_000

function FixtureRow({ fx }: { fx: WorldCupFixture }) {
  return (
    <li
      className="rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] p-3 transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
    >
      <div className="text-xs mb-1.5" style={{ color: 'var(--lt-ink-soft)' }}>
        {fx.round}
      </div>
      <div
        className="flex items-center justify-between text-base font-bold"
        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
      >
        <span className="flex-1 text-right pr-2">{fx.teams.home.name}</span>
        <span
          className="px-3 py-1 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0 text-sm"
          style={{
            background: 'var(--lt-terracota)',
            color: 'var(--lt-paper)',
            boxShadow: '2px 2px 0 var(--lt-ink)',
          }}
        >
          {fx.goals.home ?? '-'} : {fx.goals.away ?? '-'}
        </span>
        <span className="flex-1 pl-2">{fx.teams.away.name}</span>
      </div>
      <div className="text-xs text-center mt-1.5" style={{ color: 'var(--lt-ink-soft)' }}>
        {fx.status.long}
        {fx.status.elapsed != null ? ` ${fx.status.elapsed}'` : ''}
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
      <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
        {t('sports.empty.live')}
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {data.fixtures.map((fx) => (
        <FixtureRow key={fx.id} fx={fx} />
      ))}
    </ul>
  )
}
