'use client'

import { useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  warm: boolean
}

interface Props {
  variant: number
}

export function ConstellationCanvas({ variant }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<{
    points: Point[]
    raf: number
    w: number
    h: number
    dark: boolean
    variant: number
    reduced: boolean
  }>({ points: [], raf: 0, w: 0, h: 0, dark: false, variant, reduced: false })

  const { resolvedTheme } = useTheme()

  useEffect(() => {
    stateRef.current.dark = resolvedTheme === 'dark'
    // Con reduced-motion no hay bucle de animación: redibujar el frame
    // estático para que el cambio de tema se refleje.
    if (stateRef.current.reduced) drawFrame()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme])

  useEffect(() => {
    stateRef.current.variant = variant
    initPoints()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant])

  function resizeCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const r = parent.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    stateRef.current.w = r.width
    stateRef.current.h = r.height
    canvas.width = r.width * dpr
    canvas.height = r.height * dpr
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  function initPoints() {
    resizeCanvas()
    const counts = [0, 56, 96]
    let n = counts[stateRef.current.variant] ?? 0
    const { w, h } = stateRef.current
    // Menos puntos en pantallas pequeñas: el costo del enlace es O(n²) y en
    // móvil compite con la hidratación y los fetches del home.
    if (w < 640) n = Math.round(n * 0.45)
    const pts: Point[] = []
    for (let i = 0; i < n; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.7 + 0.7,
        warm: Math.random() < 0.13,
      })
    }
    stateRef.current.points = pts
  }

  /** Avanza la simulación un paso (rebote en bordes). */
  function stepPoints() {
    const { w, h, points } = stateRef.current
    for (const p of points) {
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0 || p.x > w) p.vx *= -1
      if (p.y < 0 || p.y > h) p.vy *= -1
    }
  }

  /** Dibuja un frame con el estado actual (sin avanzar la simulación). */
  function drawFrame() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h, points, dark, variant } = stateRef.current
    ctx.clearRect(0, 0, w, h)
    if (!points.length) return

    const base = dark ? '120,170,220' : '46,94,140'
    const warm = dark ? '226,184,106' : '212,162,76'
    const linkDist = variant === 2 ? 150 : 122

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i], b = points[j]
        const dx = a.x - b.x, dy = a.y - b.y
        const d = Math.sqrt(dx * dx + dy * dy)
        if (d < linkDist) {
          const o = (1 - d / linkDist) * (dark ? 0.26 : 0.18)
          ctx.strokeStyle = `rgba(${base},${o})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
    }

    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.warm ? warm : base},${dark ? 0.9 : 0.7})`
      ctx.fill()
    }
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    stateRef.current.reduced = reduced
    initPoints()

    // Sin animación para quien pide movimiento reducido: un solo frame estático.
    if (reduced) {
      drawFrame()
      return
    }

    const onResize = () => {
      resizeCanvas()
    }
    window.addEventListener('resize', onResize, { passive: true })

    const tick = () => {
      stateRef.current.raf = requestAnimationFrame(tick)
      stepPoints()
      drawFrame()
    }

    const start = () => {
      if (stateRef.current.raf) return
      stateRef.current.raf = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(stateRef.current.raf)
      stateRef.current.raf = 0
    }

    // Pausar el bucle cuando el hero sale del viewport: sin esto el O(n²)
    // de los enlaces sigue quemando CPU durante todo el scroll de la página.
    const canvas = canvasRef.current
    let observer: IntersectionObserver | null = null
    if (canvas && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) start(); else stop() },
        { threshold: 0 }
      )
      observer.observe(canvas)
    } else {
      start()
    }

    return () => {
      stop()
      observer?.disconnect()
      window.removeEventListener('resize', onResize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}
