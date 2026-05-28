/**
 * Job Detail API
 * GET /api/jobs/[id] - Get job offer detail
 * PUT /api/jobs/[id] - Edit job offer (owner only)
 * DELETE /api/jobs/[id] - Soft delete job offer (owner only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { getAuthUserId } from '@/lib/get-auth-user'

const URL_SHORTENER_REGEX =
  /^(https?:\/\/)?(bit\.ly|tinyurl\.com|cutt\.ly|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|shorte\.st)\//i

export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs/[id]
 *
 * Returns full job offer detail including contact info.
 *
 * Response 200:
 *   { success, data: JobDetail }
 *
 * Response 404:
 *   { success: false, error: 'Job not found' }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required.' },
        { status: 400 }
      )
    }

    const job = await prisma.jobOffer.findUnique({
      where: { id },
    })

    if (!job || job.deletedAt !== null || job.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Job not found.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        title: job.title,
        category: job.category,
        description: job.description,
        location: job.location,
        jobType: job.jobType,
        hourlyRate: job.hourlyRate,
        email: job.email,
        phone: job.phone,
        externalLink: job.externalLink,
        isVerified: job.isVerified,
        createdAt: job.createdAt,
        expiresAt: job.expiresAt,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error in GET /api/jobs/[id]', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading job.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUserId = await getAuthUserId(request)
    if (!authUserId) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida.' },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingJob = await prisma.jobOffer.findUnique({ where: { id } })
    if (!existingJob || existingJob.deletedAt !== null) {
      return NextResponse.json(
        { success: false, error: 'Empleo no encontrado.' },
        { status: 404 }
      )
    }

    if (existingJob.userId !== authUserId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para editar este empleo.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, category, description, location, jobType, hourlyRate, email, phone, externalLink } = body

    if (hourlyRate !== undefined && hourlyRate <= 0) {
      return NextResponse.json(
        { success: false, error: 'El salario por hora debe ser mayor a 0.' },
        { status: 400 }
      )
    }

    // Validar que al menos un contacto quede activo tras la actualización
    const effectiveEmail = email !== undefined ? email : existingJob.email
    const effectivePhone = phone !== undefined ? phone : existingJob.phone
    const effectiveExternalLink = externalLink !== undefined ? externalLink : existingJob.externalLink

    if (!effectiveEmail && !effectivePhone && !effectiveExternalLink) {
      return NextResponse.json(
        { success: false, error: 'Se requiere al menos un método de contacto válido (email, teléfono o enlace).' },
        { status: 400 }
      )
    }

    if (externalLink && URL_SHORTENER_REGEX.test(externalLink)) {
      return NextResponse.json(
        { success: false, error: 'Por seguridad de la comunidad, no se permiten acortadores de URL en los enlaces externos.' },
        { status: 400 }
      )
    }

    const updatedJob = await prisma.jobOffer.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(location !== undefined && { location }),
        ...(jobType !== undefined && { jobType }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(externalLink !== undefined && { externalLink }),
      },
    })

    return NextResponse.json({ success: true, data: updatedJob })
  } catch (error) {
    logger.error('Error in PUT /api/jobs/[id]', { error })
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el empleo.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUserId = await getAuthUserId(request)
    if (!authUserId) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida.' },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingJob = await prisma.jobOffer.findUnique({ where: { id } })
    if (!existingJob || existingJob.deletedAt !== null) {
      return NextResponse.json(
        { success: false, error: 'Empleo no encontrado.' },
        { status: 404 }
      )
    }

    if (existingJob.userId !== authUserId) {
      return NextResponse.json(
        { success: false, error: 'No tienes permiso para eliminar este empleo.' },
        { status: 403 }
      )
    }

    await prisma.jobOffer.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true, message: 'Empleo eliminado.' })
  } catch (error) {
    logger.error('Error in DELETE /api/jobs/[id]', { error })
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el empleo.' },
      { status: 500 }
    )
  }
}
