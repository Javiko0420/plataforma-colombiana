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

  if (dark) {
    return (
      <div className={className}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb' }}>
            Cupos reclamados:
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fb923c' }}>
            {animatedCount}/{total}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 12,
            borderRadius: 9999,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.15)',
          }}
          role="progressbar"
          aria-valuenow={animatedCount}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={`${animatedCount} de ${total} cupos reclamados`}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 9999,
              background: 'linear-gradient(to right, #f97316, #fbbf24)',
              transition: 'width 0.7s ease-out',
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">
          Cupos reclamados:
        </span>
        <span className="text-sm font-bold text-orange-600">
          {animatedCount}/{total}
        </span>
      </div>
      <div
        className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={animatedCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${animatedCount} de ${total} cupos reclamados`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
