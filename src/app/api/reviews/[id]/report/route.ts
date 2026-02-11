import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });

    const { id: reviewId } = await params;
    const { reason, details } = await req.json();

    // 1. Verificar si ya reportó esta reseña
    const isPrivileged = session.user.role === 'ADMIN' || session.user.role === 'MODERATOR';

    const existingReport = await prisma.report.findUnique({
      where: {
        reviewId_reporterId: {
          reviewId,
          reporterId: session.user.id,
        },
      },
    });

    if (existingReport) {
      // ADMIN/MODERATOR: eliminar reporte anterior para poder re-testear el flujo
      if (isPrivileged) {
        await prisma.report.delete({ where: { id: existingReport.id } });
      } else {
        return NextResponse.json({ error: "Ya has reportado esta reseña" }, { status: 409 });
      }
    }

    // 2. Crear el reporte y actualizar contador en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // A. Crear reporte
      await tx.report.create({
        data: {
          reviewId,
          reporterId: session.user.id,
          reason,
          details,
        },
      });

      // B. Actualizar reseña
      const review = await tx.review.update({
        where: { id: reviewId },
        data: {
          reportCount: { increment: 1 },
        },
      });

      // C. LÓGICA DE AUTO-HIDE (Threshold: 3)
      if (review.reportCount >= 3 && review.status === "VISIBLE") {
        await tx.review.update({
          where: { id: reviewId },
          data: { status: "FLAGGED" }, // Ocultar preventivamente
        });
        
        // TODO: Enviar email al admin avisando "Reseña bajo fuego"
      }

      return review;
    });

    return NextResponse.json({ 
      success: true, 
      message: result.status === "FLAGGED" 
        ? "Reseña bajo revisión por múltiples reportes." 
        : "Reporte enviado correctamente."
    });

  } catch {
    return NextResponse.json({ error: "Error al reportar" }, { status: 500 });
  }
}
