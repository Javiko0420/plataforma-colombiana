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
      <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
        {t('sports.worldcup.empty.teams')}
      </p>
    )
  }

  if (teams.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}>
        {t('sports.worldcup.empty.teams')}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {teams.map((team) => (
        <div
          key={team.id}
          className="flex flex-col items-center gap-2 p-3 rounded-[var(--lt-radius-md)] border-[1.6px] border-[var(--lt-ink)] text-center"
          style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
        >
          <Image
            src={team.logo}
            alt={team.name}
            width={40}
            height={40}
            className="object-contain"
          />
          <span
            className="text-xs font-medium leading-tight"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
          >
            {team.name}
          </span>
        </div>
      ))}
    </div>
  )
}
