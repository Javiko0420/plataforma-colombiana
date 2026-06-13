import { describe, it, expect, vi, beforeEach } from 'vitest'
import { worldcupCache } from '../cache'

describe('InMemoryCacheStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('returns null for a key that has never been set', () => {
    expect(worldcupCache.get('does-not-exist')).toBeNull()
  })

  it('returns the stored value within the TTL window', () => {
    worldcupCache.set('k1', { foo: 'bar' }, 60)
    expect(worldcupCache.get('k1')).toEqual({ foo: 'bar' })
  })

  it('returns null after the TTL has expired', () => {
    worldcupCache.set('k2', 'hello', 10)
    vi.advanceTimersByTime(10_001)
    expect(worldcupCache.get('k2')).toBeNull()
  })

  it('respects TTL boundary exactly: still valid 1 ms before expiry', () => {
    worldcupCache.set('k3', 42, 5)
    vi.advanceTimersByTime(4_999)
    expect(worldcupCache.get('k3')).toBe(42)
  })

  it('overwrites an existing key with a new value', () => {
    worldcupCache.set('k4', 'old', 60)
    worldcupCache.set('k4', 'new', 60)
    expect(worldcupCache.get('k4')).toBe('new')
  })

  it('stores different types independently', () => {
    worldcupCache.set<number>('num', 7, 60)
    worldcupCache.set<string[]>('arr', ['a', 'b'], 60)
    expect(worldcupCache.get<number>('num')).toBe(7)
    expect(worldcupCache.get<string[]>('arr')).toEqual(['a', 'b'])
  })
})
