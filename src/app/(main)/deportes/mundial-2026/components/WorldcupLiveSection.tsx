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
      className="inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded"
      style={{
        background: 'var(--lt-terracota)',
        color: 'var(--lt-paper)',
        fontFamily: 'var(--lt-font-sans)',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <span className="animate-pulse leading-none" aria-hidden="true">●</span>
      {fx.status.elapsed}&apos;
    </span>
  )
}

function FixtureRow({ fx }: { fx: WorldCupFixture }) {
  return (
    <li
      className="rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] p-3 transition-all hover:-translate-y-0.5"
      style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker-lg)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs"
          style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
        >
          {fx.round}
        </span>
        <LiveElapsedBadge fx={fx} />
      </div>
      <div
        className="flex items-center justify-between font-bold text-base"
        style={{ fontFamily: 'var(--lt-font-serif)', color: 'var(--lt-ink)' }}
      >
        <span className="flex-1 text-right pr-3 leading-tight">{fx.teams.home.name}</span>
        <span
          className="px-3 py-1 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0 text-sm"
          style={{
            background: 'var(--lt-ink)',
            color: 'var(--lt-paper)',
            boxShadow: '2px 2px 0 var(--lt-terracota)',
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.04em',
          }}
        >
          {fx.goals.home ?? '–'} : {fx.goals.away ?? '–'}
        </span>
        <span className="flex-1 pl-3 leading-tight">{fx.teams.away.name}</span>
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
      <p
        className="text-sm py-1 pl-3 border-l-2"
        style={{
          color: 'var(--lt-ink-soft)',
          fontFamily: 'var(--lt-font-sans)',
          borderColor: 'var(--lt-ink-soft)',
          opacity: 0.65,
        }}
      >
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
