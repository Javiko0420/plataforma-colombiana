import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Validación de datos
const reviewSchema = z.object({
  businessId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(2, "El comentario es muy corto").max(500, "Máximo 500 caracteres"),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Debes iniciar sesión para opinar" }, { status: 401 });
    }

    const body = await req.json();
    const { businessId, rating, comment } = reviewSchema.parse(body);

    // 🛡️ REGLA: Un usuario solo puede dejar UNA reseña por negocio
    // (Evita spam y manipulación de estrellas)
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        businessId: businessId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Ya has publicado una reseña para este negocio." },
        { status: 400 }
      );
    }

    // Crear la reseña
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        businessId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(newReview);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al publicar la reseña" }, { status: 500 });
  }
}
