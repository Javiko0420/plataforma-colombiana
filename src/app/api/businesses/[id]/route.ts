// src/app/api/businesses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/get-auth-user";
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validations/business";
import { z } from "zod";
import { Category } from "@prisma/client";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const businessId = params.id;

    const authUserId = await getAuthUserId(req);
    if (!authUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const existingBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });

    if (!existingBusiness) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    if (existingBusiness.ownerId !== authUserId) {
      return NextResponse.json({ error: "No tienes permiso para editar este negocio" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = businessSchema.parse(body);

    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: validatedData.name,
        // No actualizamos el slug para no romper el SEO/URLs existentes
        description: validatedData.description,
        category: validatedData.category as Category,

        email: validatedData.email,
        phone: validatedData.phone,
        website: validatedData.website || null,

        city: validatedData.city,
        address: validatedData.address || null,

        instagram: validatedData.instagram || null,
        whatsapp: validatedData.whatsapp || null,

        images: validatedData.images || [],
      },
    });

    return NextResponse.json(updatedBusiness);

  } catch (error) {
    console.error("Error al actualizar negocio:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;

    const authUserId = await getAuthUserId(req);
    if (!authUserId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const existingBusiness = await prisma.business.findUnique({
      where: { id: params.id },
      select: { ownerId: true },
    });

    if (!existingBusiness) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    if (existingBusiness.ownerId !== authUserId) {
      return NextResponse.json({ error: "Prohibido: No eres el dueño" }, { status: 403 });
    }

    await prisma.business.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Negocio eliminado correctamente" });

  } catch (error) {
    console.error("Error eliminando negocio:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
