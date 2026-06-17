'use client'

import React from 'react'
import { Pause, Play, Volume2, VolumeX, Radio } from 'lucide-react'
import { useAudio } from '@/components/providers/audio-provider'
import { useTranslations } from '@/components/providers/language-provider'

export function AudioPlayer() {
  const { isPlaying, isLoading, volume, muted, nowPlaying, currentStation, togglePlayPause, setVolume, toggleMute, error } = useAudio()
  const { t } = useTranslations()

  const subtext = isLoading
    ? t('audio.connecting', 'Conectando…')
    : nowPlaying?.title
      ? `${nowPlaying.title}${nowPlaying.artist ? ' — ' + nowPlaying.artist : ''}`
      : t('audio.ready', 'Listo para reproducir')

  return (
    <div className="fixed z-40 bottom-2 left-2 right-2 sm:bottom-5 sm:left-auto sm:right-5 sm:w-auto">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderRadius: 18,
          background: 'var(--lh-surface)',
          border: '1px solid var(--lh-border)',
          boxShadow: 'var(--lh-shadow-lg)',
          backdropFilter: 'blur(20px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
          fontFamily: 'var(--lh-font)',
        }}
      >
        {/* Icono emisora */}
        <div
          aria-hidden="true"
          style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'var(--lh-terra)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
          }}
        >
          <Radio size={18} />
        </div>

        {/* Nombre + estado */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            margin: 0, fontSize: 13.5, fontWeight: 600, lineHeight: 1.3,
            color: 'var(--lh-fg)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {currentStation?.name ?? t('audio.stationFallback', 'Emisora')}
            {isPlaying && (
              <span style={{
                marginLeft: 7, display: 'inline-block', verticalAlign: 'middle',
                fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 5,
                background: 'var(--lh-terra)', color: '#fff',
              }}>
                {t('audio.liveTag', 'LIVE')}
              </span>
            )}
          </p>
          <p
            aria-live="polite"
            style={{
              margin: 0, fontSize: 12, lineHeight: 1.4,
              color: 'var(--lh-fg3)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {subtext}
          </p>
        </div>

        {/* Controles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4, flexShrink: 0 }}>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={() => void togglePlayPause()}
            aria-label={isPlaying ? t('audio.pause', 'Pausar') : t('audio.play', 'Reproducir')}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              background: 'var(--lh-accent)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: '.18s', flexShrink: 0,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--lh-accent-ink)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--lh-accent)' }}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>

          {/* Volumen — solo desktop */}
          <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={() => toggleMute()}
              aria-label={muted ? t('audio.unmute', 'Activar sonido') : t('audio.mute', 'Silenciar')}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: '1px solid var(--lh-border)',
                background: 'transparent', color: 'var(--lh-fg2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: '.18s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'var(--lh-fg)'
                el.style.background = 'var(--lh-surface2)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.color = 'var(--lh-fg2)'
                el.style.background = 'transparent'
              }}
            >
              {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <input
              type="range"
              min={0} max={1} step={0.01}
              value={muted ? 0 : volume}
              onChange={e => setVolume(Number(e.target.value))}
              aria-label={t('audio.volumeLabel', 'Volumen')}
              style={{ width: 80, accentColor: 'var(--lh-accent)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {error && <p className="sr-only" role="alert">{error}</p>}
      </div>
    </div>
  )
}
