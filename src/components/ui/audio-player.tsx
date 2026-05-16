'use client'

import React from 'react'
import { Pause, Play, Volume2, VolumeX, Radio } from 'lucide-react'
import { useAudio } from '@/components/providers/audio-provider'
import { useTranslations } from '@/components/providers/language-provider'

export function AudioPlayer() {
  const { isPlaying, isLoading, volume, muted, nowPlaying, currentStation, togglePlayPause, setVolume, toggleMute, error } = useAudio()
  const { t } = useTranslations()

  return (
    /* Desktop: bottom-4 right-4 fijo. Mobile: stretch bottom-2 left-2 right-2 */
    <div className="fixed z-40 bottom-2 left-2 right-2 sm:bottom-4 sm:left-auto sm:right-4 sm:w-auto">
      <div
        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-[var(--lt-radius-md)]"
        style={{
          background: 'var(--lt-paper)',
          border: '2px solid var(--lt-ink)',
          boxShadow: 'var(--lt-shadow-sticker)',
          fontFamily: 'var(--lt-font-sans)',
        }}
      >
        {/* Icono Radio */}
        <div
          className="p-2 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] shrink-0"
          style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)', boxShadow: '2px 2px 0 var(--lt-ink)' }}
          aria-hidden="true"
        >
          <Radio className="w-4 h-4" />
        </div>

        {/* Texto: nombre de emisora + estado */}
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--lt-ink)' }}
          >
            {currentStation?.name ?? t('audio.stationFallback', 'Emisora')}
            {isPlaying && (
              <span
                className="ml-2 inline-block align-middle text-[10px] px-1.5 py-0.5 rounded font-bold"
                style={{ background: 'var(--lt-terracota)', color: 'var(--lt-paper)' }}
              >
                {t('audio.liveTag', 'LIVE')}
              </span>
            )}
          </p>
          <p
            className="text-xs truncate"
            style={{ color: 'var(--lt-ink-soft)' }}
            aria-live="polite"
          >
            {isLoading
              ? t('audio.connecting', 'Conectando…')
              : nowPlaying?.title
                ? `${nowPlaying.title}${nowPlaying.artist ? ' — ' + nowPlaying.artist : ''}`
                : t('audio.ready', 'Listo para reproducir')}
          </p>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto shrink-0">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={() => void togglePlayPause()}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full border-2 border-[var(--lt-ink)] transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
            style={{
              background: 'var(--lt-terracota)',
              color: 'var(--lt-paper)',
              boxShadow: 'var(--lt-shadow-sticker)',
            }}
            aria-label={isPlaying ? t('audio.pause', 'Pausar') : t('audio.play', 'Reproducir')}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Volumen — solo desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleMute()}
              className="inline-flex items-center justify-center h-8 w-8 rounded-[var(--lt-radius-sm)] border-[1.6px] border-[var(--lt-ink)] transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--lt-terracota)]"
              style={{ background: 'var(--lt-bg)', color: 'var(--lt-ink)' }}
              aria-label={muted ? t('audio.unmute', 'Activar sonido') : t('audio.mute', 'Silenciar')}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={e => setVolume(Number(e.target.value))}
              aria-label={t('audio.volumeLabel', 'Volumen')}
              className="w-24 accent-[var(--lt-terracota)]"
            />
          </div>
        </div>

        {error && <p className="sr-only" role="alert">{error}</p>}
      </div>
    </div>
  )
}
