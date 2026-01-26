import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Asegúrate de que esta ruta sea correcta según tu proyecto
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validations/business";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 1. Validar los datos con Zod
    const validatedData = businessSchema.parse(body);

    // 2. Generar un slug único (ej: "arepas-don-javi")
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4);

    // 3. Crear el negocio en la BD
    const newBusiness = await prisma.business.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        category: validatedData.category,
        email: validatedData.email,
        phone: validatedData.phone,
        website: validatedData.website || null,
        city: validatedData.city,
        address: validatedData.address || null,
        instagram: validatedData.instagram || null,
        facebook: validatedData.facebook || null,
        whatsapp: validatedData.whatsapp || null,
        images: validatedData.images || [],
        ownerId: session.user.id,
        isActive: true, // Activo por defecto en el MVP
      },
    });

    return NextResponse.json(newBusiness, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating business:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
