/**
 * Home data layer — queries cacheadas para las secciones del landing.
 *
 * Cada función usa unstable_cache con TTLs espejo de los s-maxage de las
 * APIs públicas equivalentes (/api/businesses/featured, /api/jobs,
 * /api/events/upcoming, /api/forums/trending), que siguen existiendo para
 * la app mobile y otros consumidores.
 *
 * IMPORTANTE: unstable_cache serializa a JSON, así que en cache-hit los
 * `Date` de Prisma llegarían como string. Para evitar sorpresas, las formas
 * de retorno usan SOLO tipos JSON-safe (fechas como ISO string).
 */

import { unstable_cache } from 'next/cache'
import type { BusinessPlan } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getTrendingThreads } from '@/lib/forum'

/* ─── Negocios destacados (espejo de /api/businesses/featured) ─── */

export interface HomeBusiness {
  id: string
  name: string
  slug: string
  category: string
  city: string | null
  state: string | null
  images: string[]
  isVerified: boolean
  logoUrl: string | null
  plan: BusinessPlan
  rating: number | null
  reviewCount: number
}

const homeBusinessSelect = {
  id: true,
  name: true,
  slug: true,
  category: true,
  city: true,
  state: true,
  images: true,
  isVerified: true,
  logoUrl: true,
  plan: true,
  // Solo reseñas visibles influyen en el rating público (excluye HIDDEN/FLAGGED).
  reviews: { where: { status: 'VISIBLE' as const }, select: { rating: true } },
} as const

type RawHomeBusiness = Omit<HomeBusiness, 'rating' | 'reviewCount'> & {
  reviews: { rating: number }[]
}

/** Aplana un negocio crudo: calcula el rating promedio y descarta las reseñas. */
function toHomeBusiness(business: RawHomeBusiness): HomeBusiness {
  const { reviews, ...rest } = business
  const reviewCount = reviews.length
  const rating =
    reviewCount > 0
      ? Math.round((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount) * 10) / 10
      : null
  return { ...rest, rating, reviewCount }
}

/**
 * Slots del home: pagados por ranking (1-N) + relleno orgánico (createdAt ASC).
 * Mismo algoritmo que GET /api/businesses/featured.
 */
export const getHomeBusinesses = unstable_cache(
  async (): Promise<HomeBusiness[]> => {
    const limit = 8

    const paidSlots = await prisma.business.findMany({
      where: { isActive: true, ranking: { gte: 1, lte: limit } },
      orderBy: { ranking: 'asc' },
      select: { ...homeBusinessSelect, ranking: true },
    })

    const paidBySlot = new Map<number, HomeBusiness>()
    const paidIds = new Set<string>()
    for (const business of paidSlots) {
      const { ranking, ...rest } = business
      if (!paidBySlot.has(ranking)) {
        const featured = toHomeBusiness(rest)
        paidBySlot.set(ranking, featured)
        paidIds.add(featured.id)
      }
    }

    const organics = await prisma.business.findMany({
      where: { isActive: true, ranking: 0, id: { notIn: [...paidIds] } },
      orderBy: { createdAt: 'asc' },
      take: limit,
      select: homeBusinessSelect,
    })

    const data: HomeBusiness[] = []
    let organicIndex = 0
    for (let slot = 1; slot <= limit; slot++) {
      const paid = paidBySlot.get(slot)
      if (paid) {
        data.push(paid)
        continue
      }
      if (organicIndex < organics.length) {
        data.push(toHomeBusiness(organics[organicIndex]))
        organicIndex += 1
      }
    }

    return data
  },
  ['home-businesses'],
  { revalidate: 300 },
)

/* ─── Empleos recientes (espejo de /api/jobs?limit=4) ─── */

export interface HomeJob {
  id: string
  title: string
  category: string
  location: string
  jobType: string
  hourlyRate: number
}

export const getHomeJobs = unstable_cache(
  async (): Promise<HomeJob[]> => {
    return prisma.jobOffer.findMany({
      where: { deletedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        jobType: true,
        hourlyRate: true,
      },
    })
  },
  ['home-jobs'],
  { revalidate: 60 },
)

/* ─── Eventos próximos (espejo de /api/events/upcoming?limit=3) ─── */

export interface HomeEvent {
  id: string
  title: string
  category: string
  /** ISO string — JSON-safe a través de unstable_cache. */
  eventDate: string
  location: string
  imageUrl: string | null
}

const homeEventSelect = {
  id: true,
  title: true,
  category: true,
  eventDate: true,
  location: true,
  imageUrl: true,
} as const

type RawHomeEvent = Omit<HomeEvent, 'eventDate'> & { eventDate: Date }

const toHomeEvent = (event: RawHomeEvent): HomeEvent => ({
  ...event,
  eventDate: event.eventDate.toISOString(),
})

/**
 * Slots del home: pagados por ranking (1-N) + relleno orgánico (eventDate ASC).
 * Mismo algoritmo que GET /api/events/upcoming, con fallback si la columna
 * ranking falta en la BD (drift).
 */
export const getHomeEvents = unstable_cache(
  async (): Promise<HomeEvent[]> => {
    const limit = 3
    const upcomingWhere = { eventDate: { gte: new Date() }, isHidden: false } as const

    try {
      const paidSlots = await prisma.event.findMany({
        where: { ...upcomingWhere, ranking: { gte: 1, lte: limit } },
        orderBy: { ranking: 'asc' },
        select: { ...homeEventSelect, ranking: true },
      })

      const paidBySlot = new Map<number, HomeEvent>()
      const paidIds = new Set<string>()
      for (const event of paidSlots) {
        const { ranking, ...rest } = event
        if (!paidBySlot.has(ranking)) {
          const upcoming = toHomeEvent(rest)
          paidBySlot.set(ranking, upcoming)
          paidIds.add(upcoming.id)
        }
      }

      const organics = await prisma.event.findMany({
        where: { ...upcomingWhere, ranking: 0, id: { notIn: [...paidIds] } },
        orderBy: { eventDate: 'asc' },
        take: limit,
        select: homeEventSelect,
      })

      const data: HomeEvent[] = []
      let organicIndex = 0
      for (let slot = 1; slot <= limit; slot++) {
        const paid = paidBySlot.get(slot)
        if (paid) {
          data.push(paid)
          continue
        }
        if (organicIndex < organics.length) {
          data.push(toHomeEvent(organics[organicIndex]))
          organicIndex += 1
        }
      }

      return data
    } catch {
      // Columna ranking ausente → orden simple por fecha (mismo fallback que la API).
      const events = await prisma.event.findMany({
        where: upcomingWhere,
        orderBy: { eventDate: 'asc' },
        take: limit,
        select: homeEventSelect,
      })
      return events.map(toHomeEvent)
    }
  },
  ['home-events'],
  { revalidate: 300 },
)

/* ─── Foros trending (espejo de /api/forums/trending?limit=3) ─── */

export interface HomeThread {
  id: string
  forumSlug: string
  forumName: string
  displayTitle: string
  authorNickname: string
  /** ISO string — JSON-safe a través de unstable_cache. */
  createdAt: string
  likesCount: number
  commentsCount: number
  colorIdx: number
}

export const getHomeThreads = unstable_cache(
  async (): Promise<HomeThread[]> => {
    const threads = await getTrendingThreads(3)
    return threads.map((thread) => ({
      ...thread,
      createdAt: new Date(thread.createdAt).toISOString(),
    }))
  },
  ['home-threads'],
  { revalidate: 60 },
)
