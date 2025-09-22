'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from '@/components/providers/language-provider'

type Station = {
  id: string
  name: string
  streamUrl: string
  homepage?: string
  logoUrl?: string
}

type NowPlaying = {
  title?: string
  artist?: string
  artworkUrl?: string
}

type AudioContextValue = {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>
  isPlaying: boolean
  isLoading: boolean
  volume: number
  muted: boolean
  currentStation: Station | null
  nowPlaying: NowPlaying | null
  error: string | null
  play: (station: Station) => Promise<void>
  togglePlayPause: () => Promise<void>
  pause: () => void
  setVolume: (v: number) => void
  toggleMute: () => void
}

const AudioCtx = createContext<AudioContextValue | undefined>(undefined)

const DEFAULT_VOLUME = 0.9
const NOW_PLAYING_INTERVAL_MS = 15000

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslations()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [volume, setVolumeState] = useState<number>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('audio_volume') : null
    return stored ? Math.min(1, Math.max(0, Number(stored))) : DEFAULT_VOLUME
  })
  const [muted, setMuted] = useState(false)
  const [currentStation, setCurrentStation] = useState<Station | null>(null)
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null)
  const [error, setError] = useState<string | null>(null)
  const nowPlayingTimerRef = useRef<number | null>(null)

  // Apply initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume
    }
  }, [volume, muted])
  // Listen for global media pause requests (e.g., when video starts)
  useEffect(() => {
    const handler = () => {
      try { if (audioRef.current) audioRef.current.pause() } catch {}
      setIsPlaying(false)
    }
    window.addEventListener('app:media:request-pause', handler)
    return () => window.removeEventListener('app:media:request-pause', handler)
  }, [])


  // Persist volume
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('audio_volume', String(volume))
    }
  }, [volume])

  

  const updateMediaSessionMetadata = useCallback((station: Station | null, meta: NowPlaying | null) => {
    if (!('mediaSession' in navigator)) return
    const title = meta?.title || station?.name || t('audio.session.title', 'Radio en vivo')
    const artist = meta?.artist || t('audio.session.artist', 'Vivo')
    const artwork = [
      meta?.artworkUrl || station?.logoUrl
    ].filter(Boolean).map((src) => ({ src: src as string, sizes: '512x512', type: 'image/png' }))
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({ title, artist, album: station?.name, artwork })
    } catch {}
  }, [t])

  const stopNowPlayingPolling = useCallback(() => {
    if (nowPlayingTimerRef.current) {
      window.clearInterval(nowPlayingTimerRef.current)
      nowPlayingTimerRef.current = null
    }
  }, [])

  const fetchNowPlaying = useCallback(async (station: Station) => {
    // StreamTheWorld metadata endpoint often uses station call letters; here we attempt common patterns
    // When not available, we gracefully no-op
    try {
      // If streamUrl is a redirect endpoint, try to pass mount or station id appropriately
      const url = new URL('https://playerservices.streamtheworld.com/api/metadata/nowplaying')
      // Try to extract mount from known redirect formats
      const mountMatch = station.streamUrl.match(/livestream-redirect\/([^?.]+)/i)
      const mount = mountMatch?.[1] || station.streamUrl
      url.searchParams.set('mount', mount)
      url.searchParams.set('format', 'json')
      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json().catch(() => null)
      if (!data) return
      // Normalize common shapes
      let title: string | undefined
      let artist: string | undefined
      if (Array.isArray(data?.data)) {
        const first = data.data[0]
        title = first?.track?.title || first?.song || first?.title
        artist = first?.track?.subtitle || first?.artist
      } else if (data?.nowplaying) {
        title = data.nowplaying?.track || data.nowplaying?.title
        artist = data.nowplaying?.artist
      }
      const meta: NowPlaying | null = title ? { title, artist } : null
      setNowPlaying(meta)
      updateMediaSessionMetadata(station, meta)
    } catch {
      // ignore
    }
  }, [updateMediaSessionMetadata])

  const startNowPlayingPolling = useCallback((station: Station) => {
    stopNowPlayingPolling()
    void fetchNowPlaying(station)
    nowPlayingTimerRef.current = window.setInterval(() => {
      void fetchNowPlaying(station)
    }, NOW_PLAYING_INTERVAL_MS)
  }, [fetchNowPlaying, stopNowPlayingPolling])

  const play = useCallback(async (station: Station) => {
    setError(null)
    setIsLoading(true)
    try {
      if (!audioRef.current) return
      if (!currentStation || currentStation.id !== station.id) {
        setCurrentStation(station)
        // Ensure we request mp3 when available to avoid codec issues and pause current stream first
        try { audioRef.current.pause() } catch {}
        const url = new URL(station.streamUrl)
        if (!/\.mp3$/i.test(url.pathname)) {
          if (!url.searchParams.has('dist')) url.searchParams.set('dist', 'web')
          if (!url.searchParams.has('type')) url.searchParams.set('type', 'mp3')
        }
        audioRef.current.src = url.toString()
      }
      audioRef.current.crossOrigin = 'anonymous'
      audioRef.current.preload = 'none'
      audioRef.current.load()
      await audioRef.current.play()
      setIsPlaying(true)
      setIsLoading(false)
      updateMediaSessionMetadata(station, nowPlaying)
      startNowPlayingPolling(station)
    } catch {
      setIsLoading(false)
      setIsPlaying(false)
      setError(t('audio.error', 'No se pudo iniciar la reproducción. Toca nuevamente para reintentar.'))
    }
  }, [currentStation, nowPlaying, startNowPlayingPolling, updateMediaSessionMetadata, t])

  const pause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    setIsPlaying(false)
  }, [])

  const togglePlayPause = useCallback(async () => {
    if (!currentStation) return
    if (isPlaying) {
      pause()
    } else {
      await play(currentStation)
    }
  }, [currentStation, isPlaying, pause, play])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v))
    setVolumeState(clamped)
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : clamped
    }
  }, [muted])

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      if (audioRef.current) {
        audioRef.current.muted = next
        if (!next) audioRef.current.volume = volume
      }
      return next
    })
  }, [volume])

  // MediaSession integration (placed after callbacks are defined)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', async () => {
        try { await togglePlayPause() } catch {}
      })
      navigator.mediaSession.setActionHandler('pause', async () => {
        try { await togglePlayPause() } catch {}
      })
      navigator.mediaSession.setActionHandler('stop', () => {
        pause()
      })
      navigator.mediaSession.setActionHandler('previoustrack', null)
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('seekto', null)
    }
  }, [pause, togglePlayPause])

  // Cleanup on unmount
  useEffect(() => {
    const audio = audioRef.current
    return () => {
      stopNowPlayingPolling()
      if (audio) {
        try { audio.pause() } catch {}
      }
    }
  }, [stopNowPlayingPolling])

  const value = useMemo<AudioContextValue>(() => ({
    audioRef,
    isPlaying,
    isLoading,
    volume,
    muted,
    currentStation,
    nowPlaying,
    error,
    play,
    togglePlayPause,
    pause,
    setVolume,
    toggleMute,
  }), [isPlaying, isLoading, volume, muted, currentStation, nowPlaying, error, play, togglePlayPause, pause, setVolume, toggleMute])

  return (
    <AudioCtx.Provider value={value}>
      {/* Hidden audio element controlled globally */}
      <audio ref={audioRef} aria-hidden="true" />
      {children}
    </AudioCtx.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}

export const stations: Station[] = [
  {
    id: 'tropicana-bogota',
    name: 'Tropicana Bogotá',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/TROPICANA_SC.mp3',
    homepage: 'https://www.tropicanafm.com/'
  },
  {
    id: 'tropicana-cali',
    name: 'Tropicana Cali',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/TR_CALI.mp3',
    homepage: 'https://www.tropicanafm.com/'
  },
  {
    id: 'tropicana-popayan',
    name: 'Tropicana Popayán',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/TR_POPAYAN_SC.mp3',
    homepage: 'https://www.tropicanafm.com/'
  },
]


