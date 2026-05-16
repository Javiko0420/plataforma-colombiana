'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from '@/components/providers/language-provider'

export type Station = {
  id: string
  name: string
  streamUrl: string
  homepage?: string
  logoUrl?: string
  country?: string
  countryCode?: string
  language?: string
  codec?: string
  bitrate?: number
  tags?: string[]
  // Metadata provider hint. 'auto' detects StreamTheWorld by URL pattern
  // and falls back to Icecast/SHOUTcast Icy metadata via our proxy.
  metadataProvider?: 'streamtheworld' | 'icecast' | 'none' | 'auto'
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

  const fetchStreamTheWorldMeta = useCallback(async (station: Station): Promise<NowPlaying | null> => {
    try {
      const url = new URL('https://playerservices.streamtheworld.com/api/metadata/nowplaying')
      const mountMatch = station.streamUrl.match(/livestream-redirect\/([^?.]+)/i)
      const mount = mountMatch?.[1] || station.streamUrl
      url.searchParams.set('mount', mount)
      url.searchParams.set('format', 'json')
      const res = await fetch(url.toString(), { cache: 'no-store' })
      if (!res.ok) return null
      const data = await res.json().catch(() => null)
      if (!data) return null
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
      return title ? { title, artist } : null
    } catch {
      return null
    }
  }, [])

  const fetchIcecastMeta = useCallback(async (station: Station): Promise<NowPlaying | null> => {
    try {
      const url = `/api/radio/metadata?url=${encodeURIComponent(station.streamUrl)}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) return null
      const json = await res.json().catch(() => null) as
        | { success: true; data: { metadata: NowPlaying | null } }
        | { success: false }
        | null
      if (!json || !json.success) return null
      const meta = json.data.metadata
      if (!meta || !meta.title) return null
      return { title: meta.title, artist: meta.artist }
    } catch {
      return null
    }
  }, [])

  const fetchNowPlaying = useCallback(async (station: Station) => {
    // Resolve metadata provider.
    //  - 'none': explicit opt-out, skip the network call entirely.
    //  - 'streamtheworld': StreamTheWorld public metadata API (browser → upstream).
    //  - 'icecast': proxy via our /api/radio/metadata endpoint (reads Icy headers).
    //  - 'auto': sniff StreamTheWorld by URL; default everything else to icecast.
    const explicit = station.metadataProvider ?? 'auto'
    if (explicit === 'none') return

    const looksLikeStreamTheWorld = /playerservices\.streamtheworld\.com/i.test(station.streamUrl)
    const provider: 'streamtheworld' | 'icecast' =
      explicit === 'streamtheworld' ? 'streamtheworld'
      : explicit === 'icecast' ? 'icecast'
      : looksLikeStreamTheWorld ? 'streamtheworld' : 'icecast'

    const meta = provider === 'streamtheworld'
      ? await fetchStreamTheWorldMeta(station)
      : await fetchIcecastMeta(station)

    if (meta) {
      setNowPlaying(meta)
      updateMediaSessionMetadata(station, meta)
    }
    // Intentionally do not clear stale metadata on null: keeps last known
    // track visible briefly while the next poll resolves.
  }, [fetchStreamTheWorldMeta, fetchIcecastMeta, updateMediaSessionMetadata])

  const startNowPlayingPolling = useCallback((station: Station) => {
    stopNowPlayingPolling()
    void fetchNowPlaying(station)
    nowPlayingTimerRef.current = window.setInterval(() => {
      void fetchNowPlaying(station)
    }, NOW_PLAYING_INTERVAL_MS)
  }, [fetchNowPlaying, stopNowPlayingPolling])

  const buildStreamUrl = useCallback((station: Station): string => {
    try {
      const url = new URL(station.streamUrl)
      const isStreamTheWorld = /playerservices\.streamtheworld\.com/i.test(url.hostname)
      if (isStreamTheWorld && !/\.mp3$/i.test(url.pathname)) {
        if (!url.searchParams.has('dist')) url.searchParams.set('dist', 'web')
        if (!url.searchParams.has('type')) url.searchParams.set('type', 'mp3')
      }
      return url.toString()
    } catch {
      return station.streamUrl
    }
  }, [])

  const play = useCallback(async (station: Station) => {
    setError(null)
    setIsLoading(true)
    try {
      if (!audioRef.current) return
      const audio = audioRef.current
      const isNewStation = !currentStation || currentStation.id !== station.id
      if (isNewStation) {
        setCurrentStation(station)
        setNowPlaying(null)
        try { audio.pause() } catch {}
        audio.src = buildStreamUrl(station)
      }
      // crossOrigin is required for canvas-based visualizers but many radio
      // CORS configs reject it. Try with it first; on failure, retry without.
      audio.preload = 'none'
      audio.crossOrigin = 'anonymous'
      audio.load()
      try {
        await audio.play()
      } catch {
        audio.removeAttribute('crossorigin')
        audio.load()
        await audio.play()
      }
      setIsPlaying(true)
      setIsLoading(false)
      updateMediaSessionMetadata(station, nowPlaying)
      startNowPlayingPolling(station)
    } catch {
      setIsLoading(false)
      setIsPlaying(false)
      setError(t('audio.error', 'No se pudo iniciar la reproducción. Toca nuevamente para reintentar.'))
    }
  }, [buildStreamUrl, currentStation, nowPlaying, startNowPlayingPolling, updateMediaSessionMetadata, t])

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

// Curated featured stations rendered at the top of the page. These are
// hand-picked and have working metadata via StreamTheWorld.
export const stations: Station[] = [
  {
    id: 'tropicana-bogota',
    name: 'Tropicana Bogotá',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/TROPICANA_SC.mp3',
    homepage: 'https://www.tropicanafm.com/',
    country: 'Colombia',
    countryCode: 'CO',
    language: 'spanish',
    codec: 'MP3',
    tags: ['tropical', 'salsa', 'reggaeton'],
    metadataProvider: 'streamtheworld',
  },
  {
    id: 'tropicana-cali',
    name: 'Tropicana Cali',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/TR_CALI.mp3',
    homepage: 'https://www.tropicanafm.com/',
    country: 'Colombia',
    countryCode: 'CO',
    language: 'spanish',
    codec: 'MP3',
    tags: ['salsa', 'tropical'],
    metadataProvider: 'streamtheworld',
  },
  {
    id: 'tropicana-popayan',
    name: 'Tropicana Popayán',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/TR_POPAYAN_SC.mp3',
    homepage: 'https://www.tropicanafm.com/',
    country: 'Colombia',
    countryCode: 'CO',
    language: 'spanish',
    codec: 'MP3',
    tags: ['salsa', 'tropical'],
    metadataProvider: 'streamtheworld',
  },
  {
    id: 'la-x-965-cali',
    name: 'La X 96.5',
    // SHOUTcast stream (HTTPS, MP3 128 kbps). Verified via Radio Browser
    // station uuid a7f9c796-e31b-43b0-a087-35daedd8a887.
    streamUrl: 'https://tupanel.info/stream/2digitalradioHDsslLIVE040',
    homepage: 'https://www.laxcali.com/',
    logoUrl: 'https://www.laxcali.com/static/images/apple-icon-180x180.aab671daf60d.png',
    country: 'Colombia',
    countryCode: 'CO',
    language: 'spanish',
    codec: 'MP3',
    bitrate: 128,
    tags: ['pop', 'dance', 'electronic'],
    // SHOUTcast — Icy in-stream metadata read via our proxy.
    metadataProvider: 'icecast',
  },
]


