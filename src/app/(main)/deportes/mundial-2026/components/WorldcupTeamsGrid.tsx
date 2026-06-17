import Image from 'next/image'
import { getWorldcupTeams } from '@/lib/sports/worldcup/service'
import { translate } from '@/lib/i18n'
import type { WorldCupTeam } from '@/lib/sports/worldcup/types'

export default async function WorldcupTeamsGrid({ locale }: { locale: 'es' | 'en' }) {
  const t = (k: string) => translate(k, { locale })

  let teams: WorldCupTeam[] = []
  try {
    const data = await getWorldcupTeams()
    teams = data.teams
  } catch {
    return (
      <p className="text-sm py-1 pl-3" style={{ color: 'var(--lh-fg3)', borderLeft: '2px solid var(--lh-border)' }}>
        {t('sports.worldcup.empty.teams')}
      </p>
    )
  }

  if (teams.length === 0) {
    return (
      <p className="text-sm py-1 pl-3" style={{ color: 'var(--lh-fg3)', borderLeft: '2px solid var(--lh-border)' }}>
        {t('sports.worldcup.empty.teams')}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {teams.map((team) => (
        <div
          key={team.id}
          className="lh-card lh-card--interactive flex flex-col items-center gap-2.5 text-center"
          style={{ padding: 14 }}
        >
          <Image
            src={team.logo}
            alt={`Bandera de ${team.name}`}
            width={56}
            height={56}
            className="object-contain"
          />
          <span style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.35, color: 'var(--lh-fg)' }}>
            {team.name}
          </span>
        </div>
      ))}
    </div>
  )
}
