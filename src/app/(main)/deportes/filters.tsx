"use client"

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import TeamAutocomplete from '@/components/ui/team-autocomplete'
import { useTranslations } from '@/components/providers/language-provider'

export default function SportsFilters({
  defaultTeamId,
  defaultLiveChecked = true,
}: {
  defaultTeamId?: number
  defaultLiveChecked?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useTranslations()

  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const team = String(formData.get('team') || '')
    const teamName = String(formData.get('teamName') || '')
    const live = formData.get('live') ? 'all' : ''

    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.delete('date')
    if (team) {
      params.set('team', team)
      params.delete('teamName')
    } else if (teamName && teamName.trim().length >= 2) {
      params.delete('team')
      params.set('teamName', teamName.trim())
    } else {
      params.delete('team')
      params.delete('teamName')
    }
    if (live) params.set('live', 'all')
    else params.delete('live')

    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return (
    <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-3 items-end" style={{ textAlign: 'left' }}>
      <div className="flex gap-3 items-end md:col-span-2">
        <div className="flex-1">
          <TeamAutocomplete
            name="team"
            label={t('sports.filters.team')}
            placeholder={t('sports.filters.teamPlaceholder')}
            defaultTeamId={defaultTeamId}
          />
        </div>
        <label
          className="flex items-center gap-2 text-sm font-medium cursor-pointer"
          style={{ color: 'var(--lh-fg2)', whiteSpace: 'nowrap', paddingBottom: 12 }}
        >
          <input
            type="checkbox"
            name="live"
            defaultChecked={defaultLiveChecked}
            style={{ width: 16, height: 16, accentColor: 'var(--lh-accent)', cursor: 'pointer' }}
          />
          {t('sports.filters.live')}
        </label>
      </div>
      <button type="submit" className="lh-btn lh-btn--md lh-btn--primary" style={{ marginLeft: 'auto' }}>
        {t('sports.filters.apply')}
      </button>
    </form>
  )
}
