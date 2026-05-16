import { describe, it, expect, vi, beforeEach } from 'vitest'

// Type-friendly Prisma client mock. Each method is replaced per test.
const prismaMock = {
  favoriteStation: {
    findMany: vi.fn(),
    count: vi.fn(),
    findFirst: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    upsert: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
  default: prismaMock,
}))

const {
  listFavorites,
  addFavorite,
  removeFavorite,
  bulkAddFavorites,
  rowToStation,
} = await import('@/lib/radio-favorites-server')

function row(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'fav-1',
    userId: 'user-1',
    stationId: 'aaaa-1111',
    name: 'Test FM',
    streamUrl: 'https://example.com/a.mp3',
    homepage: null,
    logoUrl: null,
    country: 'Colombia',
    countryCode: 'CO',
    language: null,
    codec: 'MP3',
    bitrate: 128,
    tags: ['salsa'],
    createdAt: new Date('2026-01-01'),
    ...overrides,
  }
}

describe('rowToStation', () => {
  it('strips nulls and empty tag arrays', () => {
    const s = rowToStation(row({ homepage: null, logoUrl: null, tags: [] }))
    expect(s.homepage).toBeUndefined()
    expect(s.logoUrl).toBeUndefined()
    expect(s.tags).toBeUndefined()
    expect(s.id).toBe('aaaa-1111')
  })
})

describe('listFavorites', () => {
  beforeEach(() => {
    Object.values(prismaMock.favoriteStation).forEach(fn => fn.mockReset())
  })

  it('returns mapped stations ordered by createdAt desc', async () => {
    prismaMock.favoriteStation.findMany.mockResolvedValue([row(), row({ stationId: 'bbbb-2222' })])
    const out = await listFavorites('user-1')
    expect(out).toHaveLength(2)
    expect(prismaMock.favoriteStation.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      })
    )
  })
})

describe('addFavorite', () => {
  beforeEach(() => {
    Object.values(prismaMock.favoriteStation).forEach(fn => fn.mockReset())
  })

  it('upserts a new favorite when under cap', async () => {
    prismaMock.favoriteStation.count.mockResolvedValue(3)
    prismaMock.favoriteStation.upsert.mockResolvedValue(row())

    const out = await addFavorite('user-1', {
      stationId: 'aaaa-1111',
      name: 'Test FM',
      streamUrl: 'https://example.com/a.mp3',
    })

    expect(out.id).toBe('aaaa-1111')
    expect(prismaMock.favoriteStation.delete).not.toHaveBeenCalled()
    expect(prismaMock.favoriteStation.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_stationId: { userId: 'user-1', stationId: 'aaaa-1111' } },
      })
    )
  })

  it('evicts oldest entry when user is at the cap', async () => {
    prismaMock.favoriteStation.count.mockResolvedValue(200)
    prismaMock.favoriteStation.findFirst.mockResolvedValue({ id: 'oldest-id' })
    prismaMock.favoriteStation.delete.mockResolvedValue({ id: 'oldest-id' })
    prismaMock.favoriteStation.upsert.mockResolvedValue(row())

    await addFavorite('user-1', {
      stationId: 'aaaa-1111',
      name: 'Test FM',
      streamUrl: 'https://example.com/a.mp3',
    })

    expect(prismaMock.favoriteStation.delete).toHaveBeenCalledWith({ where: { id: 'oldest-id' } })
    expect(prismaMock.favoriteStation.upsert).toHaveBeenCalled()
  })
})

describe('removeFavorite', () => {
  beforeEach(() => {
    Object.values(prismaMock.favoriteStation).forEach(fn => fn.mockReset())
  })

  it('returns true when a row was removed', async () => {
    prismaMock.favoriteStation.deleteMany.mockResolvedValue({ count: 1 })
    expect(await removeFavorite('user-1', 'aaaa-1111')).toBe(true)
  })

  it('returns false when nothing was removed', async () => {
    prismaMock.favoriteStation.deleteMany.mockResolvedValue({ count: 0 })
    expect(await removeFavorite('user-1', 'aaaa-1111')).toBe(false)
  })
})

describe('bulkAddFavorites', () => {
  beforeEach(() => {
    Object.values(prismaMock.favoriteStation).forEach(fn => fn.mockReset())
  })

  it('returns existing favorites when input is empty', async () => {
    prismaMock.favoriteStation.findMany.mockResolvedValue([row()])
    const out = await bulkAddFavorites('user-1', [])
    expect(out).toHaveLength(1)
    expect(prismaMock.favoriteStation.upsert).not.toHaveBeenCalled()
  })

  it('upserts each input then returns the full list', async () => {
    prismaMock.favoriteStation.count.mockResolvedValue(0)
    prismaMock.favoriteStation.upsert.mockResolvedValue(row())
    prismaMock.favoriteStation.findMany.mockResolvedValue([row(), row({ stationId: 'bbbb-2222' })])

    const out = await bulkAddFavorites('user-1', [
      { stationId: 'aaaa-1111', name: 'A', streamUrl: 'https://a/x' },
      { stationId: 'bbbb-2222', name: 'B', streamUrl: 'https://b/x' },
    ])

    expect(prismaMock.favoriteStation.upsert).toHaveBeenCalledTimes(2)
    expect(out).toHaveLength(2)
  })
})
