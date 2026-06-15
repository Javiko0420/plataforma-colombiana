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
      {/* Group header — verde = estadio / césped */}
      <div
        className="px-3 py-2.5 border-b-[2px] border-[var(--lt-ink)] font-bold text-sm flex items-center gap-2"
        style={{
          background: 'var(--lt-verde)',
          color: 'var(--lt-paper)',
          fontFamily: 'var(--lt-font-serif)',
        }}
      >
        <span aria-hidden="true">⚽</span>
        {group.group}
      </div>

      <div className="p-3">
        {/* Column headers */}
        <div
          className="grid grid-cols-9 text-xs mb-2 font-bold"
          style={{ color: 'var(--lt-ink-soft)', fontFamily: 'var(--lt-font-sans)' }}
        >
          <div>#</div>
          <div className="col-span-3">{t('sports.team')}</div>
          <div className="text-center">{t('sports.played')}</div>
          <div className="text-center">{t('sports.worldcup.win')}</div>
          <div className="text-center">{t('sports.worldcup.draw')}</div>
          <div className="text-center">{t('sports.worldcup.lose')}</div>
          <div className="text-center font-bold">{t('sports.points')}</div>
        </div>

        <ul className="space-y-0.5">
          {group.standings.map((row, i) => {
            const qualifies = i < 2
            return (
              <li
                key={row.team.id}
                className="grid grid-cols-9 text-sm py-1.5 rounded-sm"
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'var(--lt-bg)',
                  color: 'var(--lt-ink)',
                  fontFamily: 'var(--lt-font-sans)',
                  borderLeft: qualifies
                    ? '3px solid var(--lt-verde)'
                    : '3px solid transparent',
                  paddingLeft: '4px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <div
                  className="font-bold"
                  style={{ color: qualifies ? 'var(--lt-verde)' : 'var(--lt-ink-soft)' }}
                >
                  {row.rank}
                </div>
                <div className="col-span-3 truncate font-medium">{row.team.name}</div>
                <div className="text-center">{row.played}</div>
                <div className="text-center">{row.win}</div>
                <div className="text-center">{row.draw}</div>
                <div className="text-center">{row.lose}</div>
                <div
                  className="text-center font-bold"
                  style={{ color: qualifies ? 'var(--lt-verde)' : 'var(--lt-ink)' }}
                >
                  {row.points}
                </div>
              </li>
            )
          })}
        </ul>

        {/* Qualification legend */}
        <div
          className="mt-3 pt-2 flex items-center gap-1.5 text-xs border-t"
          style={{
            borderColor: 'var(--lt-ink)',
            opacity: 0.4,
            color: 'var(--lt-ink)',
            fontFamily: 'var(--lt-font-sans)',
          }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: 'var(--lt-verde)' }}
            aria-hidden="true"
          />
          Clasifican a octavos
        </div>
      </div>
    </div>
  )
}
