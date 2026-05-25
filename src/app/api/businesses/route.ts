/**
 * Businesses API
 * GET /api/businesses - List active businesses with filters
 * POST /api/businesses - Create a new business
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserId } from '@/lib/get-auth-user'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { businessSchema } from '@/lib/validations/business'
import { z } from 'zod'
import { Category } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/businesses
 *
 * Lists active businesses with optional filters.
 *
 * Query params:
 *   - category: string (e.g. "GASTRONOMIA")
 *   - city: string (e.g. "Sydney")
 *   - q: string (search by name or description)
 *   - page: number (default 1)
 *   - limit: number (default 20, max 50)
 *
 * Response 200:
 *   { success, data: Business[], pagination: { page, limit, total, hasMore } }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const query = searchParams.get('q')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    // Build dynamic where clause
    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive',
      }
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    const [businesses, total] = await Promise.all([
      prisma.business.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          city: true,
          state: true,
          phone: true,
          email: true,
          website: true,
          whatsapp: true,
          instagram: true,
          images: true,
          isVerified: true,
          logoUrl: true,
        },
      }),
      prisma.business.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: businesses,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + businesses.length < total,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error in GET /api/businesses', { error })
    return NextResponse.json(
      { success: false, error: 'Error loading businesses.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId(req);

    if (!userId) {
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
        ownerId: userId,
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
