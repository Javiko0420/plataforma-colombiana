'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  targetDate: Date
  className?: string
  variant?: 'light' | 'dark'
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function CountdownTimer({ targetDate, className = '', variant = 'light' }: CountdownTimerProps) {
  const dark = variant === 'dark'
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const blocks = [
    { value: timeLeft.days, label: 'DÍAS' },
    { value: timeLeft.hours, label: 'HORAS' },
  ]

  if (dark) {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#d1d5db', whiteSpace: 'nowrap' }}>
          Cierre de convocatoria en:
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {blocks.map((block) => (
            <div key={block.label} style={{ textAlign: 'center' }}>
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                borderRadius: 4,
                padding: '4px 8px',
                minWidth: 36,
              }}>
                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {String(block.value).padStart(2, '0')}
                </span>
              </div>
              <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {block.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: '#4b5563', whiteSpace: 'nowrap' }}>
        Cierre de convocatoria en:
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        {blocks.map((block) => (
          <div key={block.label} style={{ textAlign: 'center' }}>
            <div style={{
              background: '#111827',
              color: '#fff',
              borderRadius: 4,
              padding: '4px 8px',
              minWidth: 36,
            }}>
              <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {String(block.value).padStart(2, '0')}
              </span>
            </div>
            <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
