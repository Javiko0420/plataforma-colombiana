import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Asegúrate de que esta ruta sea correcta según tu proyecto
import { prisma } from "@/lib/prisma";
import { businessSchema } from "@/lib/validations/business";
import { z } from "zod";
import { Category } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 👇 INICIO DEL BLOQUE DE SEGURIDAD AUSTRALIA 👇
    // Solo activamos esto en producción (cuando está subido en Vercel)
    if (process.env.NODE_ENV === 'production') {
      const country = req.headers.get("x-vercel-ip-country");
      
      // Si Vercel detecta el país y NO es Australia (AU)
      if (country && country !== 'AU') {
        console.warn(`⛔ Registro bloqueado desde: ${country}`);
        return NextResponse.json(
          { error: "El registro de negocios solo está permitido para usuarios ubicados en Australia 🇦🇺." },
          { status: 403 }
        );
      }
    }
    // 👆 FIN DEL BLOQUE DE SEGURIDAD 👆

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
        category: validatedData.category as Category,
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
