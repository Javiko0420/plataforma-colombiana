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
