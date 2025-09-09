'use client'

import React from 'react'
import { Pause, Play, Volume2, VolumeX, Radio } from 'lucide-react'
import { useAudio } from '@/components/providers/audio-provider'

export function AudioPlayer() {
  const { isPlaying, isLoading, volume, muted, nowPlaying, currentStation, togglePlayPause, setVolume, toggleMute, error } = useAudio()

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] sm:w-auto">
      <div className="mx-auto max-w-3xl rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90 backdrop-blur p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-md bg-red-600/10 text-red-600 dark:text-red-400" aria-hidden="true">
            <Radio className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {currentStation?.name ?? 'Emisora'} {isPlaying && <span className="ml-2 inline-block align-middle text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white">LIVE</span>}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate" aria-live="polite">
              {isLoading ? 'Conectando…' : (nowPlaying?.title ? `${nowPlaying.title}${nowPlaying.artist ? ' — '+nowPlaying.artist : ''}` : 'Listo para reproducir')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button
            type="button"
            onClick={() => void togglePlayPause()}
            className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-red-600 text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleMute()}
              className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volumen"
              className="w-28 accent-red-600"
            />
          </div>
        </div>

        {error && (
          <p className="sr-only" role="alert">{error}</p>
        )}
      </div>
    </div>
  )
}


