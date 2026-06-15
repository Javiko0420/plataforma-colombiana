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
      <p
        className="text-sm py-1 pl-3 border-l-2"
        style={{
          color: 'var(--lt-ink-soft)',
          fontFamily: 'var(--lt-font-sans)',
          borderColor: 'var(--lt-ink-soft)',
          opacity: 0.65,
        }}
      >
        {t('sports.worldcup.empty.teams')}
      </p>
    )
  }

  if (teams.length === 0) {
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
        {t('sports.worldcup.empty.teams')}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      {teams.map((team) => (
        <div
          key={team.id}
          className="flex flex-col items-center gap-2.5 p-3 rounded-[var(--lt-radius-md)] border-[1.6px] border-[var(--lt-ink)] text-center transition-all duration-200 hover:-translate-y-1 hover:scale-105 cursor-default"
          style={{
            background: 'var(--lt-paper)',
            boxShadow: 'var(--lt-shadow-sticker)',
          }}
        >
          <Image
            src={team.logo}
            alt={`Bandera de ${team.name}`}
            width={56}
            height={56}
            className="object-contain"
          />
          <span
            className="text-xs font-medium leading-snug"
            style={{ fontFamily: 'var(--lt-font-sans)', color: 'var(--lt-ink)' }}
          >
            {team.name}
          </span>
        </div>
      ))}
    </div>
  )
}
