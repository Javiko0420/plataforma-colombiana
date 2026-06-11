'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { EVENT_CATEGORIES, isValidCategory } from '@/lib/constants/categories'

const URL_SHORTENER_REGEX = /(https?:\/\/)?(bit\.ly|tinyurl\.com|cutt\.ly|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|shorte\.st)\//i

/** Verifica que el usuario esté autenticado y retorna la sesión */
async function getSessionOrThrow() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('No autorizado')
  return session
}

/** Verifica que el usuario sea dueño del evento o tenga rol privilegiado */
function assertOwnerOrAdmin(
  eventUserId: string,
  sessionUserId: string,
  role: string
) {
  const isOwner = eventUserId === sessionUserId
  const isPrivileged = role === 'ADMIN' || role === 'MODERATOR'

  if (!isOwner && !isPrivileged) {
    throw new Error('No tienes permisos para realizar esta acción')
  }
}

/** Obtiene un evento por ID, verificando que el usuario sea el dueño */
export async function getEventById(eventId: string) {
  const session = await getSessionOrThrow()

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return { success: false, error: 'Evento no encontrado.' }
    }

    // Solo el dueño o un admin/moderador puede obtener el evento para edición
    const userRole = session.user.role ?? 'USER'
    assertOwnerOrAdmin(event.userId, session.user.id, userRole)

    return { success: true, data: event }
  } catch (error) {
    console.error('Error fetching event:', error)
    return { success: false, error: 'No se pudo obtener el evento.' }
  }
}

export async function createEvent(data: {
  title: string
  description: string
  category: string
  eventDate: string | Date
  location: string
  imageUrl?: string
  ticketLink?: string
  ticketPrice?: number
}) {
  const session = await getSessionOrThrow()

  if (URL_SHORTENER_REGEX.test(data.description)) {
    return { success: false, error: 'La descripción no puede contener enlaces acortados (bit.ly, tinyurl, t.co, etc.).' }
  }

  if (!isValidCategory(EVENT_CATEGORIES, data.category)) {
    return { success: false, error: 'Categoría inválida.' }
  }

  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        eventDate: new Date(data.eventDate),
        location: data.location,
        imageUrl: data.imageUrl ?? null,
        ticketLink: data.ticketLink ?? null,
        ticketPrice: data.ticketPrice ?? null,
        userId: session.user.id,
      },
    })

    revalidatePath('/eventos')
    revalidatePath('/perfil/eventos')
    return { success: true, data: event }
  } catch (error) {
    console.error('Error creating event:', error)
    return { success: false, error: 'No se pudo crear el evento.' }
  }
}

export async function updateEvent(
  eventId: string,
  data: {
    title?: string
    description?: string
    category?: string
    eventDate?: string | Date
    location?: string
    imageUrl?: string | null
    ticketLink?: string | null
    ticketPrice?: number | null
  }
) {
  const session = await getSessionOrThrow()
  const userRole = session.user.role ?? 'USER'

  if (data.description && URL_SHORTENER_REGEX.test(data.description)) {
    return { success: false, error: 'La descripción no puede contener enlaces acortados (bit.ly, tinyurl, t.co, etc.).' }
  }

  if (data.category !== undefined && !isValidCategory(EVENT_CATEGORIES, data.category)) {
    return { success: false, error: 'Categoría inválida.' }
  }

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    })
    if (!existingEvent) {
      return { success: false, error: 'Evento no encontrado.' }
    }

    assertOwnerOrAdmin(existingEvent.userId, session.user.id, userRole)

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      },
    })

    // Auditar solo cuando un admin/moderador edita evento ajeno
    if (existingEvent.userId !== session.user.id) {
      await prisma.auditLog.create({
        data: {
          action: 'EVENT_UPDATE_BY_ADMIN',
          resource: 'Event',
          resourceId: eventId,
          userId: session.user.id,
          oldValues: {
            title: existingEvent.title,
            category: existingEvent.category,
            eventDate: existingEvent.eventDate,
            location: existingEvent.location,
          },
          newValues: data,
        },
      })
    }

    revalidatePath('/eventos')
    revalidatePath(`/eventos/${eventId}`)
    revalidatePath('/perfil/eventos')
    revalidatePath('/admin/eventos')
    return { success: true, data: updatedEvent }
  } catch (error) {
    console.error('Error updating event:', error)
    return { success: false, error: 'No se pudo actualizar el evento.' }
  }
}

const REPORT_THRESHOLD_TO_HIDE = 2

export async function reportEvent(
  eventId: string,
  data: { reason: string; details?: string }
) {
  const session = await getSessionOrThrow()

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      return { success: false, error: 'Evento no encontrado.' }
    }

    if (event.userId === session.user.id) {
      return { success: false, error: 'No puedes reportar tu propio evento.' }
    }

    const existing = await prisma.report.findUnique({
      where: { eventId_reporterId: { eventId, reporterId: session.user.id } },
    })
    if (existing) {
      return { success: false, error: 'Ya reportaste este evento anteriormente.' }
    }

    await prisma.report.create({
      data: {
        reason: data.reason as 'SPAM' | 'HARASSMENT' | 'HATE_SPEECH' | 'INAPPROPRIATE_CONTENT' | 'MISINFORMATION' | 'OTHER',
        details: data.details ?? null,
        eventId,
        reporterId: session.user.id,
      },
    })

    const reportCount = await prisma.report.count({
      where: { eventId, status: 'PENDING' },
    })

    if (reportCount >= REPORT_THRESHOLD_TO_HIDE && !event.isHidden) {
      await prisma.event.update({
        where: { id: eventId },
        data: { isHidden: true },
      })
    }

    revalidatePath('/eventos')
    revalidatePath(`/eventos/${eventId}`)
    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error) {
    console.error('Error reporting event:', error)
    return { success: false, error: 'No se pudo enviar el reporte.' }
  }
}

export async function hasUserReportedEvent(eventId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return false

  const report = await prisma.report.findUnique({
    where: { eventId_reporterId: { eventId, reporterId: session.user.id } },
  })
  return !!report
}

export async function deleteEvent(eventId: string) {
  const session = await getSessionOrThrow()
  const userRole = session.user.role ?? 'USER'

  try {
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
    })
    if (!existingEvent) {
      return { success: false, error: 'Evento no encontrado.' }
    }

    assertOwnerOrAdmin(existingEvent.userId, session.user.id, userRole)

    await prisma.event.delete({ where: { id: eventId } })

    await prisma.auditLog.create({
      data: {
        action: 'EVENT_DELETE',
        resource: 'Event',
        resourceId: eventId,
        userId: session.user.id,
        oldValues: {
          title: existingEvent.title,
          category: existingEvent.category,
        },
      },
    })

    revalidatePath('/eventos')
    revalidatePath('/perfil/eventos')
    revalidatePath('/admin/eventos')
    return { success: true }
  } catch (error) {
    console.error('Error deleting event:', error)
    return { success: false, error: 'No se pudo eliminar el evento.' }
  }
}
