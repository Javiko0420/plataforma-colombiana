"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Loader2, X, Search, Radio as RadioIcon, Play, Square } from 'lucide-react'
import { stations as featuredStations, useAudio, type Station } from '@/components/providers/audio-provider'
import { useRadioFavorites } from '@/components/providers/radio-favorites'
import { useTranslations } from '@/components/providers/language-provider'
import { PageHeader } from '@/components/lh/PageHeader'

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

// Acentos del sistema rotando por índice de tarjeta
const ACCENTS = ['var(--lh-accent)', 'var(--lh-terra)', 'var(--lh-warm)', 'var(--lh-green)']
const tint = (v: string) => `color-mix(in oklch, ${v} 14%, transparent)`

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
    <div style={{ background: 'var(--lh-bg)', minHeight: '100vh', fontFamily: 'var(--lh-font)' }}>

      <PageHeader
        eyebrow={t('radios.eyebrow', 'Escucha en vivo')}
        title={t('radios.title', 'Emisoras que te llevan a casa')}
        subtitle={t('radios.subtitle', 'Sintoniza tu emisora favorita desde cualquier parte del mundo.')}
        accent="var(--lh-terra)"
      />

      <div className="lh-container" style={{ maxWidth: 1200, paddingTop: 40, paddingBottom: 120 }}>
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
            style={{ marginTop: 16, borderRadius: 13, border: '1px solid color-mix(in oklch, var(--lh-terra) 30%, transparent)', background: 'color-mix(in oklch, var(--lh-terra) 10%, var(--lh-surface))', padding: '12px 16px', fontSize: 14, color: 'var(--lh-terra)' }}
          >
            {t('radios.error', 'No pudimos completar la búsqueda. Intenta de nuevo.')}
          </div>
        )}

        {hasFavorites && !showResults && (
          <Section title={t('radios.section.favorites', 'Tus favoritas')}>
            <StationGrid stations={favorites} currentStationId={currentStation?.id} isPlaying={isPlaying} isLoading={isLoading} onPlay={handlePlay} isFavorite={isFavorite} onToggleFavorite={toggle} t={t} />
          </Section>
        )}

        {!showResults && (
          <Section title={t('radios.section.featured', 'Destacadas Colombia')}>
            <StationGrid stations={featuredStations} currentStationId={currentStation?.id} isPlaying={isPlaying} isLoading={isLoading} onPlay={handlePlay} isFavorite={isFavorite} onToggleFavorite={toggle} t={t} />
          </Section>
        )}

        {!showResults && (
          <Section title={t('radios.section.popular', 'Populares')} loading={popularLoading}>
            {popular.length === 0 && !popularLoading ? (
              <p style={{ fontSize: 15, color: 'var(--lh-fg2)' }}>
                {t('radios.popular.empty', 'No hay emisoras populares disponibles para este país.')}
              </p>
            ) : (
              <StationGrid stations={popular} currentStationId={currentStation?.id} isPlaying={isPlaying} isLoading={isLoading} onPlay={handlePlay} isFavorite={isFavorite} onToggleFavorite={toggle} t={t} />
            )}
          </Section>
        )}

        {showResults && (
          <Section title={t('radios.section.results', 'Resultados de búsqueda')} loading={loading}>
            <div aria-live="polite" className="sr-only">
              {loading ? t('radios.searching', 'Buscando emisoras…') : `${results!.length} ${t('radios.resultsCount', 'resultados')}`}
            </div>
            {showEmpty ? (
              <p style={{ fontSize: 15, color: 'var(--lh-fg2)' }}>
                {t('radios.results.empty', 'No encontramos emisoras con esos criterios. Prueba con otra búsqueda.')}
              </p>
            ) : (
              <StationGrid stations={cardStations} currentStationId={currentStation?.id} isPlaying={isPlaying} isLoading={isLoading} onPlay={handlePlay} isFavorite={isFavorite} onToggleFavorite={toggle} t={t} />
            )}
          </Section>
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

  return (
    <section aria-label={t('radios.search.aria', 'Buscar emisoras')} className="lh-card" style={{ padding: 22 }}>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr' }} className="sm:grid-cols-[1fr_auto_auto]">
        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <label htmlFor={inputId} className="sr-only">{t('radios.search.placeholder', 'Buscar emisora')}</label>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--lh-fg3)', pointerEvents: 'none' }} aria-hidden="true" />
          <input
            id={inputId}
            type="search"
            inputMode="search"
            autoComplete="off"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder={t('radios.search.placeholder', 'Buscar emisora por nombre…')}
            className="lh-input"
            style={{ paddingLeft: 40, paddingRight: query ? 36 : 16 }}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label={t('radios.search.clear', 'Limpiar búsqueda')}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--lh-fg3)', display: 'flex' }}
            >
              <X style={{ width: 16, height: 16 }} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Country select */}
        <div>
          <label htmlFor={countryId} className="sr-only">{t('radios.filter.country', 'País')}</label>
          <select id={countryId} value={country} onChange={e => onCountryChange(e.target.value)} className="lh-input" style={{ minWidth: 160 }}>
            {COUNTRY_OPTIONS.map(opt => (
              <option key={opt.code || 'any'} value={opt.code}>{t(opt.labelKey, opt.fallback)}</option>
            ))}
          </select>
        </div>

        {/* Genre select */}
        <div>
          <label htmlFor={genreId} className="sr-only">{t('radios.filter.genre', 'Género')}</label>
          <select id={genreId} value={genre} onChange={e => onGenreChange(e.target.value)} className="lh-input" style={{ minWidth: 160 }}>
            {GENRE_OPTIONS.map(opt => (
              <option key={opt.value || 'any'} value={opt.value}>{t(opt.labelKey, opt.fallback)}</option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClear}
            style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--lh-fg2)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {t('radios.filter.clear', 'Limpiar filtros')}
          </button>
        </div>
      )}
    </section>
  )
}

// ── Section ──────────────────────────────────────────────────────────────────

function Section({ title, loading, children }: { title: string; loading?: boolean; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--lh-font)', fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 600, letterSpacing: '-.02em', color: 'var(--lh-fg)', margin: 0 }}>
          {title}
        </h2>
        {loading && <Loader2 style={{ width: 18, height: 18, color: 'var(--lh-fg3)' }} className="animate-spin" aria-hidden="true" />}
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

function StationGrid({ stations, currentStationId, isPlaying, isLoading, onPlay, isFavorite, onToggleFavorite, t }: GridProps) {
  return (
    <ul role="list" className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
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

function StationCard({ station, index, isCurrent, isPlaying, isLoading, onPlay, isFavorite, onToggleFavorite, t }: CardProps) {
  const [logoErrored, setLogoErrored] = useState(false)

  const accent = ACCENTS[index % ACCENTS.length]
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
    <li className="lh-card" style={{ position: 'relative', padding: 22, overflow: 'hidden', listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
      {/* Círculo de acento decorativo */}
      <div aria-hidden="true" style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: tint(accent), pointerEvents: 'none' }} />

      {/* Fila superior: ícono + favorito */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative' }}>
        <div aria-hidden="true" style={{ width: 56, height: 56, background: tint(accent), borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, color: accent }}>
          {showLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={station.logoUrl} alt="" width={56} height={56} loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setLogoErrored(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <RadioIcon size={26} />
          )}
        </div>

        <button
          type="button"
          onClick={() => onToggleFavorite(station)}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? t('radios.favorite.remove', 'Quitar de favoritos') : t('radios.favorite.add', 'Añadir a favoritos')}
          style={{ padding: 8, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: isFavorite ? 'var(--lh-terra)' : 'var(--lh-fg3)' }}
        >
          <Heart size={20} style={{ fill: isFavorite ? 'var(--lh-terra)' : 'transparent', stroke: isFavorite ? 'var(--lh-terra)' : 'var(--lh-fg3)', transition: 'fill .15s, stroke .15s' }} aria-hidden="true" />
        </button>
      </div>

      <h3 style={{ fontFamily: 'var(--lh-font)', fontSize: 18, fontWeight: 600, color: 'var(--lh-fg)', letterSpacing: '-.015em', lineHeight: 1.2, margin: '0 0 8px', position: 'relative' }} title={station.name}>
        {station.name}
      </h3>

      <p style={{ fontSize: 13.5, color: 'var(--lh-fg2)', lineHeight: 1.55, margin: '0 0 12px' }}>
        {descText}
      </p>

      {station.tags && station.tags.length > 0 && (
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '0 0 18px', listStyle: 'none', padding: 0 }} aria-label={t('radios.tags', 'Etiquetas')}>
          {station.tags.slice(0, 3).map(tag => (
            <li key={tag} style={{ fontFamily: 'var(--lh-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: 'var(--lh-surface2)', border: '1px solid var(--lh-border2)', color: 'var(--lh-fg2)' }}>
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="lh-btn lh-btn--sm lh-btn--primary"
          onClick={() => void onPlay(station)}
          aria-label={buttonLabel}
          disabled={showSpinner}
          style={{ opacity: showSpinner ? 0.6 : 1 }}
        >
          {showSpinner
            ? <><Loader2 size={15} className="animate-spin" /> {t('audio.connecting', 'Conectando…')}</>
            : isActivePlaying
              ? <><Square size={14} fill="currentColor" /> {t('radios.stop', 'Detener')}</>
              : <><Play size={14} fill="currentColor" /> {t('radios.play', 'Reproducir')}</>}
        </button>

        {station.homepage && (
          <a href={station.homepage} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: 'var(--lh-fg3)', textDecoration: 'underline', marginLeft: 'auto' }}>
            {t('radios.website', 'Sitio web')}
          </a>
        )}
      </div>
    </li>
  )
}
