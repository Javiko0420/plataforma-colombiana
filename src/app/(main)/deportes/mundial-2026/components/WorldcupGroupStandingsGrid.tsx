import { getWorldcupStandings } from '@/lib/sports/worldcup/service'
import { translate } from '@/lib/i18n'
import type { WorldCupStandingsGroup } from '@/lib/sports/worldcup/types'
import GroupStandingsTable from './GroupStandingsTable'

export default async function WorldcupGroupStandingsGrid({ locale }: { locale: 'es' | 'en' }) {
  const t = (k: string) => translate(k, { locale })

  let groups: WorldCupStandingsGroup[] = []
  try {
    const data = await getWorldcupStandings()
    groups = data.groups
  } catch {
    return (
      <p className="text-sm" style={{ color: 'var(--lh-fg3)' }}>
        {t('sports.worldcup.empty.standings')}
      </p>
    )
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--lh-fg3)' }}>
        {t('sports.worldcup.empty.standings')}
      </p>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {groups.map((group) => (
        <GroupStandingsTable key={group.group} group={group} locale={locale} />
      ))}
    </div>
  )
}
