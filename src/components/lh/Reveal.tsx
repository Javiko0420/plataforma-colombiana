'use client'

import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Retardo en ms para escalonar (stagger) */
  delay?: number
  className?: string
  style?: CSSProperties
}

/**
 * Aparición progresiva al hacer scroll (fade + translateY).
 * Usa IntersectionObserver, se dispara una sola vez.
 * El estado reducido de movimiento se respeta vía CSS (.lh-reveal en prefers-reduced-motion).
 */
export function Reveal({ children, delay = 0, className = '', style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('lh-in')
          obs.disconnect()
        }
      },
      { threshold: 0.08 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`lh-reveal${className ? ` ${className}` : ''}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  )
}
