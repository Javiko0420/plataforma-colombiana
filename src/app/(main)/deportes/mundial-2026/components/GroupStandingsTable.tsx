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
    <div className="lh-card" style={{ overflow: 'hidden', padding: 0 }}>
      {/* Group header — verde = estadio / césped */}
      <div
        className="flex items-center gap-2"
        style={{ padding: '12px 14px', borderBottom: '1px solid var(--lh-border)', background: 'color-mix(in oklch, var(--lh-green) 12%, var(--lh-surface))', fontFamily: 'var(--lh-font)', fontWeight: 600, fontSize: 14, color: 'var(--lh-fg)' }}
      >
        <span aria-hidden="true">⚽</span>
        {group.group}
      </div>

      <div style={{ padding: 14 }}>
        {/* Column headers */}
        <div
          className="grid grid-cols-9"
          style={{ fontFamily: 'var(--lh-mono)', fontSize: 10.5, fontWeight: 600, color: 'var(--lh-fg3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.04em' }}
        >
          <div>#</div>
          <div className="col-span-3">{t('sports.team')}</div>
          <div className="text-center">{t('sports.played')}</div>
          <div className="text-center">{t('sports.worldcup.win')}</div>
          <div className="text-center">{t('sports.worldcup.draw')}</div>
          <div className="text-center">{t('sports.worldcup.lose')}</div>
          <div className="text-center">{t('sports.points')}</div>
        </div>

        <ul className="space-y-0.5">
          {group.standings.map((row, i) => {
            const qualifies = i < 2
            return (
              <li
                key={row.team.id}
                className="grid grid-cols-9"
                style={{
                  fontSize: 13.5, padding: '6px 0 6px 6px', borderRadius: 6,
                  color: 'var(--lh-fg)',
                  borderLeft: qualifies ? '3px solid var(--lh-green)' : '3px solid transparent',
                  fontVariantNumeric: 'tabular-nums',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: 700, color: qualifies ? 'var(--lh-green)' : 'var(--lh-fg3)' }}>{row.rank}</div>
                <div className="col-span-3 truncate" style={{ fontWeight: 500 }}>{row.team.name}</div>
                <div className="text-center" style={{ color: 'var(--lh-fg2)' }}>{row.played}</div>
                <div className="text-center" style={{ color: 'var(--lh-fg2)' }}>{row.win}</div>
                <div className="text-center" style={{ color: 'var(--lh-fg2)' }}>{row.draw}</div>
                <div className="text-center" style={{ color: 'var(--lh-fg2)' }}>{row.lose}</div>
                <div className="text-center" style={{ fontWeight: 700, color: qualifies ? 'var(--lh-green)' : 'var(--lh-fg)' }}>{row.points}</div>
              </li>
            )
          })}
        </ul>

        {/* Qualification legend */}
        <div
          className="flex items-center gap-1.5"
          style={{ marginTop: 12, paddingTop: 10, fontSize: 12, borderTop: '1px solid var(--lh-border2)', color: 'var(--lh-fg3)' }}
        >
          <span className="inline-block" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lh-green)' }} aria-hidden="true" />
          Clasifican a octavos
        </div>
      </div>
    </div>
  )
}
