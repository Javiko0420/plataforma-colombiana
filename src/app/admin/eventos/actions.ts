'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/** Verifica que el usuario tenga rol ADMIN o MODERATOR */
async function verifyAdmin() {
  const session = await getServerSession(authOptions)

  if (
    !session ||
    (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')
  ) {
    throw new Error('Acceso denegado: No tienes privilegios de administrador.')
  }

  return session
}

/** Lista todos los eventos con datos del organizador */
export async function getAdminEvents() {
  await verifyAdmin()

  try {
    const events = await prisma.event.findMany({
      orderBy: [{ eventDate: 'desc' }],
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return { success: true, data: events }
  } catch (error) {
    console.error('Error fetching admin events:', error)
    return {
      success: false,
      error: 'Fallo al obtener los eventos.',
    }
  }
}

/** Edita un evento como admin/moderador (se registra en auditoría) */
export async function adminUpdateEvent(
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
  const session = await verifyAdmin()

  try {
    const previous = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!previous) {
      return { success: false, error: 'Evento no encontrado.' }
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        action: 'EVENT_UPDATE_BY_ADMIN',
        resource: 'Event',
        resourceId: eventId,
        userId: session.user.id,
        oldValues: {
          title: previous.title,
          category: previous.category,
          eventDate: previous.eventDate,
          location: previous.location,
        },
        newValues: data,
      },
    })

    revalidatePath('/admin/eventos')
    revalidatePath('/eventos')
    revalidatePath(`/eventos/${eventId}`)
    return { success: true, data: updatedEvent }
  } catch (error) {
    console.error('Error updating event:', error)
    return { success: false, error: 'No se pudo actualizar el evento.' }
  }
}

/** Lista eventos reportados (con isHidden o reportes pendientes) */
export async function getReportedEvents() {
  await verifyAdmin()

  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { isHidden: true },
          { reports: { some: { status: 'PENDING' } } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        reports: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          include: { reporter: { select: { name: true, email: true } } },
        },
        _count: { select: { reports: { where: { status: 'PENDING' } } } },
      },
    })

    return { success: true, data: events }
  } catch (error) {
    console.error('Error fetching reported events:', error)
    return { success: false, error: 'Fallo al obtener eventos reportados.' }
  }
}

/** Aprueba un evento reportado: lo des-oculta y descarta los reportes */
export async function approveReportedEvent(eventId: string) {
  const session = await verifyAdmin()

  try {
    await prisma.$transaction([
      prisma.event.update({
        where: { id: eventId },
        data: { isHidden: false },
      }),
      prisma.report.updateMany({
        where: { eventId, status: 'PENDING' },
        data: { status: 'DISMISSED', reviewedBy: session.user.id },
      }),
    ])

    await prisma.auditLog.create({
      data: {
        action: 'EVENT_REPORT_APPROVED',
        resource: 'Event',
        resourceId: eventId,
        userId: session.user.id,
        newValues: { decision: 'APPROVED', isHidden: false },
      },
    })

    revalidatePath('/admin/eventos')
    revalidatePath('/eventos')
    revalidatePath(`/eventos/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Error approving reported event:', error)
    return { success: false, error: 'No se pudo aprobar el evento.' }
  }
}

/** Rechaza un evento reportado: lo elimina y resuelve los reportes */
export async function rejectReportedEvent(eventId: string) {
  const session = await verifyAdmin()

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { title: true, category: true, userId: true },
    })

    if (!event) {
      return { success: false, error: 'Evento no encontrado.' }
    }

    await prisma.$transaction([
      prisma.report.updateMany({
        where: { eventId, status: 'PENDING' },
        data: { status: 'RESOLVED', reviewedBy: session.user.id },
      }),
      prisma.event.delete({ where: { id: eventId } }),
    ])

    await prisma.auditLog.create({
      data: {
        action: 'EVENT_REPORT_REJECTED',
        resource: 'Event',
        resourceId: eventId,
        userId: session.user.id,
        oldValues: {
          title: event.title,
          category: event.category,
          ownerId: event.userId,
        },
        newValues: { decision: 'REJECTED_AND_DELETED' },
      },
    })

    revalidatePath('/admin/eventos')
    revalidatePath('/eventos')
    return { success: true }
  } catch (error) {
    console.error('Error rejecting reported event:', error)
    return { success: false, error: 'No se pudo rechazar el evento.' }
  }
}

/** Elimina un evento (acción destructiva, se registra en auditoría) */
export async function adminDeleteEvent(eventId: string) {
  const session = await verifyAdmin()

  try {
    const previous = await prisma.event.findUnique({
      where: { id: eventId },
      select: { title: true, category: true, userId: true },
    })

    if (!previous) {
      return { success: false, error: 'Evento no encontrado.' }
    }

    await prisma.event.delete({
      where: { id: eventId },
    })

    await prisma.auditLog.create({
      data: {
        action: 'EVENT_DELETE_BY_ADMIN',
        resource: 'Event',
        resourceId: eventId,
        userId: session.user.id,
        oldValues: {
          title: previous.title,
          category: previous.category,
          ownerId: previous.userId,
        },
      },
    })

    revalidatePath('/admin/eventos')
    revalidatePath('/eventos')
    return { success: true }
  } catch (error) {
    console.error('Error deleting event:', error)
    return { success: false, error: 'No se pudo eliminar el evento.' }
  }
}
