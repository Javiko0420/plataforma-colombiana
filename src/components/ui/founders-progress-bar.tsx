'use client'

import { useEffect, useState } from 'react'

interface FoundersProgressBarProps {
  className?: string
  variant?: 'light' | 'dark'
}

export function FoundersProgressBar({ className = '', variant = 'light' }: FoundersProgressBarProps) {
  const dark = variant === 'dark'
  const [count, setCount] = useState<number>(0)
  const [animatedCount, setAnimatedCount] = useState<number>(0)
  const total = 100

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/founders/count')
        if (res.ok) {
          const data = await res.json()
          setCount(data.count ?? 0)
        }
      } catch {
        setCount(0)
      }
    }
    fetchCount()
  }, [])

  useEffect(() => {
    if (count === 0) return
    const duration = 1500
    const steps = 40
    const increment = count / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= count) {
        setAnimatedCount(count)
        clearInterval(interval)
      } else {
        setAnimatedCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [count])

  const percentage = Math.min((animatedCount / total) * 100, 100)

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-sm font-semibold"
          style={{
            fontFamily: 'var(--lt-font-sans)',
            color: dark ? 'var(--lt-paper)' : 'var(--lt-ink)',
          }}
        >
          Cupos reclamados:
        </span>
        <span
          className="text-sm font-bold"
          style={{ color: 'var(--lt-terracota)' }}
        >
          {animatedCount}/{total}
        </span>
      </div>
      <div
        className="w-full h-3 rounded-full overflow-hidden border-[2px] border-[var(--lt-ink)]"
        style={{ background: dark ? 'rgba(255,250,238,0.15)' : 'var(--lt-bg)' }}
        role="progressbar"
        aria-valuenow={animatedCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${animatedCount} de ${total} cupos reclamados`}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percentage}%`,
            background: 'var(--lt-terracota)',
          }}
        />
      </div>
    </div>
  )
}
