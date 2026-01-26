// src/app/api/businesses/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validations/business";
import { z } from "zod";

// Definición correcta de tipos para Next.js 15
export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. OBTENER ID (CRÍTICO: Debemos hacer await a params)
    const params = await props.params;
    const businessId = params.id;

    // 2. Validar sesión
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 3. Verificar que el negocio existe y pertenece al usuario
    const existingBusiness = await prisma.business.findUnique({
      where: { id: businessId },
      select: { ownerId: true },
    });

    if (!existingBusiness) {
      return NextResponse.json({ error: "Negocio no encontrado" }, { status: 404 });
    }

    if (existingBusiness.ownerId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para editar este negocio" }, { status: 403 });
    }

    // 4. Leer y validar los datos que envía el formulario
    const body = await req.json();
    
    // Validamos con Zod (igual que al crear)
    const validatedData = businessSchema.parse(body);

    // 5. ACTUALIZAR EN BASE DE DATOS
    const updatedBusiness = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: validatedData.name,
        // No actualizamos el slug para no romper el SEO/URLs existentes
        description: validatedData.description,
        category: validatedData.category,
        
        email: validatedData.email,
        phone: validatedData.phone,
        website: validatedData.website || null,
        
        city: validatedData.city,
        address: validatedData.address || null,
        
        instagram: validatedData.instagram || null,
        whatsapp: validatedData.whatsapp || null,
        
        images: validatedData.images || [], // Actualizamos las fotos
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
