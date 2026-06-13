import { translate } from '@/lib/i18n'
import type { WorldCupStandingsGroup } from '@/lib/sports/worldcup/types'

export default function GroupStandingsTable({
  group,
  locale,
}: {
  group: WorldCupStandingsGroup
  locale: 'es' | 'en'
}) {
  const t = (k: string) => translate(k, { locale })
  return (
    <div
      className="rounded-[var(--lt-radius-md)] border-[2px] border-[var(--lt-ink)] overflow-hidden"
      style={{ background: 'var(--lt-paper)', boxShadow: 'var(--lt-shadow-sticker)' }}
    >
      {/* Group header */}
      <div
        className="p-3 border-b-[2px] border-[var(--lt-ink)] font-bold text-sm"
        style={{
          background: 'var(--lt-terracota)',
          color: 'var(--lt-paper)',
          fontFamily: 'var(--lt-font-serif)',
        }}
      >
        {group.group}
      </div>

      <div className="p-3">
        {/* Column headers: # | Team (span 3) | Pld | W | D | L | Pts */}
        <div
          className="grid grid-cols-9 text-xs mb-2 font-bold"
          style={{ color: 'var(--lt-ink-soft)' }}
        >
          <div>#</div>
          <div className="col-span-3">{t('sports.team')}</div>
          <div className="text-center">{t('sports.played')}</div>
          <div className="text-center">{t('sports.worldcup.win')}</div>
          <div className="text-center">{t('sports.worldcup.draw')}</div>
          <div className="text-center">{t('sports.worldcup.lose')}</div>
          <div className="text-center font-bold">{t('sports.points')}</div>
        </div>

        <ul className="space-y-1">
          {group.standings.map((row, i) => (
            <li
              key={row.team.id}
              className="grid grid-cols-9 text-sm py-1 rounded-sm"
              style={{
                background: i % 2 === 0 ? 'transparent' : 'var(--lt-bg)',
                color: 'var(--lt-ink)',
                fontFamily: 'var(--lt-font-sans)',
              }}
            >
              <div className="font-bold" style={{ color: 'var(--lt-ink-soft)' }}>
                {row.rank}
              </div>
              <div className="col-span-3 truncate font-medium">{row.team.name}</div>
              <div className="text-center">{row.played}</div>
              <div className="text-center">{row.win}</div>
              <div className="text-center">{row.draw}</div>
              <div className="text-center">{row.lose}</div>
              <div className="text-center font-bold">{row.points}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
