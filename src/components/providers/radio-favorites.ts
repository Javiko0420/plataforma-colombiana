'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import type { Station } from '@/components/providers/audio-provider'

/**
 * Hybrid storage for favorite radio stations:
 *  - Anonymous users → localStorage (no auth required, survives refresh).
 *  - Authenticated users → server DB (cross-device sync), with localStorage
 *    used only as a temporary write-through cache for offline resilience.
 *
 * On sign-in we migrate any local-only favorites to the server (bulk upsert),
 * then drop the local copy so the DB becomes the source of truth.
 */

const STORAGE_KEY = 'radio_favorites_v1'
const MAX_FAVORITES = 50

type StoredStation = Station

function readStorage(): StoredStation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (s): s is StoredStation =>
        s &&
        typeof s === 'object' &&
        typeof s.id === 'string' &&
        typeof s.name === 'string' &&
        typeof s.streamUrl === 'string'
    )
  } catch {
    return []
  }
}

function writeStorage(items: StoredStation[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_FAVORITES)))
  } catch {
    // Quota exceeded or storage disabled (private mode); fail silently.
  }
}

function clearStorage(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Convert a `Station` to the JSON payload accepted by the server API.
 * Drops empty/invalid fields so server-side Zod validation does not reject
 * harmless undefined values.
 */
function toPayload(station: Station) {
  const httpsOrUndef = (v?: string) =>
    v && /^https:\/\//i.test(v) ? v : undefined
  return {
    stationId: station.id,
    name: station.name,
    streamUrl: station.streamUrl,
    homepage: httpsOrUndef(station.homepage),
    logoUrl: httpsOrUndef(station.logoUrl),
    country: station.country || undefined,
    countryCode: station.countryCode || undefined,
    language: station.language || undefined,
    codec: station.codec || undefined,
    bitrate: typeof station.bitrate === 'number' ? station.bitrate : undefined,
    tags: station.tags?.length ? station.tags : undefined,
  }
}

type ApiListResponse =
  | { success: true; data: { stations: Station[] } }
  | { success: false; error: string }

type ApiAddResponse =
  | { success: true; data: { station?: Station; stations?: Station[] } }
  | { success: false; error: string }

export function useRadioFavorites() {
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const [favorites, setFavorites] = useState<Station[]>([])
  const [hydrated, setHydrated] = useState(false)
  // Tracks whether the post-login migration ran for the current session to
  // avoid re-uploading on every refocus.
  const migratedRef = useRef(false)

  // Initial hydration: read localStorage immediately so anonymous users (and
  // logged-in users while the server fetch is in flight) see instant UI.
  useEffect(() => {
    setFavorites(readStorage())
    setHydrated(true)
  }, [])

  // Cross-tab sync for the anonymous-only storage.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      if (isAuthenticated) return
      setFavorites(readStorage())
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [isAuthenticated])

  // When the user authenticates: (1) push local-only favorites to server,
  // (2) fetch the canonical server list, (3) drop the local copy.
  useEffect(() => {
    if (!isAuthenticated) {
      migratedRef.current = false
      return
    }
    if (migratedRef.current) return
    migratedRef.current = true

    const localCopy = readStorage()

    const sync = async () => {
      try {
        if (localCopy.length > 0) {
          await fetch('/api/radio/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stations: localCopy.map(toPayload) }),
            credentials: 'include',
          })
        }
        const res = await fetch('/api/radio/favorites', {
          credentials: 'include',
          cache: 'no-store',
        })
        const json = (await res.json()) as ApiListResponse
        if (json.success) {
          setFavorites(json.data.stations)
          clearStorage()
        }
      } catch {
        // Network error: keep local snapshot, will retry on next mount.
        migratedRef.current = false
      }
    }
    void sync()
  }, [isAuthenticated])

  const isFavorite = useCallback(
    (id: string) => favorites.some(s => s.id === id),
    [favorites]
  )

  // Add: optimistic UI + persist. Local for anon, DB for auth.
  const add = useCallback(
    (station: Station) => {
      setFavorites(prev => {
        if (prev.some(s => s.id === station.id)) return prev
        const next = [station, ...prev].slice(0, MAX_FAVORITES)
        if (!isAuthenticated) writeStorage(next)
        return next
      })

      if (isAuthenticated) {
        void fetch('/api/radio/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toPayload(station)),
          credentials: 'include',
        })
          .then(r => (r.ok ? (r.json() as Promise<ApiAddResponse>) : null))
          .then(json => {
            if (json?.success && json.data.station) {
              setFavorites(prev => {
                const filtered = prev.filter(s => s.id !== json.data.station!.id)
                return [json.data.station!, ...filtered].slice(0, MAX_FAVORITES)
              })
            }
          })
          .catch(() => {
            // Roll back the optimistic add on hard failure.
            setFavorites(prev => prev.filter(s => s.id !== station.id))
          })
      }
    },
    [isAuthenticated]
  )

  const remove = useCallback(
    (id: string) => {
      const previous = favorites
      setFavorites(prev => {
        const next = prev.filter(s => s.id !== id)
        if (!isAuthenticated) writeStorage(next)
        return next
      })

      if (isAuthenticated) {
        void fetch(`/api/radio/favorites/${encodeURIComponent(id)}`, {
          method: 'DELETE',
          credentials: 'include',
        }).catch(() => {
          setFavorites(previous)
        })
      }
    },
    [favorites, isAuthenticated]
  )

  const toggle = useCallback(
    (station: Station) => {
      const exists = favorites.some(s => s.id === station.id)
      if (exists) remove(station.id)
      else add(station)
    },
    [favorites, add, remove]
  )

  const clear = useCallback(() => {
    const previous = favorites
    setFavorites([])
    if (!isAuthenticated) {
      writeStorage([])
      return
    }
    void Promise.all(
      previous.map(s =>
        fetch(`/api/radio/favorites/${encodeURIComponent(s.id)}`, {
          method: 'DELETE',
          credentials: 'include',
        })
      )
    ).catch(() => {
      setFavorites(previous)
    })
  }, [favorites, isAuthenticated])

  return { favorites, hydrated, isAuthenticated, isFavorite, add, remove, toggle, clear }
}
