/**
 * User Profile API
 * GET /api/users/me - Get current user profile
 * PUT /api/users/me - Update current user profile (full update)
 * PATCH /api/users/me - Update current user profile (partial - nickname only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserProfile, updateUserNickname } from '@/lib/forum';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/error-handler';
import { validateNicknameInput } from '@/lib/validations';
import { z } from 'zod';

// Función auxiliar para calcular edad
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Validación completa para actualización de usuario
const userUpdateSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  nickname: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  
  // Validación de Teléfono (Formato Australiano)
  phoneNumber: z.string()
    .regex(/^(\+?61|0)[2-478](?:[ -]?[0-9]){8}$/, "Debe ser un número válido de Australia")
    .optional()
    .or(z.literal("")),

  // Validación de Edad (Ley Australia: +16 años)
  dateOfBirth: z.string().refine((dateString) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    const age = calculateAge(date);
    return age >= 16;
  }, {
    message: "Debes tener al menos 16 años para usar esta plataforma (Ley Australiana).",
  }).optional().or(z.literal("")),
});

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/me
 * Get current user profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const [profile, authInfo] = await Promise.all([
      getUserProfile(session.user.id),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          password: true,
          accounts: { select: { provider: true } },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        hasPassword: !!authInfo?.password,
        isGoogleUser: authInfo?.accounts.some((a) => a.provider === 'google') ?? false,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in GET /api/users/me', { error });
    return handleApiError(error);
  }
}

/**
 * PUT /api/users/me
 * Update current user profile (full update: name, nickname, image)
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = userUpdateSchema.parse(body);

    // Convertir string de fecha a objeto Date para Prisma
    const dob = validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        nickname: validatedData.nickname || null,
        image: validatedData.image || null,
        phoneNumber: validatedData.phoneNumber || null,
        dateOfBirth: dob,
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    logger.error('Error in PUT /api/users/me', { error });
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

/**
 * PATCH /api/users/me
 * Update current user profile (nickname)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = validateNicknameInput(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const user = await updateUserNickname(
      session.user.id,
      validation.data.nickname
    );

    return NextResponse.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error in PATCH /api/users/me', { error });
    return handleApiError(error);
  }
}

/**
 * DELETE /api/users/me
 * Delete current user account permanently
 * This action cascades to delete all user's businesses, reviews, posts, etc.
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Al borrar el usuario, Prisma borrará sus negocios, reseñas, posts, etc.
    // automáticamente gracias al 'onDelete: Cascade' configurado en el schema
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    logger.info('User account deleted', { userId: session.user.id });

    return NextResponse.json({
      success: true,
      message: 'Cuenta eliminada correctamente',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Error in DELETE /api/users/me', { error });
    return NextResponse.json(
      { success: false, error: 'Error interno al eliminar la cuenta' },
      { status: 500 }
    );
  }
}

