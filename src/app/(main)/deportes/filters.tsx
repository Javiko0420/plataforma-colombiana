"use client"

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import TeamAutocomplete from '@/components/ui/team-autocomplete'
import { AccessibleButton } from '@/components/ui/accessible-button'
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

    const to = `${pathname}?${params.toString()}`
    router.push(to)
  }, [router, pathname, searchParams])

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-3 items-end">
      <div className="flex gap-3 items-end md:col-span-2">
        <div className="flex-1">
          <TeamAutocomplete
            name="team"
            label={t('sports.filters.team')}
            placeholder={t('sports.filters.teamPlaceholder')}
            defaultTeamId={defaultTeamId}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="live" defaultChecked={defaultLiveChecked} /> {t('sports.filters.live')}
        </label>
      </div>
      <AccessibleButton type="submit" variant="primary" size="lg" className="ml-auto rounded-full border-2 border-blue-700 dark:border-blue-500 hover:border-blue-800 dark:hover:border-blue-400 shadow-none">
        {t('sports.filters.apply')}
      </AccessibleButton>
    </form>
  )
}


