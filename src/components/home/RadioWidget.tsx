'use client'

import Link from 'next/link'
import { Play, Pause, Loader2, Radio as RadioIcon } from 'lucide-react'
import { useAudio, stations } from '@/components/providers/audio-provider'

/* Emisora destacada del widget: Tropicana Bogotá (colombiana, metadata real). */
const FEATURED = stations[0]

export function RadioWidget() {
  const { play, pause, currentStation, isPlaying, isLoading, nowPlaying } = useAudio()
  const isCurrent = currentStation?.id === FEATURED.id
  const playing = isCurrent && isPlaying
  const loading = isCurrent && isLoading

  /* El botón vive dentro de un <Link>: evitamos navegar al reproducir. */
  const onToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (playing) pause()
    else void play(FEATURED)
  }

  const subtitle =
    playing && nowPlaying?.title
      ? `${nowPlaying.title}${nowPlaying.artist ? ' — ' + nowPlaying.artist : ''}`
      : FEATURED.tags?.slice(0, 3).join(' · ') || FEATURED.country || 'En vivo'

  return (
    <Link
      href="/emisoras"
      style={{ display: 'block', borderRadius: 20, padding: 22, background: 'linear-gradient(160deg,var(--lh-terra),var(--lh-warm))', color: '#fff', boxShadow: 'var(--lh-shadow)', transition: '.26s', textDecoration: 'none' }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = 'var(--lh-shadow-lg)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = 'var(--lh-shadow)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <span style={{ fontFamily: 'var(--lh-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .85 }}>Radio</span>
        {/* Ecualizador: animado solo cuando suena */}
        <span style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 18 }} aria-hidden="true">
          {[0, .2, .1, .3].map((delay, k) => (
            <span
              key={k}
              style={{
                width: 3, background: '#fff', borderRadius: 2, display: 'block',
                height: playing ? '100%' : '40%', opacity: playing ? 1 : .5,
                animation: playing ? `lh-eq ${.8 + k * .1}s ease-in-out infinite` : 'none',
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          aria-label={playing ? 'Pausar emisora' : 'Reproducir emisora'}
          onClick={onToggle}
          style={{ width: 50, height: 50, flexShrink: 0, borderRadius: '50%', border: 0, background: '#fff', color: 'var(--lh-terra)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '.2s' }}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-.01em' }}>{FEATURED.name}</div>
          <div style={{ fontSize: 13, opacity: .9, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, opacity: .85, display: 'flex', alignItems: 'center', gap: 6 }}>
        <RadioIcon size={13} aria-hidden="true" /> {FEATURED.country ?? 'Latinoamérica'}{playing ? ' · En vivo' : ''}
      </div>
    </Link>
  )
}
