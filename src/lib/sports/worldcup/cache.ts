// In-memory cache with TTL.
// The CacheStore interface is designed to be drop-in replaceable with
// Vercel KV or Redis without touching call sites.

export interface CacheStore {
  get<T>(key: string): T | null
  set<T>(key: string, value: T, ttlSeconds: number): void
}

type CacheEntry<T> = { value: T; expiresAt: number }

class InMemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value as T
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }
}

// Singleton shared across all worldcup route handlers in the same server instance.
export const worldcupCache: CacheStore = new InMemoryCacheStore()
