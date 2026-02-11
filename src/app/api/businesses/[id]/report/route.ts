import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reportSchema = z.object({
  reason: z.enum([
    'SPAM',
    'HARASSMENT',
    'HATE_SPEECH',
    'INAPPROPRIATE_CONTENT',
    'MISINFORMATION',
    'OTHER',
  ]),
  details: z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id: businessId } = await params
    const json = await req.json()
    const body = reportSchema.parse(json)

    // Verificar si ya reportó este negocio
    const isPrivileged = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR'

    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: session.user.id,
        businessId,
      },
    })

    if (existingReport) {
      // ADMIN/MODERATOR: eliminar reporte anterior para poder re-testear el flujo
      if (isPrivileged) {
        await prisma.report.delete({ where: { id: existingReport.id } })
      } else {
        return NextResponse.json(
          { error: 'Ya has reportado este negocio' },
          { status: 409 }
        )
      }
    }

    // Crear el reporte vinculado al negocio
    await prisma.report.create({
      data: {
        reason: body.reason,
        details: body.details,
        reporterId: session.user.id,
        businessId,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 })
    }
    console.error('Error reporting business:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
