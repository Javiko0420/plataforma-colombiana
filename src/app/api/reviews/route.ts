import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Configuración: Máximo 5 reseñas por día por usuario
const DAILY_REVIEW_LIMIT = 5;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { businessId, rating, comment } = body;

    // 1. RATE LIMITING (Basado en DB para V1)
    // Contamos cuántas reseñas ha hecho este usuario en las últimas 24 horas
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const recentReviews = await prisma.review.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: oneDayAgo },
      },
    });

    if (recentReviews >= DAILY_REVIEW_LIMIT) {
      return NextResponse.json(
        { error: "Has alcanzado el límite diario de reseñas. Intenta mañana." },
        { status: 429 } // Too Many Requests
      );
    }

    // 2. Validación existente + Creación
    const review = await prisma.review.create({
      data: {
        businessId,
        rating,
        comment,
        userId: session.user.id,
        // status defaults to VISIBLE via Prisma schema
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
