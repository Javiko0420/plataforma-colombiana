"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Loader2, X, Search } from 'lucide-react'
import { stations as featuredStations, useAudio, type Station } from '@/components/providers/audio-provider'
import { useRadioFavorites } from '@/components/providers/radio-favorites'
import { useTranslations } from '@/components/providers/language-provider'
import { LtButton } from '@/components/lt/Button'
import { Squiggle } from '@/components/lt/Squiggle'

type ApiResponse =
  | { success: true; data: { stations: Station[] } }
  | { success: false; error: string }

const COUNTRY_OPTIONS: Array<{ code: string; labelKey: string; fallback: string }> = [
  { code: '', labelKey: 'radios.country.any', fallback: 'Cualquier país' },
  { code: 'CO', labelKey: 'radios.country.CO', fallback: 'Colombia' },
  { code: 'MX', labelKey: 'radios.country.MX', fallback: 'México' },
  { code: 'AR', labelKey: 'radios.country.AR', fallback: 'Argentina' },
  { code: 'CL', labelKey: 'radios.country.CL', fallback: 'Chile' },
  { code: 'PE', labelKey: 'radios.country.PE', fallback: 'Perú' },
  { code: 'VE', labelKey: 'radios.country.VE', fallback: 'Venezuela' },
  { code: 'EC', labelKey: 'radios.country.EC', fallback: 'Ecuador' },
  { code: 'UY', labelKey: 'radios.country.UY', fallback: 'Uruguay' },
  { code: 'BO', labelKey: 'radios.country.BO', fallback: 'Bolivia' },
  { code: 'PA', labelKey: 'radios.country.PA', fallback: 'Panamá' },
  { code: 'CR', labelKey: 'radios.country.CR', fallback: 'Costa Rica' },
  { code: 'GT', labelKey: 'radios.country.GT', fallback: 'Guatemala' },
  { code: 'DO', labelKey: 'radios.country.DO', fallback: 'República Dominicana' },
  { code: 'PR', labelKey: 'radios.country.PR', fallback: 'Puerto Rico' },
  { code: 'CU', labelKey: 'radios.country.CU', fallback: 'Cuba' },
  { code: 'ES', labelKey: 'radios.country.ES', fallback: 'España' },
  { code: 'US', labelKey: 'radios.country.US', fallback: 'Estados Unidos' },
  { code: 'AU', labelKey: 'radios.country.AU', fallback: 'Australia' },
  { code: 'BR', labelKey: 'radios.country.BR', fallback: 'Brasil' },
]

const GENRE_OPTIONS: Array<{ value: string; labelKey: string; fallback: string }> = [
  { value: '', labelKey: 'radios.genre.any', fallback: 'Cualquier género' },
  { value: 'salsa', labelKey: 'radios.genre.salsa', fallback: 'Salsa' },
  { value: 'reggaeton', labelKey: 'radios.genre.reggaeton', fallback: 'Reggaetón' },
  { value: 'cumbia', labelKey: 'radios.genre.cumbia', fallback: 'Cumbia' },
  { value: 'vallenato', labelKey: 'radios.genre.vallenato', fallback: 'Vallenato' },
  { value: 'rock', labelKey: 'radios.genre.rock', fallback: 'Rock' },
  { value: 'pop', labelKey: 'radios.genre.pop', fallback: 'Pop' },
  { value: 'jazz', labelKey: 'radios.genre.jazz', fallback: 'Jazz' },
  { value: 'electronic', labelKey: 'radios.genre.electronic', fallback: 'Electrónica' },
  { value: 'news', labelKey: 'radios.genre.news', fallback: 'Noticias' },
  { value: 'sports', labelKey: 'radios.genre.sports', fallback: 'Deportes' },
  { value: 'classical', labelKey: 'radios.genre.classical', fallback: 'Clásica' },
  { value: 'latin', labelKey: 'radios.genre.latin', fallback: 'Latina' },
]

const DEBOUNCE_MS = 400

// Sol accent colors cycling by card index
const ACCENT_BG = [
  'var(--lt-terracota)',
  'var(--lt-verde)',
  'var(--lt-sun)',
  'var(--lt-accent)',
  'var(--lt-sun-core)',
  'var(--lt-verde)',
]
const ACCENT_FG = [
  'var(--lt-paper)',
  'var(--lt-paper)',
  'var(--lt-ink)',
  'var(--lt-paper)',
  'var(--lt-paper)',
  'var(--lt-paper)',
]
type ValidTone = 'terracota' | 'verde' | 'sun' | 'accent'
const BUTTON_TONES: ValidTone[] = ['terracota', 'verde', 'sun', 'accent', 'terracota', 'verde']
const CARD_ROTATIONS = [-1, 1.5, -0.5, 1, -1.5, 0.5]

export default function EmisorasPage() {
  const { play, pause, currentStation, isPlaying, isLoading } = useAudio()
  const { favorites, hydrated, isFavorite, toggle } = useRadioFavorites()
  const { t } = useTranslations()

  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('CO')
  const [genre, setGenre] = useState('')
  const [results, setResults] = useState<Station[] | null>(null)
  const [popular, setPopular] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [popularLoading, setPopularLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const trackClick = useCallback((station: Station) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(station.id)
    if (!isUuid) return
    void fetch('/api/radio/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationUuid: station.id }),
      keepalive: true,
    }).catch(() => undefined)
  }, [])

  const handlePlay = useCallback(
    async (station: Station) => {
      const isCurrent = currentStation?.id === station.id
      if (isCurrent && isPlaying) {
        pause()
        return
      }
      trackClick(station)
      await play(station)
    },
    [currentStation, isPlaying, pause, play, trackClick]
  )

  useEffect(() => {
    let cancelled = false
    setPopularLoading(true)
    const params = new URLSearchParams()
    if (country) params.set('countryCode', country)
    params.set('limit', '12')
    fetch(`/api/radio/popular?${params.toString()}`)
      .then(r => r.json() as Promise<ApiResponse>)
      .then(json => {
        if (cancelled) return
        if (json.success) setPopular(json.data.stations)
        else setPopular([])
      })
      .catch(() => {
        if (!cancelled) setPopular([])
      })
      .finally(() => {
        if (!cancelled) setPopularLoading(false)
      })
    return () => { cancelled = true }
  }, [country])

  useEffect(() => {
    const trimmed = query.trim()
    const hasAnyFilter = trimmed.length >= 2 || Boolean(genre)
    if (!hasAnyFilter) {
      setResults(null)
      setError(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const handle = window.setTimeout(() => {
      const params = new URLSearchParams()
      if (trimmed) params.set('q', trimmed)
      if (country) params.set('countryCode', country)
      if (genre) params.set('tag', genre)
      params.set('limit', '30')
      params.set('order', 'votes')

      fetch(`/api/radio/search?${params.toString()}`, { signal: controller.signal })
        .then(r => r.json() as Promise<ApiResponse>)
        .then(json => {
          if (controller.signal.aborted) return
          if (json.success) {
            setResults(json.data.stations)
          } else {
            setResults([])
            setError(json.error)
          }
        })
        .catch(err => {
          if (controller.signal.aborted) return
          setResults([])
          setError(err instanceof Error ? err.message : 'unknown')
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(handle)
      controller.abort()
    }
  }, [query, country, genre])

  const clearFilters = useCallback(() => {
    setQuery('')
    setGenre('')
  }, [])

  const showResults = results !== null
  const showEmpty = showResults && !loading && results!.length === 0
  const hasFavorites = hydrated && favorites.length > 0
  const cardStations = useMemo(() => {
    if (showResults) return results!
    return []
  }, [showResults, results])

  return (
    <div style={{ background: 'var(--lt-bg)', minHeight: '100vh' }}>

      {/* ── Header Sol ── */}
      <header
        style={{
          background: 'var(--lt-bg)',
          paddingTop: 64,
          paddingBottom: 56,
          paddingLeft: 24,
          paddingRight: 24,
          textAlign: 'center',
          borderBottom: '2px solid var(--lt-ink)',
        }}
      >
        {/* Eyebrow con squiggles */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Squiggle width={80} height={12} color="var(--lt-terracota)" />
          <span
            style={{
              fontFamily: 'var(--lt-font-sans)',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--lt-terracota)',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
            }}
          >
            {t('radios.eyebrow', 'Escucha en vivo')}
          </span>
          <Squiggle width={80} height={12} color="var(--lt-terracota)" />
        </div>

        {/* Título principal */}
        <h1
          style={{
            fontFamily: 'var(--lt-font-serif)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: 'var(--lt-ink)',
            margin: '0 auto 16px',
            maxWidth: 560,
          }}
        >
          <span style={{ display: 'block', fontSize: 'clamp(40px, 5.5vw, 60px)' }}>
            {t('radios.heading.line1', 'Emisoras que')}
          </span>
          <em
            style={{
              display: 'block',
              fontSize: 'clamp(40px, 5.5vw, 60px)',
              color: 'var(--lt-terracota)',
              fontStyle: 'italic',
            }}
          >
            {t('radios.heading.line2', 'te llevan a casa.')}
          </em>
        </h1>

        <p
          style={{
            fontFamily: 'var(--lt-font-sans)',
            fontSize: 17,
            color: 'var(--lt-ink-soft)',
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          {t('radios.subtitle', 'Sintoniza tu emisora favorita desde cualquier parte del mundo.')}
        </p>
      </header>

      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '40px 24px 120px',
        }}
      >
        <SearchPanel
          query={query}
          country={country}
          genre={genre}
          onQueryChange={setQuery}
          onCountryChange={setCountry}
          onGenreChange={setGenre}
          onClear={clearFilters}
        />

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 16,
              borderRadius: 12,
              border: '2px solid var(--lt-terracota)',
              background: 'var(--lt-paper)',
              padding: '12px 16px',
              fontFamily: 'var(--lt-font-sans)',
              fontSize: 14,
              color: 'var(--lt-terracota)',
            }}
          >
            {t('radios.error', 'No pudimos completar la búsqueda. Intenta de nuevo.')}
          </div>
        )}

        {hasFavorites && !showResults && (
          <SolSection title={t('radios.section.favorites', 'Tus favoritas')}>
            <StationGrid
              stations={favorites}
              currentStationId={currentStation?.id}
              isPlaying={isPlaying}
              isLoading={isLoading}
              onPlay={handlePlay}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
              t={t}
            />
          </SolSection>
        )}

        {!showResults && (
          <SolSection title={t('radios.section.featured', 'Destacadas Colombia')}>
            <StationGrid
              stations={featuredStations}
              currentStationId={currentStation?.id}
              isPlaying={isPlaying}
              isLoading={isLoading}
              onPlay={handlePlay}
              isFavorite={isFavorite}
              onToggleFavorite={toggle}
              t={t}
            />
          </SolSection>
        )}

        {!showResults && (
          <SolSection
            title={t('radios.section.popular', 'Populares')}
            loading={popularLoading}
          >
            {popular.length === 0 && !popularLoading ? (
              <p
                style={{
                  fontFamily: 'var(--lt-font-sans)',
                  fontSize: 15,
                  color: 'var(--lt-ink-soft)',
                }}
              >
                {t('radios.popular.empty', 'No hay emisoras populares disponibles para este país.')}
              </p>
            ) : (
              <StationGrid
                stations={popular}
                currentStationId={currentStation?.id}
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlay={handlePlay}
                isFavorite={isFavorite}
                onToggleFavorite={toggle}
                t={t}
              />
            )}
          </SolSection>
        )}

        {showResults && (
          <SolSection
            title={t('radios.section.results', 'Resultados de búsqueda')}
            loading={loading}
          >
            <div aria-live="polite" className="sr-only">
              {loading
                ? t('radios.searching', 'Buscando emisoras…')
                : `${results!.length} ${t('radios.resultsCount', 'resultados')}`}
            </div>
            {showEmpty ? (
              <p
                style={{
                  fontFamily: 'var(--lt-font-sans)',
                  fontSize: 15,
                  color: 'var(--lt-ink-soft)',
                }}
              >
                {t('radios.results.empty', 'No encontramos emisoras con esos criterios. Prueba con otra búsqueda.')}
              </p>
            ) : (
              <StationGrid
                stations={cardStations}
                currentStationId={currentStation?.id}
                isPlaying={isPlaying}
                isLoading={isLoading}
                onPlay={handlePlay}
                isFavorite={isFavorite}
                onToggleFavorite={toggle}
                t={t}
              />
            )}
          </SolSection>
        )}
      </div>
    </div>
  )
}

// ── SearchPanel ──────────────────────────────────────────────────────────────

type SearchPanelProps = {
  query: string
  country: string
  genre: string
  onQueryChange: (v: string) => void
  onCountryChange: (v: string) => void
  onGenreChange: (v: string) => void
  onClear: () => void
}

function SearchPanel({
  query,
  country,
  genre,
  onQueryChange,
  onCountryChange,
  onGenreChange,
  onClear,
}: SearchPanelProps) {
  const { t } = useTranslations()
  const inputId = 'radio-search-input'
  const countryId = 'radio-country-select'
  const genreId = 'radio-genre-select'
  const hasFilters = query.length > 0 || genre.length > 0

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 12,
    border: '2px solid var(--lt-ink)',
    background: 'var(--lt-paper)',
    padding: '10px 12px',
    fontSize: 14,
    fontFamily: 'var(--lt-font-sans)',
    color: 'var(--lt-ink)',
    outline: 'none',
    appearance: 'none',
  }

  return (
    <section
      aria-label={t('radios.search.aria', 'Buscar emisoras')}
      style={{
        borderRadius: 22,
        border: '2.2px solid var(--lt-ink)',
        background: 'var(--lt-paper)',
        padding: 24,
        boxShadow: '6px 7px 0 var(--lt-ink)',
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: '1fr',
        }}
        className="sm:grid-cols-[1fr_auto_auto]"
      >
        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <label htmlFor={inputId} className="sr-only">
            {t('radios.search.placeholder', 'Buscar emisora')}
          </label>
          <Search
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 16,
              height: 16,
              color: 'var(--lt-ink-soft)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
          <input
            id={inputId}
            type="search"
            inputMode="search"
            autoComplete="off"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder={t('radios.search.placeholder', 'Buscar emisora por nombre…')}
            style={{ ...inputStyle, paddingLeft: 40, paddingRight: query ? 36 : 12 }}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label={t('radios.search.clear', 'Limpiar búsqueda')}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                padding: 4,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--lt-ink-soft)',
                display: 'flex',
              }}
            >
              <X style={{ width: 16, height: 16 }} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Country select */}
        <div>
          <label htmlFor={countryId} className="sr-only">
            {t('radios.filter.country', 'País')}
          </label>
          <select
            id={countryId}
            value={country}
            onChange={e => onCountryChange(e.target.value)}
            style={inputStyle}
          >
            {COUNTRY_OPTIONS.map(opt => (
              <option key={opt.code || 'any'} value={opt.code}>
                {t(opt.labelKey, opt.fallback)}
              </option>
            ))}
          </select>
        </div>

        {/* Genre select */}
        <div>
          <label htmlFor={genreId} className="sr-only">
            {t('radios.filter.genre', 'Género')}
          </label>
          <select
            id={genreId}
            value={genre}
            onChange={e => onGenreChange(e.target.value)}
            style={inputStyle}
          >
            {GENRE_OPTIONS.map(opt => (
              <option key={opt.value || 'any'} value={opt.value}>
                {t(opt.labelKey, opt.fallback)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClear}
            style={{
              fontFamily: 'var(--lt-font-sans)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--lt-ink-soft)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {t('radios.filter.clear', 'Limpiar filtros')}
          </button>
        </div>
      )}
    </section>
  )
}

// ── SolSection ───────────────────────────────────────────────────────────────

function SolSection({
  title,
  loading,
  children,
}: {
  title: string
  loading?: boolean
  children: React.ReactNode
}) {
  return (
    <section style={{ marginTop: 48 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--lt-font-serif)',
            fontSize: 'clamp(22px, 3vw, 30px)',
            fontWeight: 700,
            color: 'var(--lt-ink)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {loading && (
          <Loader2
            style={{ width: 18, height: 18, color: 'var(--lt-ink-soft)' }}
            className="animate-spin"
            aria-hidden="true"
          />
        )}
      </div>
      {children}
    </section>
  )
}

// ── StationGrid ──────────────────────────────────────────────────────────────

type GridProps = {
  stations: Station[]
  currentStationId: string | undefined
  isPlaying: boolean
  isLoading: boolean
  onPlay: (s: Station) => void | Promise<void>
  isFavorite: (id: string) => boolean
  onToggleFavorite: (s: Station) => void
  t: (key: string, fallback?: string) => string
}

function StationGrid({
  stations,
  currentStationId,
  isPlaying,
  isLoading,
  onPlay,
  isFavorite,
  onToggleFavorite,
  t,
}: GridProps) {
  return (
    <ul
      role="list"
      className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      style={{ listStyle: 'none', padding: 0, margin: 0 }}
    >
      {stations.map((s, i) => (
        <StationCard
          key={s.id}
          station={s}
          index={i}
          isCurrent={currentStationId === s.id}
          isPlaying={isPlaying}
          isLoading={isLoading}
          onPlay={onPlay}
          isFavorite={isFavorite(s.id)}
          onToggleFavorite={onToggleFavorite}
          t={t}
        />
      ))}
    </ul>
  )
}

// ── StationCard ──────────────────────────────────────────────────────────────

type CardProps = {
  station: Station
  index: number
  isCurrent: boolean
  isPlaying: boolean
  isLoading: boolean
  onPlay: (s: Station) => void | Promise<void>
  isFavorite: boolean
  onToggleFavorite: (s: Station) => void
  t: (key: string, fallback?: string) => string
}

function StationCard({
  station,
  index,
  isCurrent,
  isPlaying,
  isLoading,
  onPlay,
  isFavorite,
  onToggleFavorite,
  t,
}: CardProps) {
  const [logoErrored, setLogoErrored] = useState(false)

  const rot = CARD_ROTATIONS[index % CARD_ROTATIONS.length]
  const accentBg = ACCENT_BG[index % ACCENT_BG.length]
  const accentFg = ACCENT_FG[index % ACCENT_FG.length]
  const buttonTone = BUTTON_TONES[index % BUTTON_TONES.length]

  const showSpinner = isCurrent && isLoading
  const isActivePlaying = isCurrent && isPlaying
  const showLogo = !!station.logoUrl && !logoErrored

  const descText =
    [station.country, station.codec, station.bitrate ? `${station.bitrate} kbps` : null]
      .filter(Boolean)
      .join(' · ') || t('radios.unknownMeta', 'Emisora en vivo')

  const buttonLabel = isActivePlaying
    ? `${t('audio.pause', 'Pausar')} ${station.name}`
    : `${t('radios.play', 'Reproducir')} ${station.name}`

  return (
    <li
      data-lt-rotate="true"
      style={{
        position: 'relative',
        background: 'var(--lt-paper)',
        borderRadius: 22,
        padding: 28,
        border: '2.2px solid var(--lt-ink)',
        boxShadow: '6px 7px 0 var(--lt-ink)',
        transform: `rotate(${rot}deg)`,
        overflow: 'hidden',
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Círculo de acento decorativo */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -28,
          right: -28,
          width: 110,
          height: 110,
          borderRadius: '50%',
          background: accentBg,
          opacity: 0.12,
          pointerEvents: 'none',
        }}
      />

      {/* Fila superior: ícono + favorito */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 18,
        }}
      >
        {/* Ícono de radio */}
        <div
          data-lt-wobble="true"
          aria-hidden="true"
          style={{
            width: 64,
            height: 64,
            background: accentBg,
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: 'url(#lt-wobble-soft)',
            border: '2px solid var(--lt-ink)',
            boxShadow: '3px 3px 0 var(--lt-ink)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {showLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={station.logoUrl}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setLogoErrored(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
              <path
                d="M15 4 L15 19 M8 9 Q15 4.5 22 9 M5 13 Q15 6.5 25 13"
                stroke={accentFg}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line x1="11" y1="19" x2="19" y2="19" stroke={accentFg} strokeWidth="2.2" strokeLinecap="round" />
              <line x1="15" y1="19" x2="15" y2="24" stroke={accentFg} strokeWidth="2.2" strokeLinecap="round" />
              <line x1="10" y1="24" x2="20" y2="24" stroke={accentFg} strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Botón favorito */}
        <button
          type="button"
          onClick={() => onToggleFavorite(station)}
          aria-pressed={isFavorite}
          aria-label={
            isFavorite
              ? t('radios.favorite.remove', 'Quitar de favoritos')
              : t('radios.favorite.add', 'Añadir a favoritos')
          }
          style={{
            padding: 8,
            borderRadius: 10,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: isFavorite ? 'var(--lt-accent)' : 'var(--lt-ink-soft)',
          }}
        >
          <Heart
            style={{
              width: 20,
              height: 20,
              fill: isFavorite ? 'var(--lt-accent)' : 'transparent',
              stroke: isFavorite ? 'var(--lt-accent)' : 'var(--lt-ink-soft)',
              transition: 'fill 0.15s ease, stroke 0.15s ease',
            }}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Nombre de la emisora */}
      <h3
        style={{
          fontFamily: 'var(--lt-font-serif)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--lt-ink)',
          letterSpacing: '-0.01em',
          lineHeight: 1.15,
          margin: '0 0 10px',
        }}
        title={station.name}
      >
        {station.name}
      </h3>

      {/* Descripción */}
      <p
        style={{
          fontFamily: 'var(--lt-font-sans)',
          fontSize: 14,
          color: 'var(--lt-ink-soft)',
          lineHeight: 1.55,
          margin: '0 0 10px',
        }}
      >
        {descText}
      </p>

      {/* Etiquetas */}
      {station.tags && station.tags.length > 0 && (
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            margin: '0 0 20px',
            listStyle: 'none',
            padding: 0,
          }}
          aria-label={t('radios.tags', 'Etiquetas')}
        >
          {station.tags.slice(0, 3).map(tag => (
            <li
              key={tag}
              style={{
                fontFamily: 'var(--lt-font-sans)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
                background: 'var(--lt-bg)',
                border: '1.5px solid var(--lt-ink)',
                color: 'var(--lt-ink)',
              }}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      {/* Botón Play / Stop + enlace */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <LtButton
          variant="sticker"
          tone={buttonTone}
          size="sm"
          rotate={-1.2}
          loading={showSpinner}
          loadingText={t('audio.connecting', 'Conectando…')}
          onClick={() => void onPlay(station)}
          aria-label={buttonLabel}
          disabled={showSpinner}
        >
          {isActivePlaying
            ? `⏹ ${t('radios.stop', 'Detener')}`
            : `▷ ${t('radios.play', 'Reproducir')}`}
        </LtButton>

        {station.homepage && (
          <a
            href={station.homepage}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--lt-font-sans)',
              fontSize: 12,
              color: 'var(--lt-ink-soft)',
              textDecoration: 'underline',
              marginLeft: 'auto',
            }}
          >
            {t('radios.website', 'Sitio web')}
          </a>
        )}
      </div>
    </li>
  )
}
